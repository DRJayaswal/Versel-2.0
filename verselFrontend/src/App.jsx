import { useState, useEffect } from 'react';
import gitHubLogo from '/github.png';
import orbitsLogo from '/orbits.png';
import axios from 'axios';
import './App.css';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  const [needUpdate, setNeedUpdate] = useState(false);
  const [deploymentStage, setDeploymentStage] = useState(0);
  const [deploymentError, setDeploymentError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const [showSlugInput, setShowSlugInput] = useState(false);

  const deploymentStages = [
    { id: 0, text: 'Cloning project...', completedText: 'Project cloned', delay: 1200 },
    { id: 1, text: 'Installing dependencies...', completedText: 'Dependencies installed', delay: 1500 },
    { id: 2, text: 'Building project...', completedText: 'Project built', delay: 2000 },
    { id: 3, text: 'Uploading project...', completedText: 'Project uploaded', delay: 1000 },
    { id: 4, text: 'Running project...', completedText: 'Project running', delay: 1200 },
    { id: 5, text: 'Deploying project...', completedText: 'Project deployed', delay: 800 },
    { id: 6, text: 'Almost Done!', completedText: 'Completed! 🎉', delay: 500 }
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

  const fastBG = (times) => {
    const video = document.querySelector('.video-background video');
    if (video) {
      video.playbackRate += times;
    }
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
          <img src={orbitsLogo} alt="Orbits Logo" className="logo-name" />
        </a>
        <nav className="nav-links">
          <button 
            onClick={() => setShowSlugInput(!showSlugInput)}
            className="nav-link update-btn"
          >
            {showSlugInput ? 'New' : 'Update'}
          </button>
          <a 
            href="https://github.com/drjayaswal/Versel-2.0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            Source Code
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
          <img src={gitHubLogo} className="githublogo" alt="Vite logo" />
        +
          <img src={orbitsLogo} className="orbitslogo" alt="Vite logo" />
      </div>
      
      <h1 className={isDeployed ? "tagname margin-0" : "tagname margin-50"}>Deploy GitHub P<span className= {isDeployed ? "Rcompleted" : "R"}>R</span>oject</h1>
      <div className="card">
        {!isDeploying ? (
          <form onSubmit={handleSubmit}>
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
            />
            {showSlugInput && (
              <input
                type="text"
                id="project-slug"
                value={projectSlug}
                onChange={(e) => setProjectSlug(e.target.value)}
                placeholder="slug"
                pattern="[a-z]+-[a-z]+-[a-z]+"
                title="Slug must be in format: word-word-word"
                className="project-slug-input"
                autoComplete="off"
                required
              />
            )}
            <button type="submit">
              {showSlugInput ? 'Update' : 'Deploy'}
            </button>
          </form>
        ) : (
          <div className="deployment-status">
            {!deployedUrl ? (
              <div className="deploying">
                <div className="spinner"></div>
                <div className="stages">
                  {deploymentStages.map((stage) => (
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
                  fastBG(-1);
                } }
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
      
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Connect</h3>
            <a href="https://github.com/drjayaswal" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/drjayaswal" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
          <div className="footer-section">
            <h3>Created By</h3>
            <p>Dhruv Ratan Jayaswal</p>
            <p>&copy; {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;




