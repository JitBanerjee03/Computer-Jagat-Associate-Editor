import React, { useContext, useState } from 'react';
import { Table, Badge, Form, InputGroup, Alert } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaUserTie, 
  FaBook, 
  FaSearch,
  FaCheck,
  FaTimes,
  FaInfoCircle,
  FaEye
} from 'react-icons/fa';
import { contextProviderDeclare } from '../store/ContextProvider';
import { Link } from 'react-router-dom';

const ReviewerStatus = () => {
    const { reviewers, unApprovedReviewers } = useContext(contextProviderDeclare);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectAreaFilter, setSubjectAreaFilter] = useState('');
    const [activeTab, setActiveTab] = useState('approved');

    // Combine all subject areas from both approved and pending reviewers
    const allSubjectAreas = [...new Set([
        ...(reviewers || []).flatMap(reviewer => 
            reviewer.subject_areas?.map(area => area.name) || []
        ),
        ...(unApprovedReviewers || []).flatMap(reviewer => 
            reviewer.subject_areas?.map(area => area.name) || []
        )
    ])].filter(Boolean);

    // Filter function for both approved and pending reviewers
    const filterReviewers = (reviewersList) => {
        return reviewersList?.filter(reviewer => {
            const matchesSearch = 
                reviewer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reviewer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                reviewer.institution?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesSubjectArea = 
                !subjectAreaFilter || 
                reviewer.subject_areas?.some(area => 
                    area.name.toLowerCase().includes(subjectAreaFilter.toLowerCase())
                );
            
            return matchesSearch && matchesSubjectArea;
        }) || [];
    };

    const filteredApproved = filterReviewers(reviewers);
    const filteredPending = filterReviewers(unApprovedReviewers);

    return (
        <div className="container-fluid p-3">
            <h4 className="mb-4">Reviewer Status</h4>
            
            {/* Search and Filter Controls */}
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
                                {allSubjectAreas.map((area, index) => (
                                    <option key={index} value={area}>{area}</option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </div>
            </div>

            {/* Approved Reviewers Section */}
            <h5 className="mt-4">Approved Reviewers</h5>
            {filteredApproved.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Institution</th>
                            <th>Position</th>
                            <th>Subject Areas</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApproved.map(reviewer => (
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
                                                    {reviewer.full_name?.charAt(0)?.toUpperCase() || 'R'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <strong>{reviewer.full_name || 'Unknown Reviewer'}</strong>
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
                                            <div>{reviewer.institution || 'Not specified'}</div>
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
                                        {reviewer.subject_areas?.length > 0 ? (
                                            reviewer.subject_areas.map(area => (
                                                <Badge key={area.id} bg="primary" className="text-wrap">
                                                    <FaBook className="me-1" />
                                                    {area.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge bg="secondary">No subject areas</Badge>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="success" className="d-flex align-items-center">
                                        <FaCheck className="me-1" />
                                        Approved
                                    </Badge>
                                </td>
                                <td>
                                    <Link 
                                        to={`/reviewer-profile/${reviewer.id}`}
                                        className="btn btn-sm btn-info"
                                        title="View Full Profile"
                                    >
                                        <FaEye className="me-1" />
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <div className="text-center py-4">
                    <FaInfoCircle size={32} className="text-muted mb-2" />
                    <p>{reviewers?.length === 0 ? "No approved reviewers found" : "No matching approved reviewers found"}</p>
                </div>
            )}

            {/* Pending Reviewers Section */}
            <h5 className="mt-5">Pending Reviewers</h5>
            {filteredPending.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Institution</th>
                            <th>Position</th>
                            <th>Subject Areas</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPending.map(reviewer => (
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
                                                    {reviewer.full_name?.charAt(0)?.toUpperCase() || 'R'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <strong>{reviewer.full_name || 'Unknown Reviewer'}</strong>
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
                                            <div>{reviewer.institution || 'Not specified'}</div>
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
                                        {reviewer.subject_areas?.length > 0 ? (
                                            reviewer.subject_areas.map(area => (
                                                <Badge key={area.id} bg="primary" className="text-wrap">
                                                    <FaBook className="me-1" />
                                                    {area.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <Badge bg="secondary">No subject areas</Badge>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <Badge bg="warning" className="text-dark d-flex align-items-center">
                                        <FaTimes className="me-1" />
                                        Pending
                                    </Badge>
                                </td>
                                <td>
                                    <Link 
                                        to={`/reviewer/${reviewer.id}`}
                                        className="btn btn-sm btn-info"
                                        title="View Full Profile"
                                    >
                                        <FaEye className="me-1" />
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <div className="text-center py-4">
                    <FaInfoCircle size={32} className="text-muted mb-2" />
                    <p>{unApprovedReviewers?.length === 0 ? "No pending reviewers found" : "No matching pending reviewers found"}</p>
                </div>
            )}
        </div>
    );
};

export default ReviewerStatus;