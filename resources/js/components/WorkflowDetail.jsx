import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Typography, 
    Box, 
    Paper, 
    Grid,
    Button,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider,
    Chip,
    Alert,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

function WorkflowDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [instance, setInstance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [processing, setProcessing] = useState(false);
    
    // Mock user role - in a real app, this would come from authentication
    const currentUserRole = 1; // Assuming role ID 1 for demo purposes
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/workflow-instances/${id}`);
                setInstance(response.data);
            } catch (error) {
                console.error('Error fetching workflow instance:', error);
                setError('Failed to load workflow data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);
    
    const handleApprove = async () => {
        setProcessing(true);
        try {
            const response = await axios.post(`/api/workflow-instances/${id}/approve`);
            setInstance(response.data);
        } catch (error) {
            console.error('Error approving workflow step:', error);
            setError('Failed to approve the workflow step');
        } finally {
            setProcessing(false);
        }
    };
    
    const handleReject = async () => {
        if (!feedback.trim()) {
            setError('Feedback is required when rejecting a step');
            return;
        }
        
        setProcessing(true);
        try {
            const response = await axios.post(`/api/workflow-instances/${id}/reject`, {
                feedback
            });
            setInstance(response.data);
            setOpenRejectDialog(false);
        } catch (error) {
            console.error('Error rejecting workflow step:', error);
            setError('Failed to reject the workflow step');
        } finally {
            setProcessing(false);
        }
    };
    
    const getStepStatus = (stepOrder) => {
        if (!instance || !instance.workflow_template || !instance.workflow_template.steps) {
            return 'inactive';
        }
        
        const currentStepOrder = instance.current_step ? instance.current_step.order : null;
        
        if (instance.status === 'rejected') {
            // Find the step where rejection happened
            const rejectionAction = instance.actions.find(action => action.action === 'reject');
            if (rejectionAction) {
                const rejectedStep = instance.workflow_template.steps.find(
                    step => step.id === rejectionAction.workflow_step_id
                );
                if (rejectedStep && rejectedStep.order === stepOrder) {
                    return 'rejected';
                }
                if (rejectedStep && stepOrder < rejectedStep.order) {
                    return 'completed';
                }
            }
            return 'inactive';
        }
        
        if (instance.status === 'approved') {
            return 'completed';
        }
        
        if (stepOrder < currentStepOrder) {
            return 'completed';
        } else if (stepOrder === currentStepOrder) {
            return 'active';
        } else {
            return 'inactive';
        }
    };
    
    const canTakeAction = () => {
        if (!instance || !instance.current_step) {
            return false;
        }
        
        return instance.status === 'in_progress' && 
               instance.current_step.role_id === currentUserRole;
    };
    
    if (loading) {
        return <LinearProgress />;
    }
    
    if (!instance) {
        return (
            <Alert severity="error">
                Workflow instance not found or could not be loaded.
            </Alert>
        );
    }
    
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Workflow Details
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">
                            {instance.workflow_template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {instance.workflow_template.description || 'No description'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Typography variant="body2" sx={{ mr: 1 }}>Status:</Typography>
                            <Chip 
                                label={instance.status.replace('_', ' ')} 
                                color={
                                    instance.status === 'approved' ? 'success' :
                                    instance.status === 'rejected' ? 'error' :
                                    instance.status === 'in_progress' ? 'info' : 'default'
                                }
                            />
                        </Box>
                    </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                    Workflow Progress
                </Typography>
                
                <Stepper 
                    activeStep={instance.current_step ? instance.current_step.order - 1 : instance.workflow_template.steps.length}
                    alternativeLabel
                    sx={{ mb: 3 }}
                >
                    {instance.workflow_template.steps.map((step, index) => {
                        const status = getStepStatus(step.order);
                        return (
                            <Step key={step.id}>
                                <StepLabel
                                    error={status === 'rejected'}
                                    StepIconProps={{
                                        icon: status === 'rejected' ? <CancelIcon color="error" /> : step.order,
                                        completed: status === 'completed'
                                    }}
                                >
                                    {step.name}
                                    <Typography variant="caption" display="block">
                                        {step.role.name}
                                    </Typography>
                                </StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                    Workflow Data
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            {Object.entries(instance.data).map(([key, value]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <Typography variant="body2" color="text.secondary">
                                        {key}:
                                    </Typography>
                                    <Typography variant="body1">
                                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
                
                {instance.current_step && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Current Step: {instance.current_step.name}
                        </Typography>
                        
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">
                                    Assigned to:
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {instance.current_step.role.name}
                                </Typography>
                                
                                {instance.current_step.condition && (
                                    <>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Condition:
                                        </Typography>
                                        <Typography variant="body1">
                                            {instance.current_step.condition}
                                        </Typography>
                                    </>
                                )}
                                
                                {canTakeAction() && (
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            startIcon={<CheckCircleIcon />}
                                            onClick={handleApprove}
                                            disabled={processing}
                                        >
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="error" 
                                            startIcon={<CancelIcon />}
                                            onClick={() => setOpenRejectDialog(true)}
                                            disabled={processing}
                                        >
                                            Reject
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
                
                <Typography variant="h6" gutterBottom>
                    Activity History
                </Typography>
                
                {instance.actions.length > 0 ? (
                    instance.actions.map((action, index) => {
                        const step = instance.workflow_template.steps.find(s => s.id === action.workflow_step_id);
                        return (
                            <Card key={action.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body1">
                                                Step: {step ? step.name : 'Unknown Step'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Action: 
                                                <Chip 
                                                    label={action.action} 
                                                    color={action.action === 'approve' ? 'success' : 'error'}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                By: {action.user ? action.user.name : 'Unknown User'}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Date: {new Date(action.created_at).toLocaleString()}
                                            </Typography>
                                            {action.feedback && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Feedback:
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {action.feedback}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No actions have been taken yet.
                    </Typography>
                )}
            </Paper>
            
            <Box sx={{ mb: 3 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                    Back to Dashboard
                </Button>
            </Box>
            
            <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
                <DialogTitle>Reject Workflow Step</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please provide feedback explaining why you are rejecting this step.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Feedback"
                        fullWidth
                        multiline
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        error={!feedback.trim() && error.includes('Feedback')}
                        helperText={!feedback.trim() && error.includes('Feedback') ? 'Feedback is required' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRejectDialog(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleReject} color="error" disabled={processing}>
                        {processing ? 'Processing...' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default WorkflowDetail;