import { useState } from 'react';
import gitHubLogo from '/github.png';
import orbitsLogo from '/orbits.png';
import './App.css';

function App() {
  const [githubUrl, setGithubUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedUrl(githubUrl);
    alert(`GitHub URL submitted: ${githubUrl}`);
  };

  return (
    <>
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
            placeholder="https://github.com/username/repo"
            required
          />
          <button type="submit">Submit</button>
        </form>
        {submittedUrl && (
          <p>
            Submitted URL: <a href={submittedUrl} target="_blank" rel="noopener noreferrer">{submittedUrl}</a>
          </p>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;