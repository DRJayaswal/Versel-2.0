import { useState, useEffect } from 'react';
import gitHubLogo from '/github.png';
import orbitsLogo from '/orbit-logo.png';
import orbitsName from '/orbits.png';
import axios from 'axios';
import './App.css';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  const [deploymentStage, setDeploymentStage] = useState(0);
  const [deploymentError, setDeploymentError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const [showSlugInput, setShowSlugInput] = useState(false);

  const deploymentStages = [
    { id: 0, text: 'Cloning...', completedText: 'Cloned', delay: 1200 },
    { id: 1, text: 'Installing...', completedText: 'Installed', delay: 1500 },
    { id: 2, text: 'Building...', completedText: 'Built', delay: 2000 },
    { id: 3, text: 'Uploading...', completedText: 'Uploaded', delay: 1000 },
    { id: 4, text: 'Running...', completedText: 'Live', delay: 1200 },
    { id: 5, text: 'Deploying...', completedText: 'Deployed', delay: 800 },
    { id: 6, text: 'Completing...', completedText: 'Completed', delay: 500 }
  ];

  const simulateDeployment = async () => {
    for (const stage of deploymentStages) {
      setDeploymentStage(stage.id);

      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, stage.delay / 20));
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const uploadData = async () => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);

      await simulateDeployment();

      const response = await axios.post('http://localhost:9000/project', {
        gitUrl: githubUrl,
        slug: projectSlug,
      });
      setIsDeployed(true);
      setDeployedUrl(response.data.data.projectUrl);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentError(error.message);
      setIsDeploying(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadData();
  };

  useEffect(() => {
    const video = document.querySelector('.video-background video');
    if (video) {
      video.playbackRate = 2;
    }
  }, []);

  return (
    <>
      <header className="header">
        <a href="/" className="logo-link">
          <img src={orbitsName} alt="Orbits Logo" className="logo-name" />
        </a>
        <nav className="nav-links">
          <button
            onClick={() => {
              if (isDeployed) {
                setIsDeploying(false);
                setDeployedUrl('');
                setProgress(0);
                setDeploymentStage(0);
                setShowSlugInput(!showSlugInput);
                setIsDeployed(false);
              }
              if (!isDeploying) {
                setShowSlugInput((prev) => !prev);
                setGithubUrl('');
                setProjectSlug('');
              }
            }}
            className={isDeploying && !isDeployed ? 'nav-link update-btn dont' : 'nav-link update-btn do'}
          >
            {showSlugInput ? 'Deploy New Project' : 'Update Existing Project'}
          </button>
          <a
            href="https://github.com/drjayaswal/Versel-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Source Code
          </a>
          <a
            href="https://linkedin.com/in/drjayaswal"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            Linkedin
          </a>
          <a
            href="https://github.com/drjayaswal"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
        </nav>
      </header>

      <div className="video-background">
        <video
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          controlsList="nodownload noplaybackrate"
          onContextMenu={(e) => e.preventDefault()}
        >
          <source src="/bg.mp4" type="video/mp4" />
        </video>
      </div>

      <div className='logos'>
        <img src={gitHubLogo} className="githublogo" />
        <span className='plus'>+</span>
        <img src={orbitsLogo} className="orbitslogo" />
      </div>

      <h1 className="tagname margin-50">Deploy GitHub P<span className={isDeployed ? "Rcompleted" : "R"}>R</span>oject</h1>
      <div className="card">
        {!isDeploying ? (
          <form onSubmit={handleSubmit} className="form-container">
            {showSlugInput && (
              <div className="form-group">
                <label htmlFor="project-slug" className="form-label">
                  Project Slug
                </label>
                <input
                  type="text"
                  id="project-slug"
                  value={projectSlug}
                  onChange={(e) => setProjectSlug(e.target.value)}
                  placeholder="slug"
                  pattern="[a-z]+-[a-z]+-[a-z]+"
                  title="Slug must be in format: word-word-word"
                  autoComplete="off"
                  required
                  className="form-input project-slug-input"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="github-url" className="form-label">
                GitHub Repository URL
              </label>
              <input
                type="url"
                id="github-url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/author/repo"
                pattern="https://github\.com/\S+/\S+"
                title="Please enter a valid GitHub repository URL"
                autoComplete="off"
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="form-button">
              {showSlugInput ? 'Update Project' : 'Deploy Project'}
            </button>
          </form>
        ) : (
          <div className="deployment-status">
            {!deployedUrl ? (
              <div className="deploying">
                <div className="spinner"></div>
                <div className="stages">
                  {deploymentStages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`stage ${deploymentStage >= stage.id ? 'active' : ''} ${deploymentStage > stage.id ? 'completed' : ''}`}
                    >
                      <span className="stage-dot">
                        {deploymentStage > stage.id && (
                          <span className="checkmark">✓</span>
                        )}
                      </span>
                      <div className="stage-content">
                        <p>{deploymentStage > stage.id ? stage.completedText : stage.text}</p>
                        {deploymentStage === stage.id && (
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {deploymentError && (
                  <div className="error">
                    <p>Deployment failed: {deploymentError}</p>
                  </div>
                )}
              </div>
            ) : (
              isDeploying ? (
                <div></div>
              ) : (
                <div
                  className="visit-button"
                  onClick={() => {
                    setIsDeploying(false);
                    setDeployedUrl('');
                    setProgress(0);
                    setDeploymentStage(0);
                    setIsDeployed(false);
                  }}
                >
                  Update
                </div>
              ))}
          </div>
        )}
        {deployedUrl && (
          <div className="action-buttons">
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="visit-button"
            >
              Project URL
            </a>
            <button
              className="deploy-new-button"
              onClick={() => {
                setIsDeploying(false);
                setDeployedUrl('');
                setProgress(0);
                setDeploymentStage(0);
                setIsDeployed(false);
                setGithubUrl('');
                setProjectSlug('');
                setShowSlugInput(false);
              }}
            >
              Deploy New Project
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;