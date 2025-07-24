import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

 const handleRegister = async (e) => {
  e.preventDefault();
  setError('');
  try {
    await axios.post('https://personalized-learningapp.onrender.com/api/auth/register', {
      name,
      email,
      password,
    });

    // 🔐 Automatically log the user in after registering
    const loginRes = await axios.post('https://personalized-learningapp.onrender.com/api/auth/login', {
      email,
      password,
    });

    const token = loginRes.data.token;
    localStorage.setItem('token', token);
    navigate('/select-role'); // ✅ Go to Select Role
  } catch (err) {
    console.error(err);
    setError('Registration failed. Try again.');
  }
};


  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/" style={{ textDecoration: 'underline' }}>Login here</Link>
      </p>
    </div>
  );
};

export default Register;
