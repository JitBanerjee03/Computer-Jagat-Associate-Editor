import { useEffect, useState } from "react";
import { Table, Badge, Spinner, Alert, Form, InputGroup, Button } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaCalendarAlt, FaBook, FaUser, FaCheck, FaTimes, FaInfoCircle, FaSearch, FaFilter } from 'react-icons/fa';

const ReviewerFeedBack = () => {
    const [reviewerAssignment, setReviewerAssignment] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [subjectAreaFilter, setSubjectAreaFilter] = useState('all');
    
    useEffect(() => {
        const fetchReviewerAssignment = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/reviewer-assignments/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch reviewer assignments');
                }

                const data = await response.json();
                setReviewerAssignment(data);
                setFilteredAssignments(data); // Initialize filtered data with all assignments
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviewerAssignment();
    }, []);

    // Apply filters whenever search terms or filters change
    useEffect(() => {
        const filtered = reviewerAssignment.filter(assignment => {
            // Search by journal ID (exact match)
            const matchesJournalId = searchTerm === '' || 
                assignment.journal_id.toString().includes(searchTerm);
            
            // Filter by status
            const matchesStatus = statusFilter === 'all' || 
                assignment.status === statusFilter;
            
            // Filter by subject area
            const matchesSubjectArea = subjectAreaFilter === 'all' || 
                (assignment.subject_area_name && 
                 assignment.subject_area_name.toLowerCase().includes(subjectAreaFilter.toLowerCase()));
            
            return matchesJournalId && matchesStatus && matchesSubjectArea;
        });
        setFilteredAssignments(filtered);
    }, [searchTerm, statusFilter, subjectAreaFilter, reviewerAssignment]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return <Badge bg="success"><FaCheck /> Completed</Badge>;
            case 'rejected':
                return <Badge bg="danger"><FaTimes /> Rejected</Badge>;
            default:
                return <Badge bg="primary">Assigned</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Get unique subject areas for filter dropdown
    const subjectAreas = [...new Set(
        reviewerAssignment
            .map(assignment => assignment.subject_area_name)
            .filter(name => name) // Remove null/undefined
    )];

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setSubjectAreaFilter('all');
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-3">
                Error: {error}
            </Alert>
        );
    }

    return (
        <div className="container-fluid p-4">
            <h3 className="mb-4">Reviewer Assignments</h3>
            
            {/* Search and Filter Controls */}
            <div className="row mb-4 g-3">
                <div className="col-md-4">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search by Journal ID"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>
                </div>
                
                <div className="col-md-3">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaFilter />
                            </InputGroup.Text>
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="assigned">Assigned</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </div>
                
                <div className="col-md-3">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaBook />
                            </InputGroup.Text>
                            <Form.Select
                                value={subjectAreaFilter}
                                onChange={(e) => setSubjectAreaFilter(e.target.value)}
                            >
                                <option value="all">All Subject Areas</option>
                                {subjectAreas.map((area, index) => (
                                    <option key={index} value={area}>{area}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </div>
                
                <div className="col-md-2">
                    <Button 
                        variant="outline-secondary" 
                        onClick={resetFilters}
                        className="w-100"
                    >
                        Reset Filters
                    </Button>
                </div>
            </div>
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Journal ID</th>
                        <th>Reviewer</th>
                        <th>Contact</th>
                        <th>Subject Area</th>
                        <th>Assigned Date</th>
                        <th>Completed Date</th>
                        <th>Status</th>
                        <th>Rejection Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => (
                            <tr key={assignment.id}>
                                <td>#{assignment.journal_id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaUser className="me-2" />
                                        {assignment.reviewer_name}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex flex-column">
                                        <div>
                                            <FaEnvelope className="me-2" />
                                            <a href={`mailto:${assignment.reviewer_email}`}>
                                                {assignment.reviewer_email}
                                            </a>
                                        </div>
                                        <div>
                                            <FaPhone className="me-2" />
                                            {assignment.reviewer_phone}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="info" className="d-flex align-items-center">
                                        <FaBook className="me-1" />
                                        {assignment.subject_area_name || 'Not specified'}
                                    </Badge>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <FaCalendarAlt className="me-2" />
                                        {formatDate(assignment.assigned_date)}
                                    </div>
                                </td>
                                <td>
                                    {assignment.completed_date ? (
                                        <div className="d-flex align-items-center">
                                            <FaCalendarAlt className="me-2" />
                                            {formatDate(assignment.completed_date)}
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td>
                                    {getStatusBadge(assignment.status)}
                                </td>
                                <td>
                                    {assignment.rejection_reason || '-'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">
                                <div className="d-flex flex-column align-items-center py-4">
                                    <FaInfoCircle size={32} className="text-muted mb-2" />
                                    <span>No matching assignments found</span>
                                    <Button 
                                        variant="link" 
                                        onClick={resetFilters}
                                        className="mt-2"
                                    >
                                        Clear filters
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ReviewerFeedBack;