import React, { useState, useEffect } from 'react';
import './CustomAlert.css';

const CustomAlert = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`custom-alert ${type}`}>
      <div className="alert-content">
        <p>{message}</p>
        <button onClick={() => setIsVisible(false)}>×</button>
      </div>
    </div>
  );
};

export default CustomAlert;