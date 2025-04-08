<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = ['workflow_template_id', 'role_id', 'name', 'condition', 'order'];

    public function workflowTemplate()
    {
        return $this->belongsTo(WorkflowTemplate::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function actions()
    {
        return $this->hasMany(WorkflowAction::class);
    }
}