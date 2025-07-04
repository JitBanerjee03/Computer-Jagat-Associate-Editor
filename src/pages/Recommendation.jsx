import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import "./styles/Recommendation.css";
import { contextProviderDeclare } from "../store/ContextProvider";

const Recommendation = () => {
    const { editor,setjournalAssign } = useContext(contextProviderDeclare);
    const { journalID } = useParams();

    const handleSubmitBtn=async()=>{
        const setStatusReviewing=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/assignments/${journalID}/${editor.associate_editor_id}/set-completed/`,{
            method:'PATCH',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${yourToken}`,
            },
        })

        const data=await setStatusReviewing.json();

        setjournalAssign(editor.associate_editor_id);

        navigate('/assigned-journals');
    }

    const [formData, setFormData] = useState({
        recommendation: "",
        summary: "",
        overall_rating: "3", // Default value matching model
        justification: "",
        public_comments_to_author: ""
    });
    
    const navigate=useNavigate();

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [journalDetails, setJournalDetails] = useState(null);

    // Fetch journal details on component mount
    useEffect(() => {
        const fetchJournalDetails = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/detail/${journalID}/`
                );
                setJournalDetails(response.data);
            } catch (err) {
                console.error("Failed to fetch journal details:", err);
            }
        };
        
        fetchJournalDetails();
    }, [journalID]);

    const validateForm = () => {
        const errors = {};
        
        if (!formData.recommendation) {
            errors.recommendation = "Recommendation is required";
        }
        
        if (!formData.summary || formData.summary.trim().length < 20) {
            errors.summary = "Summary must be at least 20 characters";
        }
        
        if (!formData.overall_rating || formData.overall_rating < 1 || formData.overall_rating > 5) {
            errors.overall_rating = "Please select a valid rating (1-5)";
        }
        
        if (!formData.justification || formData.justification.trim().length < 50) {
            errors.justification = "Justification must be at least 50 characters";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/recommendations/submit/${journalID}/${editor.associate_editor_id}/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                }
            );
            
            if (response.status === 200 || response.status === 201) {
                setSubmitSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 
                    err.response?.data?.detail || 
                    "Failed to submit recommendation");

            alert('Recommendation already exists')
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="success-container">
                <h2 className="success-heading">Recommendation Submitted Successfully!</h2>
                <p className="success-message">
                    Your recommendation for "{journalDetails?.title || 'Journal'}" has been submitted.
                </p>
                <div className="success-details">
                    <p><strong>Recommendation:</strong> {formData.recommendation}</p>
                    <p><strong>Rating:</strong> {formData.overall_rating}/5</p>
                </div>
                <button 
                    onClick={() => handleSubmitBtn()}
                    className="success-button"
                >
                    Return to Journal
                </button>
            </div>
        );
    }

    return (
        <div className="recommendation-container">
            <div className="journal-header">
                <h1 className="recommendation-title">Submit Recommendation</h1>
                {journalDetails && (
                    <div className="journal-info">
                        <h2 className="journal-title">{journalDetails.title}</h2>
                        <p className="journal-authors">
                            {journalDetails.authors?.join(', ') || 'Unknown authors'}
                        </p>
                    </div>
                )}
            </div>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="recommendation-form">
                <div className="form-group">
                    <label className="form-label">
                        Recommendation *
                    </label>
                    <select
                        name="recommendation"
                        value={formData.recommendation}
                        onChange={handleChange}
                        className={`form-select ${formErrors.recommendation ? 'error' : ''}`}
                        required
                    >
                        <option value="">Select a recommendation</option>
                        <option value="accept">Accept</option>
                        <option value="minor_revision">Minor Revision</option>
                        <option value="major_revision">Major Revision</option>
                        <option value="reject">Reject</option>
                    </select>
                    {formErrors.recommendation && (
                        <span className="error-text">{formErrors.recommendation}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label className="form-label">
                        Summary *
                    </label>
                    <textarea
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        className={`form-textarea ${formErrors.summary ? 'error' : ''}`}
                        placeholder="Brief summary of your evaluation (min. 20 characters)"
                        required
                    />
                    {formErrors.summary && (
                        <span className="error-text">{formErrors.summary}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label className="form-label">
                        Overall Rating (1-5) *
                    </label>
                    <div className="rating-options">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="rating-option">
                                <input
                                    type="radio"
                                    name="overall_rating"
                                    value={rating}
                                    checked={formData.overall_rating === String(rating)}
                                    onChange={handleChange}
                                />
                                <span className="rating-label">{rating}</span>
                            </label>
                        ))}
                    </div>
                    {formErrors.overall_rating && (
                        <span className="error-text">{formErrors.overall_rating}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label className="form-label">
                        Justification *
                    </label>
                    <textarea
                        name="justification"
                        value={formData.justification}
                        onChange={handleChange}
                        className={`form-textarea large ${formErrors.justification ? 'error' : ''}`}
                        placeholder="Detailed justification for your recommendation (min. 50 characters)"
                        required
                    />
                    {formErrors.justification && (
                        <span className="error-text">{formErrors.justification}</span>
                    )}
                </div>
                
                <div className="form-group">
                    <label className="form-label">
                        Public Comments to Author
                    </label>
                    <textarea
                        name="public_comments_to_author"
                        value={formData.public_comments_to_author}
                        onChange={handleChange}
                        className="form-textarea large"
                        placeholder="Constructive feedback for the author (will be visible to them)"
                    />
                    <p className="form-hint">
                        These comments will be visible to the author(s)
                    </p>
                </div>
                
                <div className="form-actions">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner"></span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Recommendation'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Recommendation;