import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Typography, 
    Box, 
    TextField, 
    Button, 
    Paper, 
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Alert,
    LinearProgress
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function WorkflowBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [workflow, setWorkflow] = useState({
        name: '',
        description: '',
        is_active: true,
        steps: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch roles
                const rolesRes = await axios.get('/api/roles');
                setRoles(rolesRes.data);
                
                // If editing an existing workflow, fetch its data
                if (id) {
                    const workflowRes = await axios.get(`/api/workflow-templates/${id}`);
                    setWorkflow(workflowRes.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setWorkflow(prev => ({ ...prev, [name]: value }));
    };

    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...workflow.steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setWorkflow(prev => ({ ...prev, steps: updatedSteps }));
    };

    const addStep = () => {
        const newStep = {
            role_id: roles.length > 0 ? roles[0].id : '',
            name: '',
            condition: '',
            order: workflow.steps.length + 1
        };
        setWorkflow(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
    };

    const removeStep = (index) => {
        const updatedSteps = workflow.steps.filter((_, i) => i !== index);
        // Update order for remaining steps
        const reorderedSteps = updatedSteps.map((step, i) => ({
            ...step,
            order: i + 1
        }));
        setWorkflow(prev => ({ ...prev, steps: reorderedSteps }));
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        
        const items = Array.from(workflow.steps);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update order for all steps
        const updatedSteps = items.map((step, index) => ({
            ...step,
            order: index + 1
        }));
        
        setWorkflow(prev => ({ ...prev, steps: updatedSteps }));
    };

    const saveWorkflow = async () => {
        if (!workflow.name) {
            setError('Workflow name is required');
            return;
        }
        
        if (workflow.steps.length === 0) {
            setError('At least one step is required');
            return;
        }
        
        for (const step of workflow.steps) {
            if (!step.name || !step.role_id) {
                setError('All steps must have a name and role');
                return;
            }
        }
        
        setSaving(true);
        setError('');
        
        try {
            if (id) {
                await axios.put(`/api/workflow-templates/${id}`, workflow);
            } else {
                await axios.post('/api/workflow-templates', workflow);
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving workflow:', error);
            setError('Failed to save workflow. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {id ? 'Edit Workflow Template' : 'Create Workflow Template'}
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Workflow Name"
                            name="name"
                            value={workflow.name}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={workflow.description || ''}
                            onChange={handleInputChange}
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
            </Paper>
            
            <Typography variant="h5" gutterBottom>
                Workflow Steps
            </Typography>
            
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                    {(provided) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {workflow.steps.map((step, index) => (
                                <Draggable key={index} draggableId={`step-${index}`} index={index}>
                                    {(provided) => (
                                        <Card 
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{ mb: 2 }}
                                        >
                                            <CardHeader
                                                title={`Step ${index + 1}`}
                                                action={
                                                    <IconButton onClick={() => removeStep(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                            />
                                            <Divider />
                                            <CardContent>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Step Name"
                                                            value={step.name}
                                                            onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                                                            required
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={6}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Assigned Role</InputLabel>
                                                            <Select
                                                                value={step.role_id}
                                                                onChange={(e) => handleStepChange(index, 'role_id', e.target.value)}
                                                                label="Assigned Role"
                                                                required
                                                            >
                                                                {roles.map(role => (
                                                                    <MenuItem key={role.id} value={role.id}>
                                                                        {role.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Condition (e.g., amount > 500)"
                                                            value={step.condition || ''}
                                                            onChange={(e) => handleStepChange(index, 'condition', e.target.value)}
                                                            helperText="Leave blank if no condition is needed"
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
            
            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={addStep}
                >
                    Add Step
                </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={saveWorkflow}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Workflow'}
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate('/')}
                >
                    Cancel
                </Button>
            </Box>
        </Box>
    );
}

export default WorkflowBuilder;