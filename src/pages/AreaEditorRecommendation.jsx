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
  Alert,
  Rating,
  Stack
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Warning,
  ArrowBack,
  Print,
  Download,
  Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

const AreaEditorRecommendation = () => {
    const { journalId } = useParams();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noRecommendations, setNoRecommendations] = useState(false);

    useEffect(() => {
        const fetchAreaEditorRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                setNoRecommendations(false);
                
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/recommendations/by-journal/${journalId}/`,
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
        
        fetchAreaEditorRecommendations();
    }, [journalId, navigate]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = (rec) => {
        const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
        saveAs(blob, `area-editor-recommendation-${rec.id}.json`);
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
                        There are currently no area editor recommendations available for this journal.
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
                    Area Editor Recommendation
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
                                        Recommendation for: {rec.journal_title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        By Area Editor: {rec.area_editor_name}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box textAlign="right">
                                {getDecisionChip(rec.recommendation)}
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    {rec.submitted_at ? 
                                        `Submitted on: ${format(new Date(rec.submitted_at), 'MMMM d, yyyy - h:mm a')}` : 
                                        'No submission date'}
                                </Typography>
                            </Box>
                        </Box>

                        {/*<Box position="absolute" top={16} right={16}>
                            <Tooltip title="Download">
                                <IconButton 
                                    onClick={() => handleDownload(rec)}
                                    color="secondary"
                                    sx={{ ml: 1 }}
                                >
                                    <Download />
                                </IconButton>
                            </Tooltip>
                        </Box>*/}

                        <Divider sx={{ my: 2 }} />

                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ 
                                fontWeight: 'bold',
                                color: 'primary.dark'
                            }}>
                                Summary
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6
                            }}>
                                {rec.summary || 'No summary provided'}
                            </Typography>
                        </Box>

                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom sx={{ 
                                fontWeight: 'bold',
                                color: 'primary.dark'
                            }}>
                                Justification
                            </Typography>
                            <Typography variant="body1" sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6
                            }}>
                                {rec.justification || 'No justification provided'}
                            </Typography>
                        </Box>

                        <Box mb={3}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 'bold',
                                    color: 'primary.dark'
                                }}>
                                    Overall Rating:
                                </Typography>
                                <Rating 
                                    value={rec.overall_rating || 0} 
                                    max={5} 
                                    readOnly 
                                    precision={0.5}
                                />
                                <Typography>({rec.overall_rating || 'Not rated'}/5)</Typography>
                            </Stack>
                        </Box>

                        {rec.public_comments_to_author && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ 
                                    fontWeight: 'bold',
                                    color: 'primary.dark'
                                }}>
                                    Public Comments to Author
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.6
                                }}>
                                    {rec.public_comments_to_author}
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default AreaEditorRecommendation;