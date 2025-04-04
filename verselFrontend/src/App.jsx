import { useState, useEffect } from 'react';
import gitHubLogo from '/github.png';
import orbitsLogo from '/orbits.png';
import axios from 'axios';
import './App.css';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');

  const uploadData = async () => {
    const url = githubUrl;
    const slug = projectSlug;
    const response = await axios.post('http://localhost:9000/project',
      {
        gitUrl: url,
        slug: slug,
      }
    )
    console.log(response.data);
  }
  

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
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            id="github-url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/author/repo"
            pattern="https://github\.com/\S+/\S+"
            title="Please enter a valid GitHub repository URL"
            autoFocus
            required
          />
          <input
            type="text"
            id="project-slug"
            value={projectSlug}
            onChange={(e) => setProjectSlug(e.target.value)}
            placeholder="Project slug (optional)"
            pattern="[a-z]+-[a-z]+-[a-z]+"
            title="Slug can only contain lowercase letters, numbers, and hyphens"
            className="project-slug-input"
          />
          
          <button type="submit" >Submit</button>
        </form>
      </div>
    </>
  );
}

export default App;