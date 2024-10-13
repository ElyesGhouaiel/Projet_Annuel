import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link } from "react-router-dom";
import Cookies from 'js-cookie';
import './Header.css';
//composant créer par elyes et killian, 

//composant qui permet de créer le menu 
const Layout = () => {
  const [open, setOpen] = useState(false);
  const [Logout, setLogout] = useState(false);
  const node = useRef();

  useEffect(() => {
    const value = Cookies.get('token');
    setLogout(!value);
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = '/';
  };

  // Fermer le menu burger quand on clique à l'extérieur
  useOnClickOutside(node, () => setOpen(false));

  return (
    <>
      <div ref={node}>
        <div className={`styled-burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          <div />
          <div />
          <div />
        </div>
        <div className={`styled-menu ${open ? 'open' : ''}`}>
          {Logout ? (
            <>
              <Link to="/">🏠Accueil </Link>
              <Link to="/Inscription">🪪Inscription</Link>
            </>
          ) : (
            <>
              <Link to="/User">🧑‍💼User</Link>
              <Link to="/PageAdmin">🫅Page Admin</Link>
              <a className='logout' onClick={handleLogout}>⬅️Logout</a>
            </>
          )}
        </div>
      </div>
      <Outlet />
    </>
  );
};

// Utilisation d'un hook pour fermer le menu lorsque l'utilisateur clique à l'extérieur
const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

export default Layout;
