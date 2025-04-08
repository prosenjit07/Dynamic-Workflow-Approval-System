<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active'];

    public function steps()
    {
        return $this->hasMany(WorkflowStep::class)->orderBy('order');
    }

    public function instances()
    {
        return $this->hasMany(WorkflowInstance::class);
    }
}