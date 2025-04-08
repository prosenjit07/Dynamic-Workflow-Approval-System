<?php

namespace App\Http\Controllers;

use App\Models\WorkflowTemplate;
use App\Models\WorkflowStep;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkflowTemplateController extends Controller
{
    public function index()
    {
        $templates = WorkflowTemplate::with('steps.role')->get();
        return response()->json($templates);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'steps' => 'required|array|min:1',
            'steps.*.role_id' => 'required|exists:roles,id',
            'steps.*.name' => 'required|string|max:255',
            'steps.*.condition' => 'nullable|string',
            'steps.*.order' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated) {
            $template = WorkflowTemplate::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            foreach ($validated['steps'] as $step) {
                WorkflowStep::create([
                    'workflow_template_id' => $template->id,
                    'role_id' => $step['role_id'],
                    'name' => $step['name'],
                    'condition' => $step['condition'] ?? null,
                    'order' => $step['order'],
                ]);
            }

            return response()->json(
                WorkflowTemplate::with('steps.role')->find($template->id),
                201
            );
        });
    }

    public function show(WorkflowTemplate $workflowTemplate)
    {
        return response()->json($workflowTemplate->load('steps.role'));
    }

    public function update(Request $request, WorkflowTemplate $workflowTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'steps' => 'required|array|min:1',
            'steps.*.id' => 'nullable|exists:workflow_steps,id',
            'steps.*.role_id' => 'required|exists:roles,id',
            'steps.*.name' => 'required|string|max:255',
            'steps.*.condition' => 'nullable|string',
            'steps.*.order' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $workflowTemplate) {
            $workflowTemplate->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Delete existing steps not in the update
            $stepIds = collect($validated['steps'])->pluck('id')->filter()->all();
            $workflowTemplate->steps()->whereNotIn('id', $stepIds)->delete();

            foreach ($validated['steps'] as $step) {
                if (isset($step['id'])) {
                    WorkflowStep::where('id', $step['id'])->update([
                        'role_id' => $step['role_id'],
                        'name' => $step['name'],
                        'condition' => $step['condition'] ?? null,
                        'order' => $step['order'],
                    ]);
                } else {
                    WorkflowStep::create([
                        'workflow_template_id' => $workflowTemplate->id,
                        'role_id' => $step['role_id'],
                        'name' => $step['name'],
                        'condition' => $step['condition'] ?? null,
                        'order' => $step['order'],
                    ]);
                }
            }

            return response()->json(
                WorkflowTemplate::with('steps.role')->find($workflowTemplate->id)
            );
        });
    }

    public function destroy(WorkflowTemplate $workflowTemplate)
    {
        $workflowTemplate->delete();
        return response()->json(null, 204);
    }
}