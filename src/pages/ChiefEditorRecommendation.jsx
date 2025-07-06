import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Divider, 
  Chip, 
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Warning,
  Edit,
  Delete,
  ArrowBack,
  Print,
  Download,
  Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

const ChiefEditorRecommendation = () => {
    const { journalId } = useParams();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [noRecommendations, setNoRecommendations] = useState(false);

    useEffect(() => {
        const fetchChiefEditorRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                setNoRecommendations(false);
                
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/by-journal/${journalId}/`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (response.status === 404) {
                    const errorData = await response.json();
                    if (errorData.detail === "No recommendations found for this journal.") {
                        setNoRecommendations(true);
                        return;
                    }
                }

                if (!response.ok) {
                    throw new Error(response.status === 401 ? 
                        'Unauthorized access. Please login again.' : 
                        'Failed to fetch recommendations');
                }

                const data = await response.json();
                setRecommendations(data);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('Unauthorized')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchChiefEditorRecommendations();
    }, [journalId, navigate]);

    const handleEdit = (recId) => {
        navigate(`/edit-recommendation/${recId}`);
    };

    const handleDeleteClick = (rec) => {
        setSelectedRecommendation(rec);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/${selectedRecommendation.id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete recommendation');
            }

            setRecommendations(recommendations.filter(rec => rec.id !== selectedRecommendation.id));
            setDeleteDialogOpen(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = (rec) => {
        const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
        saveAs(blob, `recommendation-${rec.id}.json`);
    };

    const getDecisionIcon = (decision) => {
        switch (decision?.toLowerCase()) {
            case 'accept':
                return <CheckCircle color="success" sx={{ fontSize: 40 }} />;
            case 'reject':
                return <Cancel color="error" sx={{ fontSize: 40 }} />;
            default:
                return <Warning color="warning" sx={{ fontSize: 40 }} />;
        }
    };

    const getDecisionChip = (decision) => {
        switch (decision?.toLowerCase()) {
            case 'accept':
                return <Chip label="Accepted" color="success" icon={<CheckCircle />} />;
            case 'reject':
                return <Chip label="Rejected" color="error" icon={<Cancel />} />;
            default:
                return <Chip label="Pending" color="warning" icon={<Warning />} />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>Loading recommendations...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                    <Typography>Error loading recommendations: {error}</Typography>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 2 }} 
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </Button>
                </Alert>
            </Box>
        );
    }

    if (noRecommendations || recommendations.length === 0) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
                <Alert 
                    severity="info" 
                    icon={<Info fontSize="large" />}
                    sx={{ width: '100%', maxWidth: 600, mb: 3 }}
                >
                    <Typography variant="h6" gutterBottom>
                        No Recommendations Found
                    </Typography>
                    <Typography>
                        There are currently no recommendations available for this journal.
                    </Typography>
                </Alert>
                <Button 
                    variant="contained" 
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2 }}
                >
                    Return to Journal
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 'md', margin: '0 auto', p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                }}>
                    Editor-in-Chief Decision
                </Typography>
                <Box>
                    <Tooltip title="Print">
                        <IconButton onClick={handlePrint} sx={{ mr: 1 }}>
                            <Print />
                        </IconButton>
                    </Tooltip>
                    <Button 
                        variant="outlined" 
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                </Box>
            </Box>
            
            {recommendations.map((rec) => (
                <Card key={rec.id} sx={{ 
                    mb: 4, 
                    boxShadow: 3,
                    borderLeft: `4px solid ${
                        rec.recommendation?.toLowerCase() === 'accept' ? 
                        '#4caf50' : rec.recommendation?.toLowerCase() === 'reject' ? 
                        '#f44336' : '#ff9800'
                    }`,
                    position: 'relative'
                }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Box display="flex" alignItems="center" gap={2}>
                                {getDecisionIcon(rec.recommendation)}
                                <Box>
                                    <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
                                        Decision for: {rec.journal_title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        By Editor-in-Chief: {rec.editor_name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box textAlign="right">
                                {getDecisionChip(rec.recommendation)}
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    {rec.decision_date ? 
                                        `Decision date: ${format(new Date(rec.decision_date), 'MMMM d, yyyy - h:mm a')}` : 
                                        'No decision date'}
                                </Typography>
                                {rec.is_final_decision && (
                                    <Chip 
                                        label="Final Decision" 
                                        color="primary" 
                                        size="small" 
                                        sx={{ mt: 1 }} 
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box position="absolute" top={16} right={16}>
                            {/*<Tooltip title="Edit">
                                <IconButton 
                                    onClick={() => handleEdit(rec.id)}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>*/}
                            {/*<Tooltip title="Delete">
                                <IconButton 
                                    onClick={() => handleDeleteClick(rec)}
                                    color="error"
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>*/}
                            {/*<Tooltip title="Download">
                                <IconButton 
                                    onClick={() => handleDownload(rec)}
                                    color="secondary"
                                    sx={{ ml: 1 }}
                                >
                                    <Download />
                                </IconButton>
                            </Tooltip>*/}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ 
                                fontWeight: 'bold',
                                color: 'primary.dark'
                            }}>
                                Evaluation Summary
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6
                            }}>
                                {rec.decision_summary || 'No summary provided'}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ 
                                fontWeight: 'bold',
                                color: 'primary.dark'
                            }}>
                                Final Decision Notes
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6
                            }}>
                                {rec.decision_notes || 'No additional notes'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            ))}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the recommendation for "{selectedRecommendation?.journal_title}"?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChiefEditorRecommendation;