import React, { useState, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import axios from 'axios';

const AssociateEditorProfile = ({ associateEditor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [subjectAreas, setSubjectAreas] = useState([]);
  const [journalSections, setJournalSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, getValues, control } = useForm();

  // Initialize form with associate editor data
  useEffect(() => {
    if (associateEditor) {
      // Fetch subject areas and journal sections
      const fetchData = async () => {
        try {
          const [subjectsRes, sectionsRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/subject-areas/`),
            axios.get(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/journal-sections/`)
          ]);
          
          setSubjectAreas(subjectsRes.data);
          setJournalSections(sectionsRes.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();

      // Set form values (excluding name and email since they're not editable)
      reset({
        phone_number: associateEditor.phone_number || '',
        institution: associateEditor.institution || '',
        department: associateEditor.department || '',
        position_title: associateEditor.position_title || '',
        orcid_id: associateEditor.orcid_id || '',
        research_interests: associateEditor.research_interests || '',
        google_scholar_profile: associateEditor.google_scholar_profile || '',
        scopus_id: associateEditor.scopus_id || '',
        web_of_science_id: associateEditor.web_of_science_id || '',
        linkedin_profile: associateEditor.linkedin_profile || '',
        editor_bio: associateEditor.editor_bio || '',
        country: associateEditor.country || '',
        language_proficiency: associateEditor.language_proficiency || '',
        subject_areas: associateEditor.subject_areas?.map(sa => sa.id) || [],
        journal_sections: associateEditor.journal_sections?.map(js => js.id) || []
      });

      setPreviewImage(
        associateEditor.profile_picture 
          ? `${import.meta.env.VITE_BACKEND_DJANGO_URL}${associateEditor.profile_picture}`
          : '/default-profile.png'
      );
      
      setIsLoading(false);
    }
  }, [associateEditor, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    setCvFile(file);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(data).forEach(key => {
        if (key === 'subject_areas' || key === 'journal_sections') {
          // Handle array fields
          data[key].forEach(item => formData.append(key, item));
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      // Append files if they exist
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      if (cvFile) {
        formData.append('cv', cvFile);
      }
      
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/associate-editor/update/${associateEditor.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      alert('Successfully Updated Profile');
      setIsEditing(false);
      // You might want to refresh the associate editor data here
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Associate Editor Profile</h3>
            <button 
              className={`btn ${isEditing ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center mb-4">
                  <div className="position-relative">
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="img-thumbnail mb-2" 
                      style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    />
                    <input
                      type="file"
                      id="profilePicture"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label 
                      htmlFor="profilePicture" 
                      className="btn btn-sm btn-outline-primary position-absolute bottom-0 start-50 translate-middle-x"
                    >
                      Change
                    </label>
                  </div>

                  <div className="mt-3">
                    <label className="form-label">CV (PDF/DOC)</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvChange}
                    />
                    {associateEditor.cv && !cvFile && (
                      <small className="text-muted">Current: {associateEditor.cv.split('/').pop()}</small>
                    )}
                  </div>
                </div>

                <div className="col-md-9">
                  {/* Display name and email as read-only in edit mode */}
                  <div className="mb-3">
                    <h4>{associateEditor.user_full_name}</h4>
                    <p className="text-muted">
                      <i className="bi bi-envelope me-2"></i>
                      {associateEditor.user_email}
                    </p>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        {...register('phone_number')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">ORCID ID</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('orcid_id')}
                        placeholder="0000-0000-0000-0000"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Institution</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('institution')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('department')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Position Title</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('position_title')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('country')}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Research Interests</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        {...register('research_interests')}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Editor Bio</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        {...register('editor_bio')}
                        placeholder="Brief biography that will be displayed on the journal website"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Google Scholar Profile</label>
                      <input
                        type="url"
                        className="form-control"
                        {...register('google_scholar_profile')}
                        placeholder="https://scholar.google.com/..."
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Scopus ID</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('scopus_id')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Web of Science ID</label>
                      <input
                        type="text"
                        className="form-control"
                        {...register('web_of_science_id')}
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">LinkedIn Profile</label>
                      <input
                        type="url"
                        className="form-control"
                        {...register('linkedin_profile')}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Language Proficiency</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        {...register('language_proficiency')}
                        placeholder="List languages you're proficient in (e.g., English - fluent, Spanish - intermediate)"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Subject Areas</label>
                      <select
                        multiple
                        className="form-select"
                        {...register('subject_areas')}
                      >
                        {subjectAreas.map(area => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label">Journal Sections</label>
                      <select
                        multiple
                        className="form-select"
                        {...register('journal_sections')}
                      >
                        {journalSections.map(section => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">Hold Ctrl/Cmd to select multiple</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer bg-light">
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary px-4">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 text-center mb-4">
                <img 
                  src={associateEditor.profile_picture 
                    ? `${import.meta.env.VITE_BACKEND_DJANGO_URL}${associateEditor.profile_picture}`
                    : '/default-profile.png'} 
                  alt="Profile" 
                  className="img-thumbnail" 
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                {associateEditor.cv && (
                  <div className="mt-3">
                    <a 
                      href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${associateEditor.cv}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      View CV
                    </a>
                  </div>
                )}
              </div>

              <div className="col-md-9">
                <h4>{associateEditor.user_full_name}</h4>
                {associateEditor.position_title && <p className="text-muted mb-1">{associateEditor.position_title}</p>}
                {associateEditor.institution && <p className="text-muted mb-1">{associateEditor.institution}</p>}
                {associateEditor.department && <p className="text-muted mb-1">{associateEditor.department}</p>}
                {associateEditor.country && <p className="text-muted mb-1">{associateEditor.country}</p>}

                <ul className="list-unstyled mt-3">
                  {associateEditor.phone_number && (
                    <li className="mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      {associateEditor.phone_number}
                    </li>
                  )}
                  <li className="mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    {associateEditor.user_email}
                  </li>
                  {associateEditor.orcid_id && (
                    <li className="mb-1">
                      <i className="bi bi-person-badge me-2"></i>
                      ORCID: {associateEditor.orcid_id}
                    </li>
                  )}
                </ul>

                {associateEditor.research_interests && (
                  <div className="mt-4">
                    <h5>Research Interests</h5>
                    <p>{associateEditor.research_interests}</p>
                  </div>
                )}

                {associateEditor.editor_bio && (
                  <div className="mt-4">
                    <h5>Bio</h5>
                    <p>{associateEditor.editor_bio}</p>
                  </div>
                )}

                {(associateEditor.google_scholar_profile || associateEditor.scopus_id || associateEditor.web_of_science_id || associateEditor.linkedin_profile) && (
                  <div className="mt-4">
                    <h5>Profiles</h5>
                    <ul className="list-unstyled">
                      {associateEditor.google_scholar_profile && (
                        <li className="mb-1">
                          <i className="bi bi-google me-2"></i>
                          <a href={associateEditor.google_scholar_profile} target="_blank" rel="noopener noreferrer">
                            Google Scholar
                          </a>
                        </li>
                      )}
                      {associateEditor.scopus_id && (
                        <li className="mb-1">
                          <i className="bi bi-journal me-2"></i>
                          Scopus ID: {associateEditor.scopus_id}
                        </li>
                      )}
                      {associateEditor.web_of_science_id && (
                        <li className="mb-1">
                          <i className="bi bi-journal me-2"></i>
                          Web of Science ID: {associateEditor.web_of_science_id}
                        </li>
                      )}
                      {associateEditor.linkedin_profile && (
                        <li className="mb-1">
                          <i className="bi bi-linkedin me-2"></i>
                          <a href={associateEditor.linkedin_profile} target="_blank" rel="noopener noreferrer">
                            LinkedIn Profile
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {associateEditor.language_proficiency && (
                  <div className="mt-4">
                    <h5>Language Proficiency</h5>
                    <p>{associateEditor.language_proficiency}</p>
                  </div>
                )}

                {associateEditor.subject_areas?.length > 0 && (
                  <div className="mt-4">
                    <h5>Subject Areas</h5>
                    <div className="d-flex flex-wrap gap-2">
                      {associateEditor.subject_areas.map(area => (
                        <span key={area.id} className="badge bg-primary">
                          {area.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {associateEditor.journal_sections?.length > 0 && (
                  <div className="mt-4">
                    <h5>Journal Sections</h5>
                    <ul className="list-unstyled">
                      {associateEditor.journal_sections.map(section => (
                        <li key={section.id}>{section.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociateEditorProfile;