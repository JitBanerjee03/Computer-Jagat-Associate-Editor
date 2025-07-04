import React, { useContext, useEffect, useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaUserTie, 
  FaBook, 
  FaSearch, 
  FaUser, 
  FaUserPlus,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { contextProviderDeclare } from '../store/ContextProvider';

const AssignReviewer = () => {
    const { reviewers } = useContext(contextProviderDeclare);
    const { journalId } = useParams();
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectAreaFilter, setSubjectAreaFilter] = useState('');
    const [loading, setLoading] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const getContextProvider = useContext(contextProviderDeclare);
    const { editor, setjournalAssign } = getContextProvider;
    const [articleDetails, setArticleDetails] = useState({});
    
    useEffect(() => {
        const fetchArticleDetails = async() => {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/detail/${journalId}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setArticleDetails(data);
        };
        fetchArticleDetails();
    }, [journalId]);

    // Check if reviewer is the article author
    const isArticleAuthor = (reviewer) => {
        return articleDetails.user_id && reviewer.user_id === articleDetails.user_id;
    };

    // Get unique subject areas for filter dropdown
    const subjectAreas = [...new Set(
        reviewers?.flatMap(reviewer => 
            reviewer.subject_areas.map(area => area.name)
        ) || []
    )];

    // Filter reviewers based on search term and subject area
    const filteredReviewers = reviewers?.filter(reviewer => {
        const matchesSearch = 
            reviewer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reviewer.institution.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubjectArea = 
            !subjectAreaFilter || 
            reviewer.subject_areas.some(area => 
                area.name.toLowerCase().includes(subjectAreaFilter.toLowerCase())
            );
        
        return matchesSearch && matchesSubjectArea;
    });

    const handleAssign = async (reviewerId) => {
        if (!journalId) {
            setError("No journal ID found in URL params");
            return;
        }

        setLoading(prev => ({ ...prev, [reviewerId]: true }));
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/assign-reviewer/${reviewerId}/${journalId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            
            if (!response.ok) {
                if (data.detail) {
                    throw new Error(data.detail);
                } else if (data.message) {
                    throw new Error(data.message);
                } else if (response.status === 400) {
                    throw new Error('This reviewer is already assigned to this journal');
                } else {
                    throw new Error('Failed to assign reviewer');
                }
            }

            const setStatusReviewing = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/assignments/${journalId}/${editor.associate_editor_id}/set-reviewing/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const dataResponse = await setStatusReviewing.json();
            setjournalAssign(editor.associate_editor_id);
            setSuccess(data.message || 'Reviewer assigned to journal successfully');

            const changeJournalStatus = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/mark-under-review/${journalId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        } catch (err) {
            setError(err.message || 'An error occurred while assigning the reviewer');
        } finally {
            setLoading(prev => ({ ...prev, [reviewerId]: false }));
        }
    };

    return (
        <div className="container-fluid p-3">
            <h4 className="mb-4">Assign Reviewers to Journal #{journalId}</h4>
            
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                    {success}
                </Alert>
            )}
            
            <div className="row mb-3">
                <div className="col-md-6">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by name, email or institution..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </div>
                <div className="col-md-6">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaBook />
                            </InputGroup.Text>
                            <Form.Select
                                value={subjectAreaFilter}
                                onChange={(e) => setSubjectAreaFilter(e.target.value)}
                            >
                                <option value="">All Subject Areas</option>
                                {subjectAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </div>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Institution</th>
                        <th>Position</th>
                        <th>Subject Areas</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReviewers && filteredReviewers.length > 0 ? (
                        filteredReviewers.map((reviewer) => (
                            <tr key={reviewer.id}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        {reviewer.profile_picture ? (
                                            <img 
                                                src={reviewer.profile_picture} 
                                                alt={reviewer.full_name}
                                                className="rounded-circle me-2"
                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="rounded-circle bg-secondary me-2 d-flex align-items-center justify-content-center"
                                                style={{ width: '40px', height: '40px' }}>
                                                <span className="text-white">
                                                    {reviewer.full_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <strong>{reviewer.full_name}</strong>
                                            {isArticleAuthor(reviewer) && (
                                                <div className="text-danger small mt-1">
                                                    <FaExclamationTriangle className="me-1" />
                                                    Conflict: This is the article author
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <div className="mb-1">
                                            <FaEnvelope className="me-2 text-primary" />
                                            <a href={`mailto:${reviewer.email}`}>{reviewer.email}</a>
                                        </div>
                                        {reviewer.phone_number && (
                                            <div>
                                                <FaPhone className="me-2 text-success" />
                                                {reviewer.phone_number}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaUniversity className="me-2 text-info" />
                                        <div>
                                            <div>{reviewer.institution}</div>
                                            {reviewer.department && (
                                                <small className="text-muted">{reviewer.department}</small>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaUserTie className="me-2 text-warning" />
                                        <div>
                                            {reviewer.position_title || 'Not specified'}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-wrap gap-1">
                                        {reviewer.subject_areas.map((area) => (
                                            <Badge key={area.id} bg="primary" className="text-wrap">
                                                <FaBook className="me-1" />
                                                {area.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Link 
                                            to={`/reviewer-profile/${reviewer.id}`} 
                                            className="btn btn-sm btn-info"
                                            title="View Profile"
                                        >
                                            <FaUser className="me-1" />
                                            View
                                        </Link>
                                        {isArticleAuthor(reviewer) ? (
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                disabled
                                                title="Cannot assign article author as reviewer"
                                            >
                                                <FaTimes className="me-1" />
                                                Conflict
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                onClick={() => handleAssign(reviewer.id)}
                                                title="Assign Reviewer"
                                                disabled={loading[reviewer.id]}
                                            >
                                                {loading[reviewer.id] ? (
                                                    <span>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                        Assigning...
                                                    </span>
                                                ) : (
                                                    <span>
                                                        <FaUserPlus className="me-1" />
                                                        Assign
                                                    </span>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">
                                No reviewers found matching your criteria
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default AssignReviewer;