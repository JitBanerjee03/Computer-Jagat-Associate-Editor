import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Card, 
  Badge, 
  Container, 
  Row, 
  Col, 
  Table, 
  ProgressBar,
  Button,
  Alert
} from "react-bootstrap";
import { 
  FaFilePdf, 
  FaDownload, 
  FaStar, 
  FaRegStar, 
  FaStarHalfAlt,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";

const ReviewRecommendation = () => {
  const { journalId } = useParams();
  const [reviewFeedback, setReviewFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getReviewerFeedback = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_DJANGO_URL}/reviewer/review-feedback/journal/${journalId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch reviewer feedback");
        }

        const data = await response.json();
        setReviewFeedback(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getReviewerFeedback();
  }, [journalId]);

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-secondary" />);
      }
    }

    return stars;
  };

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation?.toLowerCase()) {
      case "accept":
        return <Badge bg="success">Accept</Badge>;
      case "minor revisions":
        return <Badge bg="primary">Minor Revisions</Badge>;
      case "major revisions":
        return <Badge bg="warning" text="dark">Major Revisions</Badge>;
      case "reject":
        return <Badge bg="danger">Reject</Badge>;
      default:
        return <Badge bg="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading reviewer feedback...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error loading feedback</Alert.Heading>
          <p>{error}</p>
          <Link to={`/view-journal/${journalId}`} className="btn btn-primary">
            <FaArrowLeft /> Back to Journal
          </Link>
        </Alert>
      </Container>
    );
  }

  if (reviewFeedback.length === 0) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          <Alert.Heading>No Feedback Available</Alert.Heading>
          <p>This journal doesn't have any reviewer feedback yet.</p>
          <Link to={`/view-journal/${journalId}`} className="btn btn-primary">
            <FaArrowLeft /> Back to Journal
          </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reviewer Feedback</h2>
        <Link to={`/view-journal/${journalId}`} className="btn btn-outline-primary">
          <FaArrowLeft /> Back to Journal
        </Link>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="card-title">Feedback Summary</h5>
              <div className="d-flex flex-wrap gap-3">
                <div>
                  <h6>Average Rating</h6>
                  <div className="d-flex align-items-center">
                    {renderRatingStars(
                      reviewFeedback.reduce((acc, curr) => acc + curr.rating, 0) /
                        reviewFeedback.length
                    )}
                    <span className="ms-2">
                      {(
                        reviewFeedback.reduce((acc, curr) => acc + curr.rating, 0) /
                        reviewFeedback.length
                      ).toFixed(1)}
                      /5
                    </span>
                  </div>
                </div>
                <div>
                  <h6>Recommendations</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(
                      reviewFeedback.reduce((acc, curr) => {
                        acc[curr.recommendation] = (acc[curr.recommendation] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([rec, count]) => (
                      <div key={rec}>
                        {getRecommendationBadge(rec)}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <h4 className="mb-3">Detailed Feedback</h4>
          {reviewFeedback.map((feedback) => (
            <Card key={feedback.id} className="mb-4 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Reviewer #{feedback.reviewer}</strong>
                  <span className="ms-3">
                    Submitted on: {new Date(feedback.review_date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  {feedback.is_final_submission ? (
                    <Badge bg="success">Final Submission</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">Draft</Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5>Review Summary</h5>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Rating:</strong>
                        {renderRatingStars(feedback.rating)}
                        <span className="ms-2">{feedback.rating}/5</span>
                      </div>
                      <div className="mb-2">
                        <strong>Recommendation:</strong> {getRecommendationBadge(feedback.recommendation)}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h6>Feedback Comments</h6>
                      <div className="p-3 bg-light rounded">
                        {feedback.feedback_text || "No feedback comments provided"}
                      </div>
                    </div>

                    {feedback.confidential_comments && (
                      <div className="mb-3">
                        <h6>Confidential Comments (Editor Only)</h6>
                        <div className="p-3 bg-light rounded">
                          {feedback.confidential_comments}
                        </div>
                      </div>
                    )}
                  </Col>

                  <Col md={4}>
                    <div className="border-start ps-4">
                      <h5>Attachments</h5>
                      {feedback.file_upload ? (
                        <div className="d-flex align-items-center mb-3">
                          <FaFilePdf className="text-danger me-2" size={24} />
                          <div>
                            <div>Review Document</div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="mt-1"
                              as="a"
                              href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${feedback.file_upload}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaDownload className="me-1" /> Download
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted">No attachments</div>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default ReviewRecommendation;