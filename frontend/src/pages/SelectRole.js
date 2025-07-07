const token = localStorage.getItem('token');

if (!token) {
  setError('No token found. Please log in again.');
  navigate('/login');
  return;
}

let decoded;
try {
  decoded = jwtDecode(token);
} catch (err) {
  console.error('❌ Invalid token:', err.message);
  setError('Invalid session. Please log in again.');
  localStorage.removeItem('token');
  navigate('/login');
  return;
}

const userId = decoded.id;
