import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faSignOutAlt,
  faGraduationCap,
  faTools,
  faFileAlt,
  faPlusCircle,
  faPen,
  faUpload,
  faUserCircle,
  faSlidersH,
  faBriefcase,
  faUserFriends,
  faMedal,
  faCog,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

function Profile({ user, profilePicture, setProfilePicture, onSignOut }) {
  const [qualifications, setQualifications] = useState([]);
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState([]);
  const [newQualification, setNewQualification] = useState({ university: '', degree: '', fieldOfStudy: '' });
  const [newSkill, setNewSkill] = useState('');
  const [showEduModal, setShowEduModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    if (user?.email) {
      axios.get(`http://localhost:4000/profile?email=${user.email}`)
        .then(res => {
          const data = res.data;
          setQualifications(data.qualifications || []);
          setExperience(data.experience_years || '');
          setSkills(data.skills || []);
          setProfilePicture(data.profile_picture || '');
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, [user]);

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicture(reader.result);
    reader.readAsDataURL(file);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };

  const handleEduChange = (e) => {
    const { name, value } = e.target;
    setNewQualification(prev => ({ ...prev, [name]: value }));
  };

  const addQualification = async () => {
    try {
      const updated = [...qualifications, newQualification];

      await axios.post('http://localhost:4000/profile/update', {
        email: user.email,
        experience_years: experience,
        skills,
        profile_picture: profilePicture,
        qualifications: updated
      });

      setQualifications(updated);
      setNewQualification({ university: '', degree: '', fieldOfStudy: '' });
      setShowEduModal(false);
    } catch (err) {
      console.error('Failed to add qualification:', err);
    }
  };

  const handleSkillModalSave = async () => {
    try {
      await axios.post('http://localhost:4000/profile/update', {
        email: user.email,
        experience_years: experience,
        skills,
        profile_picture: profilePicture,
        qualifications,
      });
      setShowSkillModal(false);
    } catch (err) {
      console.error('Failed to save skills:', err);
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img src={profilePicture || '/images/avatars/user2.png'} alt="Profile" className="avatar" />
            <input id="profile-upload" type="file" hidden onChange={handleProfileUpload} />
            <label htmlFor="profile-upload" className="upload-btn">
              <FontAwesomeIcon icon={faCamera} />
            </label>
          </div>
          <p>{user.full_name}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <ul className="sidebar-menu">
          <li className="active"><FontAwesomeIcon icon={faUserCircle} /> Profile</li>
          <li><FontAwesomeIcon icon={faSlidersH} /> Job preferences</li>
          <li><FontAwesomeIcon icon={faBriefcase} /> Job activity</li>
          <li><FontAwesomeIcon icon={faUserFriends} /> Following</li>
          <li><FontAwesomeIcon icon={faMedal} /> Contributions</li>
          <li><FontAwesomeIcon icon={faCog} /> Account settings</li>
          <li><FontAwesomeIcon icon={faBell} /> Notifications</li>
        </ul>
        <button className="sign-out" onClick={onSignOut}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Sign out
        </button>
        <button className="help-button">Help Center</button>
      </aside>

      {/* Main Profile Content */}
      <main className="profile-content">
        <h2>Profile</h2>

        {/* Education Section */}
        <div className="info-card">
          <div className="info-header">
            <h3>
              <FontAwesomeIcon icon={faGraduationCap} style={{ marginRight: '8px', color: '#194aad' }} />
              Education
            </h3>
            <FontAwesomeIcon icon={faPlusCircle} className="edit-icon" onClick={() => setShowEduModal(true)} />
          </div>
          {qualifications.map((q, index) => (
            <div key={index} className="info-field">
              <strong>{q.degree} in {q.field_of_study}</strong>
              <span>{q.university}</span>
            </div>
          ))}
        </div>

        {/* Skills & Experience Section */}
        <div className="info-card">
          <div className="info-header">
            <h3>
              <FontAwesomeIcon icon={faTools} style={{ marginRight: '8px', color: '#194aad' }} />
              Skills & Experience
            </h3>
            <FontAwesomeIcon icon={faPen} className="edit-icon" onClick={() => setShowSkillModal(true)} />
          </div>
          <div className="info-field">
            <strong>Experience</strong>
            <span>{experience} years</span>
          </div>
          <div className="info-field">
            <strong>Skills</strong>
            <span>{skills.join(', ') || 'None'}</span>
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="resume-section">
          <h3>
            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: '8px', color: '#194aad' }} />
            Resume
          </h3>
          <p>Add a resume to autofill job applications.</p>
          <label className="upload-resume" htmlFor="resume-upload">
            <FontAwesomeIcon icon={faUpload} className="upload-icon" />
            <p>Upload Resume</p>
            <small>PDF, DOCX, DOC, RTF, TXT</small>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx,.rtf,.txt"
              hidden
              onChange={handleResumeUpload}
            />
          </label>
          {resumeFile && (
            <div style={{ marginTop: '10px' }}>
              Selected file: <strong>{resumeFile.name}</strong>
            </div>
          )}
        </div>
      </main>

      {/* Education Modal */}
      {showEduModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Education</h3>
            <div className="form-group">
              <label>University</label>
              <input name="university" value={newQualification.university} onChange={handleEduChange} />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input name="degree" value={newQualification.degree} onChange={handleEduChange} />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input name="fieldOfStudy" value={newQualification.fieldOfStudy} onChange={handleEduChange} />
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowEduModal(false)}>Cancel</button>
              <button className="save-button" onClick={addQualification}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {showSkillModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Skills & Experience</h3>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Skills</label>
              <div className="skills-input">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
                <button type="button" onClick={addSkill}>Add</button>
              </div>
              <div className="skills-list">
                {skills.map((skill, i) => (
                  <span key={i} className="skill-tag" onClick={() => removeSkill(skill)}>{skill} ✕</span>
                ))}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowSkillModal(false)}>Cancel</button>
              <button className="save-button" onClick={handleSkillModalSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
