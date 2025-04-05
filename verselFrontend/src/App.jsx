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
  const [deploymentStage, setDeploymentStage] = useState(0);
  const [deploymentError, setDeploymentError] = useState(null);
  const [progress, setProgress] = useState(0);

  const deploymentStages = [
    { id: 0, text: 'Cloning project...', delay: 1200 },
    { id: 1, text: 'Installing dependencies...', delay: 1500 },
    { id: 2, text: 'Building project...', delay: 2000 },
    { id: 3, text: 'Uploading project...', delay: 1000 },
    { id: 4, text: 'Running project...', delay: 1200 },
    { id: 5, text: 'Deploying project...', delay: 800 },
    { id: 6, text: 'Almost Done!', delay: 500 }
  ];

  const simulateDeployment = async () => {
    for (const stage of deploymentStages) {
      setDeploymentStage(stage.id);
      
      // Slower progress updates (20 steps instead of 10)
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, stage.delay / 20));
      }
      
      // Longer pause between stages
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const uploadData = async () => {
    try {
      setIsDeploying(true);
      setDeploymentError(null);
      
      // Start deployment simulation before making the API call
      await simulateDeployment();

      const response = await axios.post('http://localhost:9000/project', {
        gitUrl: githubUrl,
        slug: projectSlug,
      });
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
    slowBG();
  };

  const slowBG = () => {
    const video = document.querySelector('.video-background video');
    if (video) {
      video.playbackRate = 1.2;
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
        <a href="https://vite.dev" target="_blank">
          <img src={gitHubLogo} className="githublogo" alt="Vite logo" />
        </a>
        +
        <a href="https://vite.dev" target="_blank">
          <img src={orbitsLogo} className="orbitslogo" alt="Vite logo" />
        </a>
      </div>
      
      <h1>Deploy GitHub P<span className='R'>R</span>oject</h1>
      
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
            <input
              type="text"
              id="project-slug"
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              placeholder="bland-calm-student"
              pattern="[a-z]+-[a-z]+-[a-z]+"
              title="Slug can only contain lowercase letters, numbers, and hyphens"
              className="project-slug-input"
              autoComplete="off"
            />
            <button type="submit">Upload</button>
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
                      className={`stage ${deploymentStage >= stage.id ? 'active' : ''}`}
                    >
                      <span className="stage-dot"></span>
                      <div className="stage-content">
                        <p>{stage.text}</p>
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
                    <p>❌ Deployment failed: {deploymentError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="deployed">
                <p>🎉 Deployment successful!</p>
                <a 
                  href={deployedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-button"
                >
                  Visit Your Site
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default App;