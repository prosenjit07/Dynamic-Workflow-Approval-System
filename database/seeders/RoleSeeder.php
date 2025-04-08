<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            ['name' => 'Manager', 'description' => 'Department manager'],
            ['name' => 'Finance', 'description' => 'Finance department'],
            ['name' => 'HR', 'description' => 'Human resources'],
            ['name' => 'Director', 'description' => 'Company director'],
            ['name' => 'IT', 'description' => 'IT department'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}