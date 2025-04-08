<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowInstance extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_template_id', 'data', 'current_step_id', 'status'];

    protected $casts = [
        'data' => 'array',
    ];

    public function workflowTemplate()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function currentStep()
    {
        return $this->belongsTo(WorkflowStep::class, 'current_step_id');
    }

    public function actions()
    {
        return $this->hasMany(WorkflowAction::class);
    }
}