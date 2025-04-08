import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowDetail from './components/WorkflowDetail';
import Layout from './components/Layout';
import './app.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="builder" element={<WorkflowBuilder />} />
                    <Route path="builder/:id" element={<WorkflowBuilder />} />
                    <Route path="workflow/:id" element={<WorkflowDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);