import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Importez jwtDecode depuis 'jwt-decode'

//page faite par elyes


function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');




  // function permettan de vérifier l'identifiant et mdp du user via l'api de connection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
  
      console.log('Sending login request...');
      const response = await axios.post('http://localhost:8000/user/login', {
        email: email,
        password: password
      });


      if (response.status === 200) {
     
        sessionStorage.setItem('Role',JSON.stringify(response.data.role));
        
        Cookies.set('token', JSON.stringify(response.data), { expires: 7 }); // Le cookie expire dans 7 jours
        const value = Cookies.get('token');
 const tokenData = JSON.parse(value);
        
        // Extraire l'e-mail du token
        const decodedToken = jwtDecode(tokenData); // Utilisez jwtDecode
        const userEmail = decodedToken.id;
        window.location.href = '/User';
    


      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (error) {
      setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        setError(error.response.data.error || 'Une erreur s\'est produite. Veuillez réessayer plus tard.');
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('Aucune réponse du serveur. Veuillez vérifier votre connexion.');
      } else {
        console.error('Error message:', error.message);
        setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      }
      console.error('Erreur lors de la connexion :', error);
    }
  };

  return (
    <>
    <div className='ensemble'>
  <div className='corpsgauche'></div>
  <div className='corpsdroite'>
    <div className="login">
      <form onSubmit={handleSubmit}>
        <h1 className='H1'>Veuillez vous connecter</h1>
        <div className="form-group">
          <label className='titre' htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder='Username'
          />
        </div>
        <div className="form-group">
          <label className='titre' htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder='Password'
          />        <button className='Login' type="submit">Se connecter</button>

        </div>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  </div>
</div>

      </>
  );
}

export default LoginForm;
