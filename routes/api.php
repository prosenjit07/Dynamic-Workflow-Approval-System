<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\WorkflowTemplateController;
use App\Http\Controllers\WorkflowInstanceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Roles
Route::apiResource('roles', RoleController::class);

// Workflow Templates
Route::apiResource('workflow-templates', WorkflowTemplateController::class);

// Workflow Instances
Route::apiResource('workflow-instances', WorkflowInstanceController::class)->except(['update', 'destroy']);
Route::post('workflow-instances/{workflowInstance}/approve', [WorkflowInstanceController::class, 'approve']);
Route::post('workflow-instances/{workflowInstance}/reject', [WorkflowInstanceController::class, 'reject']);