import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Step 1: Login
      const res = await axios.post('https://personalized-learningapp.onrender.com/api/auth/login', {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem('token', token);

      // Step 2: Decode token to get userId
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      // Step 3: Check if learning path exists
      const pathRes = await axios.get(
        `https://personalized-learningapp.onrender.com/api/path/path/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Step 4: Redirect accordingly
      if (pathRes.data.length === 0) {
        navigate('/select-role');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-header">
        <h1>Welcome to Learnify</h1>
        <p>Your personalized path to becoming what you dream to be.</p>
      </div>

      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">Log In</button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'underline' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
