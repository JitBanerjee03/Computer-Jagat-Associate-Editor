import React, { useState } from 'react';
import { Table, Alert, Badge, Form, Row, Col, Button, Card } from 'react-bootstrap';
import { FaInfoCircle, FaEye, FaCheckCircle, FaArchive, FaSearch, FaFilter, FaUserPlus, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AssignedJournals = ({ assignments }) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectAreaFilter, setSubjectAreaFilter] = useState('all');
  const [journalSectionFilter, setJournalSectionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Format date to MM-DD format
  const formatDate = (dateString) => {
    if (!dateString) return '~';
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // Extract unique values for filters
  const statusOptions = ['all', 'assigned', 'reviewing', 'completed'];
  const subjectAreas = [...new Set(assignments?.flatMap(a => 
    a.subject_area ? a.subject_area.split(',').map(s => s.trim()) : ['General']
  ))];
  const journalSections = [...new Set(assignments?.flatMap(a => 
    a.journal_section ? a.journal_section.split(',').map(s => s.trim()) : ['General']
  ))];

  // Filter assignments based on search and filters
  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.journal_id.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || assignment.status === statusFilter;
    
    const matchesSubjectArea = 
      subjectAreaFilter === 'all' || 
      (assignment.subject_area && assignment.subject_area.includes(subjectAreaFilter));
    
    const matchesJournalSection = 
      journalSectionFilter === 'all' || 
      (assignment.journal_section && assignment.journal_section.includes(journalSectionFilter));
    
    return matchesSearch && matchesStatus && matchesSubjectArea && matchesJournalSection;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubjectAreaFilter('all');
    setJournalSectionFilter('all');
  };

  // Count assignments by status for summary cards
  const statusCounts = assignments?.reduce((acc, assignment) => {
    acc[assignment.status] = (acc[assignment.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-md-12">
          <Alert variant="info">
            <FaInfoCircle /> Has a recently submitted manuscript disappeared from this list? 
            Check the <a href="#archive" className="alert-link">ARCHIVE tab</a> above! 
            Rejected/published manuscripts are moved to the ARCHIVE tab.
          </Alert>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-3">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Assignments</Card.Title>
              <Card.Text className="display-6">
                {assignments?.length || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Subject Areas</Card.Title>
              <Card.Text>
                {subjectAreas.slice(0, 3).join(', ')}
                {subjectAreas.length > 3 && ` +${subjectAreas.length - 3} more`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Journal Sections</Card.Title>
              <Card.Text>
                {journalSections.slice(0, 3).join(', ')}
                {journalSections.length > 3 && ` +${journalSections.length - 3} more`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-12">
          <Form>
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group controlId="searchTerm">
                  <Form.Label>Search</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search by ID, title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <FaSearch />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6} className="text-end">
                <Button 
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="me-2"
                >
                  <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>

            {showFilters && (
              <Row className="mt-3">
                <Col md={4}>
                  <Form.Group controlId="statusFilter">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                          {statusCounts && option !== 'all' ? ` (${statusCounts[option] || 0})` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="subjectAreaFilter">
                    <Form.Label>Subject Area</Form.Label>
                    <Form.Select
                      value={subjectAreaFilter}
                      onChange={(e) => setSubjectAreaFilter(e.target.value)}
                    >
                      <option value="all">All Subject Areas</option>
                      {subjectAreas.map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="journalSectionFilter">
                    <Form.Label>Journal Section</Form.Label>
                    <Form.Select
                      value={journalSectionFilter}
                      onChange={(e) => setJournalSectionFilter(e.target.value)}
                    >
                      <option value="all">All Journal Sections</option>
                      {journalSections.map(section => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="row">
        <div className="col-md-12">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>MM-DD Submit</th>
                <th>Section</th>
                <th>Authors</th>
                <th>Title</th>
                <th>Subject Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments && filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.journal_id}>
                    <td>{assignment.journal_id}</td>
                    <td>{formatDate(assignment.assigned_date)}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {assignment.journal_section?.split(',').map((section, i) => (
                          <Badge key={i} bg="secondary" className="text-wrap">
                            {section.trim()}
                          </Badge>
                        )) || 'General'}
                      </div>
                    </td>
                    <td>{assignment.author_name}</td>
                    <td>{assignment.title}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {assignment.subject_area?.split(',').map((area, i) => (
                          <Badge key={i} bg="info" className="text-wrap">
                            {area.trim()}
                          </Badge>
                        )) || 'General'}
                      </div>
                    </td>
                    <td>
                      <Badge 
                        bg={
                          assignment.status === 'assigned' ? 'info' :
                          assignment.status === 'reviewing' ? 'warning' :
                          assignment.status === 'completed' ? 'success' : 'secondary'
                        }
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                    <td>
                      <Link 
                        to={`/view-journal/${assignment.journal_id}`} 
                        className="btn btn-sm btn-primary me-1"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      {assignment.status !== 'completed' && (
                        <>
                          <Link
                            to={`/journal/${assignment.journal_id}/recommendation`}
                            className="btn btn-sm btn-success me-1"
                            title="Submit Recommendation"
                          >
                            <FaCheckCircle />
                          </Link>

                          <Link
                            to={`/assign-reviewer/${assignment.journal_id}`}
                            className="btn btn-sm btn-info me-1"
                            title="Assign Reviewer"
                          >
                            <FaUserPlus />
                          </Link>
                        </>
                      )}
                      <Link
                        to={`/reviewer-feedback/${assignment.journal_id}/`}
                        className="btn btn-sm btn-warning me-1"
                        title="Reviewer Feedback"
                      >
                        <FaComments />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    {assignments?.length === 0 
                      ? 'You don\'t have any journal assignments yet.' 
                      : 'No assignments match your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AssignedJournals;