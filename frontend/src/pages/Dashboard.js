import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const updateProgress = useCallback((moduleList) => {
    const completed = moduleList.filter(
      (module) =>
        module.is_completed === true ||
        module.is_completed === 1 ||
        module.is_completed === '1'
    ).length;

    const percentage = moduleList.length
      ? Math.floor((completed / moduleList.length) * 100)
      : 0;

    setProgress(percentage);
  }, []);

  useEffect(() => {
    const loadLearningPath = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const currentUserId = decoded.id;

        setUserId(currentUserId);

        const response = await api.get(
          `/api/path/path/${currentUserId}`
        );

        console.log('Learning path response:', response.data);

        const receivedModules = Array.isArray(response.data)
          ? response.data
          : [];

        setModules(receivedModules);
        updateProgress(receivedModules);

        if (receivedModules.length === 0) {
          setError('No modules found. Please select your learning goal again.');
        } else {
          setError('');
        }

      } catch (err) {
        console.error('Error loading learning path:', err);

        if (
          err.name === 'InvalidTokenError' ||
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          setError(
            err.response?.data?.error ||
            'Could not load your learning path.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadLearningPath();
  }, [navigate, updateProgress]);

  const toggleComplete = async (moduleId) => {
    const previousModules = [...modules];

    const updatedModules = modules.map((module) =>
      Number(module.module_id) === Number(moduleId)
        ? {
            ...module,
            is_completed: !(
              module.is_completed === true ||
              module.is_completed === 1 ||
              module.is_completed === '1'
            )
          }
        : module
    );

    setModules(updatedModules);
    updateProgress(updatedModules);

    try {
      await api.post('/api/path/toggle', {
        userId,
        moduleId: Number(moduleId)
      });
    } catch (err) {
      console.error('Error updating module status:', err);

      setModules(previousModules);
      updateProgress(previousModules);

      alert('Could not update module progress. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="app-container">Loading your learning path...</div>;
  }

  return (
    <div className="app-container">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <h2 style={{ textAlign: 'center' }}>Your Learning Path</h2>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {progress}% completed
      </p>

      {error && (
        <p style={{ color: 'red', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {modules.map((mod) => (
        <div
          className={`module-card ${
            mod.is_completed ? 'completed' : ''
          }`}
          key={mod.id}
        >
          <div className="module-title">
            <input
              type="checkbox"
              checked={
                mod.is_completed === true ||
                mod.is_completed === 1 ||
                mod.is_completed === '1'
              }
              onChange={() => toggleComplete(mod.module_id)}
              style={{ marginRight: '10px' }}
            />

            <span>{mod.title || 'Module name missing'}</span>
          </div>

          {mod.content_link ? (
            <a
              className="module-link"
              href={mod.content_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Resource ↗
            </a>
          ) : (
            <span>Resource link not available</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;