import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../App.css';




const Dashboard = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);

  const fetchPath = async (uid, token) => {
    try {
      const { data } = await axios.get(`https://personalized-learningapp.onrender.com/api/path/path/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModules(data);
      updateProgress(data);
    } catch (err) {
      console.error('Error fetching path:', err);
    }
  };

  const updateProgress = (moduleList) => {
    const completed = moduleList.filter((m) => m.is_completed).length;
    const pct = Math.floor((completed / moduleList.length) * 100);
    setProgress(pct);
  };

  const toggleComplete = async (moduleId) => {
    try {
      const updated = modules.map((mod) =>
        mod.id === moduleId ? { ...mod, is_completed: !mod.is_completed } : mod
      );
      setModules(updated);
      updateProgress(updated);

      await axios.post(`https://personalized-learningapp.onrender.com/api/path/toggle`, {
        userId,
        moduleId,
        
      });
    } catch (err) {
      console.error('Error updating module status:', err);
    }
  };

 useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/');
    return;
  }

  try {
    const decoded = jwtDecode(token);
    setUserId(decoded.id);
    fetchPath(decoded.id, token);
  } catch (err) {
    console.error('Invalid token:', err.message);
    localStorage.removeItem('token');
    navigate('/');
  }
}, [navigate]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="app-container">
  


       <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <h2 style={{ textAlign: 'center' }}>Your Learning Path</h2>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{progress}% completed</p>

      {modules.map((mod, idx) =>(
        
        <div className={`module-card ${mod.is_completed ? 'completed' : ''}`} key={mod.id}>
          <div className="module-title">
            <input
              type="checkbox"
              checked={mod.is_completed}
              onChange={() => toggleComplete(mod.id)}
              style={{ marginRight: '10px' }}
            />
            <span>{mod.title || 'Untitled Module'}</span>
          </div>
          <a
            className="module-link"
            href={
    mod.content_link
      ? mod.content_link.startsWith('http')
        ? mod.content_link
        : `https://${mod.content_link}`
      : '#'
  }
            target="_blank"
            rel="noopener noreferrer"
          >
            View Resource ↗
          </a>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
