<?php

namespace App\Http\Controllers;

use App\Models\WorkflowInstance;
use App\Models\WorkflowTemplate;
use App\Models\WorkflowAction;
use App\Services\ConditionCheckerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WorkflowInstanceController extends Controller
{
    protected $conditionChecker;

    public function __construct(ConditionCheckerService $conditionChecker)
    {
        $this->conditionChecker = $conditionChecker;
    }

    public function index()
    {
        $instances = WorkflowInstance::with(['workflowTemplate', 'currentStep.role', 'actions'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($instances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workflow_template_id' => 'required|exists:workflow_templates,id',
            'data' => 'required|array',
        ]);

        $template = WorkflowTemplate::with('steps')->findOrFail($validated['workflow_template_id']);
        
        if ($template->steps->isEmpty()) {
            return response()->json(['error' => 'Workflow template has no steps'], 400);
        }

        // Get the first step
        $firstStep = $template->steps->sortBy('order')->first();

        // Check if the first step's condition is met
        if (!$this->conditionChecker->checkCondition($firstStep->condition ?? '', $validated['data'])) {
            return response()->json(['error' => 'Initial condition not met'], 400);
        }

        $instance = WorkflowInstance::create([
            'workflow_template_id' => $validated['workflow_template_id'],
            'data' => $validated['data'],
            'current_step_id' => $firstStep->id,
            'status' => 'in_progress',
        ]);

        return response()->json(
            WorkflowInstance::with(['workflowTemplate', 'currentStep.role'])->find($instance->id),
            201
        );
    }

    public function show(WorkflowInstance $workflowInstance)
    {
        return response()->json(
            $workflowInstance->load(['workflowTemplate', 'currentStep.role', 'actions.user'])
        );
    }

    public function approve(Request $request, WorkflowInstance $workflowInstance)
    {
        $user = Auth::user();
        
        if ($workflowInstance->status !== 'in_progress') {
            return response()->json(['error' => 'Workflow is not in progress'], 400);
        }

        $currentStep = $workflowInstance->currentStep;
        
        // Check if user has the required role
        if ($user->role_id !== $currentStep->role_id) {
            return response()->json(['error' => 'You do not have permission to approve this step'], 403);
        }

        return DB::transaction(function () use ($workflowInstance, $user, $currentStep, $request) {
            // Record the action
            WorkflowAction::create([
                'workflow_instance_id' => $workflowInstance->id,
                'workflow_step_id' => $currentStep->id,
                'user_id' => $user->id,
                'action' => 'approve',
                'feedback' => $request->input('feedback'),
            ]);

            // Get the next step
            $template = $workflowInstance->workflowTemplate;
            $nextStep = $template->steps()
                ->where('order', '>', $currentStep->order)
                ->orderBy('order')
                ->first();

            if ($nextStep) {
                // Check if the next step's condition is met
                if ($this->conditionChecker->checkCondition($nextStep->condition ?? '', $workflowInstance->data)) {
                    $workflowInstance->update([
                        'current_step_id' => $nextStep->id,
                    ]);
                } else {
                    // Skip steps until we find one with a condition that is met
                    $validStep = null;
                    $remainingSteps = $template->steps()
                        ->where('order', '>', $currentStep->order)
                        ->orderBy('order')
                        ->get();

                    foreach ($remainingSteps as $step) {
                        if ($this->conditionChecker->checkCondition($step->condition ?? '', $workflowInstance->data)) {
                            $validStep = $step;
                            break;
                        }
                    }

                    if ($validStep) {
                        $workflowInstance->update([
                            'current_step_id' => $validStep->id,
                        ]);
                    } else {
                        // No valid steps left, workflow is approved
                        $workflowInstance->update([
                            'current_step_id' => null,
                            'status' => 'approved',
                        ]);
                    }
                }
            } else {
                // No more steps, workflow is approved
                $workflowInstance->update([
                    'current_step_id' => null,
                    'status' => 'approved',
                ]);
            }

            return response()->json(
                WorkflowInstance::with(['workflowTemplate', 'currentStep.role', 'actions.user'])->find($workflowInstance->id)
            );
        });
    }

    public function reject(Request $request, WorkflowInstance $workflowInstance)
    {
        $request->validate([
            'feedback' => 'required|string',
        ]);

        $user = Auth::user();
        
        if ($workflowInstance->status !== 'in_progress') {
            return response()->json(['error' => 'Workflow is not in progress'], 400);
        }

        $currentStep = $workflowInstance->currentStep;
        
        // Check if user has the required role
        if ($user->role_id !== $currentStep->role_id) {
            return response()->json(['error' => 'You do not have permission to reject this step'], 403);
        }

        return DB::transaction(function () use ($workflowInstance, $user, $currentStep, $request) {
            // Record the action
            WorkflowAction::create([
                'workflow_instance_id' => $workflowInstance->id,
                'workflow_step_id' => $currentStep->id,
                'user_id' => $user->id,
                'action' => 'reject',
                'feedback' => $request->input('feedback'),
            ]);

            // Update the workflow instance
            $workflowInstance->update([
                'current_step_id' => null,
                'status' => 'rejected',
            ]);

            return response()->json(
                WorkflowInstance::with(['workflowTemplate', 'currentStep.role', 'actions.user'])->find($workflowInstance->id)
            );
        });
    }
}