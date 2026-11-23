
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import '../App.css';

const SelectRole = () => {
  const [goalId, setGoalId] = useState('');
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goalError, setGoalError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get(
          'https://personalized-learningapp.onrender.com/api/path/goals'
        );

        setRoles(response.data);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setGoalError('Unable to load learning goals. Please try again.');
      } finally {
        setLoadingGoals(false);
      }
    };

    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!goalId) {
      setError('Please select a role');
      return;
    }

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
      console.error('Invalid token:', err.message);
      setError('Invalid session. Please log in again.');
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    const userId = decoded.id;

    try {
      await axios.post(
        'https://personalized-learningapp.onrender.com/api/path/generate',
        {
          userId,
          goalId: Number(goalId),
        }
      );

      navigate('/dashboard');
    } catch (err) {
      console.error('Path generation error:', err);
      setError('Could not generate path. Try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Select Your Career Role</h2>

      <form onSubmit={handleSubmit}>
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          disabled={loadingGoals || !!goalError || roles.length === 0}
        >
          <option value="">-- Choose Role --</option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        {loadingGoals && <p>Loading learning goals...</p>}

        {goalError && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {goalError}
          </p>
        )}

        <button
          type="submit"
          disabled={loadingGoals || !!goalError || roles.length === 0}
        >
          Start Learning Path
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default SelectRole;
