// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import '../App.css';




// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [modules, setModules] = useState([]);
//   const [progress, setProgress] = useState(0);
//   const [userId, setUserId] = useState(null);

//   const fetchPath = async (uid, token) => {
//     try {
//       const { data } = await axios.get(`https://personalized-learningapp.onrender.com/api/path/path/${uid}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setModules(data);
//       updateProgress(data);
//     } catch (err) {
//       console.error('Error fetching path:', err);
//     }
//   };

//   const updateProgress = (moduleList) => {
//     const completed = moduleList.filter((m) => m.is_completed).length;
//     const pct = Math.floor((completed / moduleList.length) * 100);
//     setProgress(pct);
//   };

//   const toggleComplete = async (moduleId) => {
//     try {
//       const updated = modules.map((mod) =>
//         mod.id === moduleId ? { ...mod, is_completed: !mod.is_completed } : mod
//       );
//       setModules(updated);
//       updateProgress(updated);

//       await axios.post(`https://personalized-learningapp.onrender.com/api/path/toggle`, {
//         userId,
//         moduleId,
        
//       });
//     } catch (err) {
//       console.error('Error updating module status:', err);
//     }
//   };

//  useEffect(() => {
//   const loadLearningPath = async () => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       navigate('/');
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);

//       setUserId(decoded.id);

//       const { data } = await axios.get(
//         `https://personalized-learningapp.onrender.com/api/path/path/${decoded.id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setModules(data);

//       const completed = data.filter(
//         (module) => module.is_completed
//       ).length;

//       const percentage = data.length
//         ? Math.floor((completed / data.length) * 100)
//         : 0;

//       setProgress(percentage);

//     } catch (err) {
//       console.error('Error loading learning path:', err);

//       if (err.name === 'InvalidTokenError') {
//         localStorage.removeItem('token');
//         navigate('/');
//       }
//     }
//   };

//   loadLearningPath();

// }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/';
//   };

//   return (
//     <div className="app-container">
  


//        <button className="logout-btn" onClick={handleLogout}>Logout</button>

//       <h2 style={{ textAlign: 'center' }}>Your Learning Path</h2>
//       <div className="progress-bar">
//         <div className="progress-fill" style={{ width: `${progress}%` }}></div>
//       </div>
//       <p style={{ textAlign: 'center', marginBottom: '2rem' }}>{progress}% completed</p>

//       {modules.map((mod, idx) =>(
        
//         <div className={`module-card ${mod.is_completed ? 'completed' : ''}`} key={mod.id}>
//           <div className="module-title">
//             <input
//               type="checkbox"
//               checked={mod.is_completed}
//               onChange={() => toggleComplete(mod.id)}
//               style={{ marginRight: '10px' }}
//             />
//             <span>{mod.title || 'Untitled Module'}</span>
//           </div>
//           <a
//             className="module-link"
//             href={
//     mod.content_link
//       ? mod.content_link.startsWith('http')
//         ? mod.content_link
//         : `https://${mod.content_link}`
//       : '#'
//   }
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             View Resource ↗
//           </a>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import '../App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);

  const updateProgress = (moduleList) => {
    const completed = moduleList.filter(
      (module) => module.is_completed
    ).length;

    const percentage = moduleList.length
      ? Math.floor((completed / moduleList.length) * 100)
      : 0;

    setProgress(percentage);
  };

  const toggleComplete = async (moduleId) => {
    try {
      const updated = modules.map((mod) =>
        mod.id === moduleId
          ? { ...mod, is_completed: !mod.is_completed }
          : mod
      );

      setModules(updated);
      updateProgress(updated);

      await api.post('/api/path/toggle', {
        userId,
        moduleId,
      });
    } catch (err) {
      console.error('Error updating module status:', err);
    }
  };

  useEffect(() => {
    const loadLearningPath = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

      try {
        const decoded = jwtDecode(token);

        setUserId(decoded.id);

        const { data } = await api.get(
          `/api/path/path/${decoded.id}`
        );

        setModules(data);
        updateProgress(data);

      } catch (err) {
        console.error('Error loading learning path:', err);

        if (
          err.name === 'InvalidTokenError' ||
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };

    loadLearningPath();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="app-container">

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <h2 style={{ textAlign: 'center' }}>
        Your Learning Path
      </h2>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {progress}% completed
      </p>

      {modules.map((mod) => (
        <div
          className={`module-card ${mod.is_completed ? 'completed' : ''}`}
          key={mod.id}
        >
          <div className="module-title">
            <input
              type="checkbox"
              checked={Boolean(mod.is_completed)}
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
