<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowAction extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_instance_id', 'workflow_step_id', 'user_id', 'action', 'feedback'];

    public function workflowInstance()
    {
        return $this->belongsTo(WorkflowInstance::class);
    }

    public function workflowStep()
    {
        return $this->belongsTo(WorkflowStep::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}