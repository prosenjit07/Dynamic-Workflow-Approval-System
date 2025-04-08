import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    CardActions, 
    Button, 
    Chip,
    Box,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';

function Dashboard() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [instances, setInstances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [workflowData, setWorkflowData] = useState({});
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [templatesRes, instancesRes] = await Promise.all([
                    axios.get('/api/workflow-templates'),
                    axios.get('/api/workflow-instances')
                ]);
                setTemplates(templatesRes.data);
                setInstances(instancesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'in_progress': return 'info';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const startWorkflow = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSelectedTemplate(template);
            setWorkflowData({});
            setError('');
            setOpenDialog(true);
        }
    };

    const handleDataChange = (key, value) => {
        setWorkflowData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmitWorkflow = async () => {
        setSubmitting(true);
        setError('');
        
        try {
            const response = await axios.post('/api/workflow-instances', {
                workflow_template_id: selectedTemplate.id,
                data: workflowData
            });
            
            // Close dialog and navigate to the new workflow
            setOpenDialog(false);
            navigate(`/workflow/${response.data.id}`);
            
        } catch (error) {
            console.error('Error starting workflow:', error);
            setError(error.response?.data?.error || 'Failed to start workflow');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Active Workflows
            </Typography>
            <Grid container spacing={3}>
                {instances.length > 0 ? (
                    instances.map(instance => (
                        <Grid item xs={12} md={6} lg={4} key={instance.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {instance.workflow_template.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                            Status:
                                        </Typography>
                                        <Chip 
                                            label={instance.status.replace('_', ' ')} 
                                            color={getStatusColor(instance.status)}
                                            size="small"
                                        />
                                    </Box>
                                    {instance.current_step && (
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Current Step: {instance.current_step.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Assigned to: {instance.current_step.role.name}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        component={Link} 
                                        to={`/workflow/${instance.id}`}
                                    >
                                        View Details
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">
                            No active workflows found.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                Workflow Templates
            </Typography>
            <Grid container spacing={3}>
                {templates.length > 0 ? (
                    templates.map(template => (
                        <Grid item xs={12} md={6} lg={4} key={template.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {template.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {template.description || 'No description'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Steps: {template.steps.length}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        size="small" 
                                        component={Link} 
                                        to={`/builder/${template.id}`}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        size="small" 
                                        onClick={() => startWorkflow(template.id)}
                                    >
                                        Start Workflow
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1" color="text.secondary">
                            No workflow templates found.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {/* Dialog for starting a new workflow */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Start New Workflow: {selectedTemplate?.name}</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter the data required for this workflow:
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Amount"
                                type="number"
                                value={workflowData.amount || ''}
                                onChange={(e) => handleDataChange('amount', parseFloat(e.target.value))}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Category"
                                value={workflowData.category || ''}
                                onChange={(e) => handleDataChange('category', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={workflowData.description || ''}
                                onChange={(e) => handleDataChange('description', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitWorkflow} 
                        variant="contained" 
                        color="primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Starting...' : 'Start Workflow'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default Dashboard;