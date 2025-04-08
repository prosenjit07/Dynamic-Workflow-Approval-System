<?php

namespace App\Services;

class ConditionCheckerService
{
    public function checkCondition(string $condition, array $data): bool
    {
        if (empty($condition)) {
            return true;
        }

        // Simple condition parser
        // Format: field operator value
        // Example: amount > 500
        $parts = explode(' ', trim($condition));
        
        if (count($parts) < 3) {
            return true;
        }

        $field = $parts[0];
        $operator = $parts[1];
        $value = $parts[2];

        if (!isset($data[$field])) {
            return false;
        }

        $fieldValue = $data[$field];

        switch ($operator) {
            case '=':
            case '==':
                return $fieldValue == $value;
            case '>':
                return $fieldValue > $value;
            case '<':
                return $fieldValue < $value;
            case '>=':
                return $fieldValue >= $value;
            case '<=':
                return $fieldValue <= $value;
            case '!=':
                return $fieldValue != $value;
            default:
                return false;
        }
    }
}