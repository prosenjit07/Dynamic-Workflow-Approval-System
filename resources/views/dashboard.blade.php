<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - {{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div id="app">
        <!-- Navigation -->
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <h1 class="text-xl font-bold">DynamicWorkflow</h1>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <a href="/" class="text-gray-500 hover:text-gray-700 px-3 py-2">Home</a>
                            <a href="/dashboard" class="text-blue-500 px-3 py-2 border-b-2 border-blue-500">Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div class="px-4 py-6 sm:px-0">
                <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Dashboard content here -->
                        <div class="bg-white p-4 rounded-lg shadow">
                            <h3 class="text-lg font-semibold">Tasks</h3>
                            <p class="text-gray-600">Manage your tasks</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow">
                            <h3 class="text-lg font-semibold">Workflows</h3>
                            <p class="text-gray-600">View active workflows</p>
                        </div>
                        <div class="bg-white p-4 rounded-lg shadow">
                            <h3 class="text-lg font-semibold">Reports</h3>
                            <p class="text-gray-600">Analytics and reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>