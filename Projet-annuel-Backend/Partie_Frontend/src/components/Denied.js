import React from 'react';
import './Denied.css';

// composant que l'on affiche si un utilisateur essaye d'accéeder à une page qui demande le rôle Admin
const Denied = () => {
  return (
    <div className="denied-container">
      <div className="overlay">
        <h1 className="denied-text">Vous n'avez pas le droit</h1>
      </div>
    </div>
  );
};

export default Denied;
