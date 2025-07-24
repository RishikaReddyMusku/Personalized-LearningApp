import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import '../App.css';

const SelectRole = () => {
  const [goalId, setGoalId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { id: 1, name: 'Full-Stack Developer' },
    { id: 2, name: 'Frontend Developer' },
    { id: 3, name: 'Backend Developer' },
    { id: 4, name: 'Machine Learning Engineer' },
    { id: 5, name: 'Java Developer' },
    { id: 6, name: 'Business Analyst' },
    { id: 7, name: 'Data Scientist' },
  ];

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!goalId) return setError('Please select a role');

  const token = localStorage.getItem('token');

  if (!token) {
    setError('No token found. Please log in again.');
    navigate('/');
    return;
  }

  let decoded;
  try {
    decoded = jwtDecode(token);
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    setError('Invalid session. Please log in again.');
    localStorage.removeItem('token');
    navigate('/');
    return;
  }

  const userId = decoded.id;

  try {
    await axios.post('https://personalized-learningapp.onrender.com/api/path/generate', {
      userId,
      goalId,
    });

    navigate('/dashboard');
  } catch (err) {
    console.error(err);
    setError('Could not generate path. Try again.');
  }
};


  return (
    <div className="form-container">
      <h2>Select Your Career Role</h2>
      <form onSubmit={handleSubmit}>
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">-- Choose Role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <button type="submit">Start Learning Path</button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
};

export default SelectRole;
