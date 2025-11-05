import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './jobs.css';
import CategoryChips from './CategoryChips';

// === Modal Component ===
const QualificationModal = ({ show, onClose, onSubmit, formData, setFormData }) => {
    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Enter Your Qualifications</h2>
                <input name="degree" placeholder="Degree" value={formData.degree} onChange={handleChange} />
                <input name="field" placeholder="Field of Study" value={formData.field} onChange={handleChange} />
                <input name="skills" placeholder="Skills (comma-separated)" value={formData.skills} onChange={handleChange} />
                <input name="experience" placeholder="Experience (e.g., 3 years)" value={formData.experience} onChange={handleChange} />
                <div className="modal-actions">
                    <button className="get-jobs-btn" onClick={onSubmit}>Get All Jobs</button>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>
            </div>
        </div>
    );
};

// === Job Card Component ===
function Job({ job, onSelect, selected }) {
    const isSelected = selected && selected.id === job.id;
    return (
        <div className={`job-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(job)}>
            <div className="job-details">
                <h3 className="job-title">{job.job_title}</h3>
                <p className="job-company">{job.company}</p>
                <div className="job-info-row">
                    <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                    <span><i className="fas fa-user"></i> {job.experience}</span>
                </div>
            </div>
            <div className="job-meta-row">
                <div className="job-deadline">
                    <i className="fas fa-calendar-alt"></i> Deadline:
                    <strong style={{ margin: "0 4px" }}>
                        {new Date(job.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </strong>
                </div>
                <div className="job-site">
                    <i className="fas fa-globe"></i> <span>{job.site_name || 'N/A'}</span>
                </div>
            </div>
        </div>
    );
}

// === Main Component ===
function Jobs({ isLoggedIn, setShowLogin }) {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 12;
    const [selectedChip, setSelectedChip] = useState('All');


    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        degree: '',
        field: '',
        skills: '',
        experience: ''
    });

    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState(["React Developer", "Marketing Executive"]);
    const [suggestions, setSuggestions] = useState([
        "Software Engineer",
        "Web Developer",
        "UI/UX Designer",
        "Sales Representative",
        "Customer Support Executive"
    ]);


    useEffect(() => {
        axios.get('http://localhost:3012/api/fetchjobs')
            .then(response => {
                const parsedJobs = response.data.map(job => {
                    const safeParse = (field) => {
                        if (!field || field === 'N/A') return [];
                        try {
                            const parsed = JSON.parse(field);
                            return Array.isArray(parsed) ? parsed : [parsed];
                        } catch {
                            return field.split(',').map(s => s.trim());
                        }
                    };
                    return {
                        ...job,
                        education: safeParse(job.education),
                        skill: safeParse(job.skill),
                        site_name: job.site_name || 'Unknown',
                        category: job.category || '', // ✅ Add this line to make chip filtering work
                    };
                });
                setJobs(parsedJobs);
                setFilteredJobs(parsedJobs);
            })
            .catch(error => console.error('Error fetching jobs:', error));
    }, []);

    useEffect(() => {
        if (selectedChip === 'All') {
            setFilteredJobs(jobs);
        } else {
            const chipFiltered = jobs.filter(job =>
                job.category && job.category.toLowerCase() === selectedChip.toLowerCase()
            );
            setFilteredJobs(chipFiltered);
        }
        setCurrentPage(1);
    }, [selectedChip, jobs]);


    const handleSearch = () => {
        const searchKeywords = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
        const locationKeywords = categoryFilter.toLowerCase().split(/\s+/).filter(Boolean);

        const result = jobs.filter((job) => {
            const jobTitle = job.job_title.toLowerCase();
            const jobLocation = job.location.toLowerCase();

            // If no search keywords, consider it a match
            const titleMatch = searchKeywords.length === 0 || searchKeywords.some(kw => jobTitle.includes(kw));

            // If no location keywords, consider it a match
            const locationMatch = locationKeywords.length === 0 || locationKeywords.some(kw => jobLocation.includes(kw));

            // Return jobs where either title matches OR location matches (or both)
            return titleMatch && locationMatch;
        });
        
        if (searchTerm.trim() !== '') {
            const updated = [...new Set([searchTerm, ...recentSearches])].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
        }

        setFilteredJobs(result);
        setCurrentPage(1);
        setShowSuggestions(false);
    };



    const handleSearchTermClick = (term) => {
        setSearchTerm(term);
        handleSearch();
    };

    const handleRemoveRecent = (index) => {
        const updated = [...recentSearches];
        updated.splice(index, 1);
        setRecentSearches(updated);
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

 const handleQualificationSubmit = () => {
  const userDegreeWords = formData.degree.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const userFieldWords = formData.field.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const userSkills = formData.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  // If no filters entered, return all jobs
  if (
    userDegreeWords.length === 0 &&
    userFieldWords.length === 0 &&
    userSkills.length === 0
  ) {
    setFilteredJobs(jobs);
    setCurrentPage(1);
    closeModal();
    return;
  }

  const matchedJobs = jobs.filter(job => {
    const jobEducation = job.education.map(e => e.toLowerCase());
    const jobSkills = job.skill.map(s => s.toLowerCase());

    // Match degree or field (any word) in education
    const educationMatchesDegree = userDegreeWords.some(dw =>
      jobEducation.some(edu => edu.includes(dw))
    );
    const educationMatchesField = userFieldWords.some(fw =>
      jobEducation.some(edu => edu.includes(fw))
    );

    // Match any skill partially
    const skillsMatch = userSkills.length === 0
      ? false
      : userSkills.some(us =>
          jobSkills.some(js => js.includes(us))
        );

    // Return true if any of these matches
    return educationMatchesDegree || educationMatchesField || skillsMatch;
  });

  setFilteredJobs(matchedJobs);
  setCurrentPage(1);
  closeModal();
};


    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    const startIndex = (currentPage - 1) * jobsPerPage;
    const visibleJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);

    return (
        <div className="job-board">
            <div className="job-search-container">
                <div className="job-title">
                    <h1>Discover Opportunities That Fit Your Future</h1>
                    <p>Browse jobs by title, company, or location — and take the next step in your career</p>
                </div>

                <div className="combined-search-wrapper">
                    <div className="combined-search-input">
                        {/* Job Title Input */}
                        <div
                            className={`input-group ${searchTerm ? 'active' : ''}`}
                            onClick={() => setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        >
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="clear-button" onClick={() => setSearchTerm('')} aria-label="Clear job title input">
                                    ✕
                                </button>
                            )}
                        </div>

                        {showSuggestions && (
                            <div className="suggestions-dropdown1">
                                <div className="section">
                                    <p className="section-title">Recent searches</p>
                                    {recentSearches.map((item, i) => (
                                        <div className="suggestion-item recent" key={i}>
                                            <i className="fas fa-clock suggestion-icon"></i>
                                            <div className="recent-texts" onClick={() => handleSearchTermClick(item)}>
                                                <p className="suggestion-text">{item}</p>
                                                <p className="suggestion-subtext">
                                                    <span className="new">99+ new</span>
                                                    <span className="dim">in {item}</span>
                                                </p>
                                            </div>
                                            <i className="fas fa-xmark remove-icon" onClick={() => handleRemoveRecent(i)}></i>
                                        </div>
                                    ))}
                                </div>
                                <div className="section">
                                    <p className="section-title">Search suggestions</p>
                                    {suggestions.map((item, i) => (
                                        <div className="suggestion-item" key={i} onClick={() => handleSearchTermClick(item)}>
                                            <i className="fas fa-search suggestion-icon"></i>
                                            <p className="suggestion-text">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="divider"></div>

                        {/* Location Input */}
                        <div className={`input-group ${categoryFilter ? 'active' : ''}`}>
                            <i className="fas fa-map-marker-alt"></i>
                            <input
                                type="text"
                                placeholder='City, district, or "remote"'
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            />
                            {categoryFilter && (
                                <button className="clear-button" onClick={() => setCategoryFilter('')} aria-label="Clear location input">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    <button className="search-button" onClick={handleSearch}>Search</button>
                </div>

                <button className="modal-launch-btn" onClick={openModal}>
                    Find Jobs That Match Me
                </button>

                <CategoryChips
                    selected={selectedChip}
                    onSelect={(chip) => setSelectedChip(chip)}
                />
            </div>

            {/* === JOB LISTING + DETAILS === */}
            <div className="job-content two-column-layout">
                <div className="left-column">
                    <h1 className="job-section-heading">
                        <i className="fa-solid fa-user-astronaut heading-icon"></i>
                        For You
                    </h1>


                    <div className="job-listings">
                        {visibleJobs.map((job, index) => (
                            <Job
                                key={index}
                                job={job}
                                selected={selectedJob}
                                onSelect={(job) => {
                                    if (!isLoggedIn) {
                                        setShowLogin(true); // 🔒 Not logged in → show login popup
                                    } else {
                                        setSelectedJob(job); // ✅ Logged in → show job details
                                    }
                                }}
                            />


                        ))}
                    </div>
                    <div className="job-pagination">
                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <span className="page-number">{currentPage}</span>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                {selectedJob && (
                    <div className="job-details-panel active">
                        <div className="job-header">
                            <h2 className="title">
                                <i className="fa-solid fa-laptop-code" style={{ color: '#4CAF50' }}></i> {selectedJob.job_title}
                            </h2>
                            <a
                                className="company-link"
                                href={selectedJob.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {selectedJob.company}
                            </a>
                            <div className="apply-row">
                                <a
                                    className="apply-btn"
                                    href={selectedJob.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Apply on company site
                                </a>
                                <button className="icon-btn" title="Save">
                                    <i className="fa-regular fa-bookmark" style={{ color: '#FF9800' }}></i>
                                </button>
                                <button
                                    className="icon-btn"
                                    title="Copy Link"
                                    onClick={() => navigator.clipboard.writeText(selectedJob.link)}
                                >
                                    <i className="fa-solid fa-link" style={{ color: '#2196F3' }}></i>
                                </button>
                            </div>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-graduation-cap" style={{ color: '#673AB7' }}></i> Education
                            </h3>
                            <div className="section-content">
                                {selectedJob.education.length > 0
                                    ? selectedJob.education.map((edu, i) => <p key={i}>{edu}</p>)
                                    : <p>N/A</p>}
                            </div>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-briefcase" style={{ color: '#009688' }}></i> Responsibilities
                            </h3>
                            <ul className="section-content">
                                <li>Develop and maintain web apps using Next.js and Node.js</li>
                                <li>Integrate RESTful and GraphQL APIs</li>
                                <li>Work with SQL/NoSQL databases</li>
                                <li>Translate Figma designs into responsive UIs</li>
                                <li>Optimize performance using SSR, SSG, and caching</li>
                                <li>Use Git and participate in sprint planning</li>
                            </ul>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-screwdriver-wrench" style={{ color: '#F44336' }}></i> Skills & Expertise
                            </h3>
                            <ul className="section-content">
                                {selectedJob.skill.length > 0
                                    ? selectedJob.skill.map((s, i) => <li key={i}>{s}</li>)
                                    : <p>N/A</p>}
                            </ul>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-location-dot" style={{ color: '#E91E63' }}></i> Job Location
                            </h3>
                            <p className="section-content">{selectedJob.location || 'N/A'}</p>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-clock" style={{ color: '#795548' }}></i> Published & Deadline
                            </h3>
                            <p className="section-content">
                                <strong>Published:</strong> {selectedJob.published || 'N/A'}
                            </p>
                            <p className="section-content">
                                <strong>Deadline:</strong>{' '}
                                {selectedJob.deadline
                                    ? new Date(selectedJob.deadline).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })
                                    : 'N/A'}
                            </p>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-building" style={{ color: '#3F51B5' }}></i> Company Information
                            </h3>
                            <p className="section-content">{selectedJob.company || 'N/A'}</p>
                        </div>

                        <div className="section">
                            <h3>
                                <i className="fa-solid fa-globe" style={{ color: '#00BCD4' }}></i> Job Posted On
                            </h3>
                            <p className="section-content">{selectedJob.site_name || 'N/A'}</p>
                        </div>
                    </div>
                )}


            </div>

            <QualificationModal
                show={showModal}
                onClose={closeModal}
                onSubmit={handleQualificationSubmit}
                formData={formData}
                setFormData={setFormData}
            />

        </div>
    );
}

export default Jobs;
