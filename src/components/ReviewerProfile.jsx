import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, Button, Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaUserTie, 
  FaBook, 
  FaFilePdf,
  FaGlobe,
  FaGraduationCap,
  FaLanguage,
  FaOrcid,
  FaGoogle
} from "react-icons/fa";

const ReviewerProfile = () => {
    const { reviewerId } = useParams();
    const [reviewer, setReviewer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviewerProfile = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/get-profile/${reviewerId}/`);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviewer profile');
                }
                const data = await response.json();
                setReviewer(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviewerProfile();
    }, [reviewerId]);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    Error loading reviewer profile: {error}
                </Alert>
            </Container>
        );
    }

    if (!reviewer) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Reviewer not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body className="text-center">
                            {reviewer.profile_picture ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${reviewer.profile_picture}`}
                                    alt={reviewer.full_name}
                                    className="rounded-circle mb-3"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="rounded-circle bg-secondary mb-3 mx-auto d-flex align-items-center justify-content-center"
                                    style={{ width: '150px', height: '150px' }}>
                                    <span className="text-white display-4">
                                        {reviewer.full_name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <h3>{reviewer.full_name}</h3>
                            <p className="text-muted">{reviewer.position_title || 'Reviewer'}</p>
                            
                            <div className="d-flex justify-content-center gap-2 mb-3">
                                {reviewer.resume && (
                                    <Button 
                                        variant="outline-primary" 
                                        href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${reviewer.resume}`}
                                        target="_blank"
                                    >
                                        <FaFilePdf className="me-1" /> View Resume
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h4 className="mb-4">Contact Information</h4>
                            
                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaEnvelope className="me-2 text-primary" />
                                        <div>
                                            <strong>Email</strong>
                                            <div>
                                                <a href={`mailto:${reviewer.email}`}>{reviewer.email}</a>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2 text-success" />
                                        <div>
                                            <strong>Phone</strong>
                                            <div>{reviewer.phone_number || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            
                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaUniversity className="me-2 text-info" />
                                        <div>
                                            <strong>Institution</strong>
                                            <div>
                                                {reviewer.institution || 'Not provided'}
                                                {reviewer.department && (
                                                    <div className="text-muted">{reviewer.department}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaUserTie className="me-2 text-warning" />
                                        <div>
                                            <strong>Position</strong>
                                            <div>{reviewer.position_title || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    
                    <Card className="mb-3">
                        <Card.Body>
                            <h4 className="mb-4">Research Information</h4>
                            
                            <div className="mb-3">
                                <h5>Subject Areas</h5>
                                <div className="d-flex flex-wrap gap-1">
                                    {reviewer.subject_areas.map((area) => (
                                        <Badge key={area.id} bg="primary" className="text-wrap">
                                            <FaBook className="me-1" />
                                            {area.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                            {reviewer.research_interests && (
                                <div className="mb-3">
                                    <h5>Research Interests</h5>
                                    <p>{reviewer.research_interests}</p>
                                </div>
                            )}
                            
                            <Row>
                                {reviewer.orcid_id && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaOrcid className="me-2 text-success" />
                                            <div>
                                                <strong>ORCID</strong>
                                                <div>
                                                    <a 
                                                        href={`https://orcid.org/${reviewer.orcid_id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        {reviewer.orcid_id}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {reviewer.google_scholar_profile && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaGoogle className="me-2 text-danger" />
                                            <div>
                                                <strong>Google Scholar</strong>
                                                <div>
                                                    <a 
                                                        href={reviewer.google_scholar_profile} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Profile
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {reviewer.personal_website && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaGlobe className="me-2 text-primary" />
                                            <div>
                                                <strong>Personal Website</strong>
                                                <div>
                                                    <a 
                                                        href={reviewer.personal_website} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        Visit Website
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {reviewer.languages_spoken && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaLanguage className="me-2 text-info" />
                                            <div>
                                                <strong>Languages Spoken</strong>
                                                <div>{reviewer.languages_spoken}</div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                    
                    {reviewer.educations && reviewer.educations.length > 0 && (
                        <Card className="mb-3">
                            <Card.Body>
                                <h4 className="mb-4">Education</h4>
                                {reviewer.educations.map((edu, index) => (
                                    <div key={index} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaGraduationCap className="me-2 text-secondary" />
                                            <div>
                                                <strong>{edu.degree} in {edu.field_of_study}</strong>
                                                <div>{edu.institution}</div>
                                                <div className="text-muted">
                                                    {edu.start_year} - {edu.end_year || 'Present'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ReviewerProfile;