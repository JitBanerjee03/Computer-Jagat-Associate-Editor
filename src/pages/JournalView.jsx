import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const JournalView = () => {
  const { journalId } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/detail/${journalId}/`
        );
        setJournal(response.data);
      } catch (err) {
        setError(err.message || "Failed to load journal");
      } finally {
        setLoading(false);
      }
    };

    fetchJournal();
  }, [journalId]);

  const handleViewPdf = () => {
    setShowPdf(!showPdf);
    setIframeKey(prevKey => prevKey + 1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        Error loading journal: {error}
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="alert alert-warning m-4">
        Journal not found
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg mb-4">
        <div className="col-lg-8 p-3 p-lg-5 pt-lg-3">
          <h1 className="display-6 fw-bold lh-1 text-body-emphasis">{journal.title}</h1>
          {journal.author_name_text && (
            <p className="text-muted">by {journal.author_name_text}</p>
          )}
          <p className="lead">{journal.abstract}</p>
          
          <div className="mb-3">
            <span className="badge bg-primary me-2">{journal.language}</span>
            {journal.keywords.split(', ').map((keyword, index) => (
              <span key={index} className="badge bg-secondary me-2">{keyword}</span>
            ))}
          </div>
          
          <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-4 mb-lg-3">
            <button 
              type="button" 
              className="btn btn-primary btn-sm px-4 me-md-2 fw-bold"
              onClick={handleViewPdf}
            >
              {showPdf ? 'Hide Manuscript' : 'View Manuscript'}
            </button>
            <a
              href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${journal.manuscript_file}`}
              className="btn btn-outline-secondary btn-sm px-4"
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Download PDF
            </a>
          </div>
          
          {showPdf && (
            <div className="pdf-viewer-container mt-3 border p-2" style={{ height: '500px' }}>
              {journal.manuscript_file ? (
                <iframe 
                  key={iframeKey}
                  src={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${journal.manuscript_file}#view=fitH`}
                  title="Journal Manuscript"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  onError={() => console.error('Failed to load PDF')}
                >
                  <p>Your browser does not support iframes. 
                    <a href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${journal.manuscript_file}`} download>Download PDF instead</a>
                  </p>
                </iframe>
              ) : (
                <div className="alert alert-warning">
                  PDF file not available for viewing
                </div>
              )}
            </div>
          )}
          
          <small className="text-muted">
            Submitted on: {new Date(journal.submission_date).toLocaleDateString()}
          </small>
        </div>
        <div className="col-lg-4 p-0 overflow-hidden">
          <div className="p-3 bg-light rounded">
            <h5>Submission Details</h5>
            <ul className="list-unstyled">
              <li><strong>Status:</strong> {journal.status}</li>
              <li><strong>Section:</strong> {journal.journal_section}</li>
              {journal.supplementary_files && (
                <li>
                  <strong>Supplementary Files:</strong> 
                  <a 
                    href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${journal.supplementary_files}`} 
                    className="ms-2"
                    download
                  >
                    Download
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalView;