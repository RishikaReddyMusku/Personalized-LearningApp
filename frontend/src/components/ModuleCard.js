import React from 'react';
import '../App.css';

const ModuleCard = ({ title, link, completed }) => {
  return (
    <div className={`module-card ${completed ? 'completed' : ''}`}>
      <div className="module-title">{title}</div>
      <a
        className="module-link"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Resource ↗
      </a>
    </div>
  );
};

export default ModuleCard;
