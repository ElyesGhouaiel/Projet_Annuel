import React, { useState } from 'react';
import axios from 'axios';
import './Inscription.css';
import jsPDF from 'jspdf';
import logo from '../img/logocard.png'; // Tell webpack this JS file uses this image
import CustomAlert from './CustomAlert';


//page faite par elyes

// Fonction qui génère un PDF et l'envoie à l'API
const generateTicketPDF = async (nom, prenom, adrpostale, nomSociete, adrSociete, siret, email, userId) => {
  const doc = new jsPDF();
  const formattedDate = new Date().toLocaleDateString('fr-FR');
  const content = `
    Voici votre facture:

    Nom: ${nom}
    Prénom: ${prenom}
    Adresse postale: ${adrpostale}
    Nom de société: ${nomSociete}
    Adresse postale de la société: ${adrSociete}
    SIRET: ${siret}
    Date de la facture: ${formattedDate}
    Désignation:
    Quantité: 1
    Total hors taxe: 17,50 €
    Prix unitaire hors taxe:
    Montant de la TVA:
    Montant toutes taxes comprises à régler: 20€
  `;
  doc.text(content, 10, 10);

  // Convertir le PDF en blob
  const pdfBlob = doc.output('blob');

  // Envoyer le fichier PDF
  const formData = new FormData();
  formData.append('file', pdfBlob, 'facture.pdf');
  formData.append('nom', 'Facture de votre premier achat.pdf');
  formData.append('taille', pdfBlob.size);
  formData.append('userid', userId);
  formData.append('stockagedisponible', 21474836480); // Exemple de stockage
  formData.append('type', 'pdf');

  // Lire le contenu du blob en tant que base64
  const reader = new FileReader();
  reader.readAsDataURL(pdfBlob);

  reader.onloadend = async function () {
    try {
      const sendMail = await axios.post('http://localhost:8000/user/senmail', {
        to: email,
        text: 'Voici votre facture',
        fichier: reader.result.split(',')[1], // Extraire le contenu base64
      });

   
    } catch (error) {
      console.log('Erreur lors de l\'envoi de l\'e-mail:', error);
    }
  };

  // Envoi du fichier PDF à l'API
  try {

    const response = await axios.post('http://localhost:8000/file/addFile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('PDF envoyé avec succès:', response);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du PDF:', error);
  }
};


function Inscription() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adressePostal, setAdressePostal] = useState('');
  const [nomSociete, setNomSociete] = useState('');
  const [adrSociete, setAdrSociete] = useState('');
  const [siret, setSiret] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleShowPaymentForm = () => {
    setIsPaymentFormVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    //met en rôle User si il n'ya pas de mot de passe ou si il n'est pas bon et si tout est bon il met le rôle en Admin
    const role = adminPassword === '1234' ? 'Admin' : 'User';

    // Appel à l'API pour créer un utilisateur
    try {
      console.log('Sending registration request...');
      const response = await axios.post('http://localhost:8000/user/createUser', {
        nom: nom,
        prenom: prenom,
        email: email,
        adresse_postale: adressePostal,
        adresse_postale_societe: adrSociete,
        Nom_de_societe: nomSociete,
        siret: siret,
        password: password,
        quantiteStockage: 21474836480,
        stockagedisponible: 21474836480,
        role: role,
      });
      
  
      console.log('Registration response:', response);

      if (response.status === 200) {
      

        // Récupérer l'ID utilisateur après la création
        const getUserIdResponse = await axios.post('http://localhost:8000/user/GETID', {
          email: email,
        });

        const userId = getUserIdResponse.data.id;
        if (userId) {
          // Générer le PDF et l'envoyer à l'API
          await generateTicketPDF(nom, prenom, adressePostal, nomSociete, adrSociete, siret, email, userId);
          setShowAlert(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
        }
      }
    } catch (error) {
      setError('Une erreur s\'est produite. Veuillez réessayer plus tard.');
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
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
    <div className='ensemble'>
      <div className='corpsgauche'></div>
      <div className='corpsdroite'>
        <div className='inscription'>
          {!isPaymentFormVisible ? (
            <form onSubmit={(e) => { e.preventDefault(); handleShowPaymentForm(); }}>
              <label className='title2'>Pour vous inscrire, vous devez payer un abonnement unique de 20€ et vous aurez le droit à 20Go de stockage</label>
              <div className="form-row">
                <div className="form-group">
                  <label className="title2" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="title2" htmlFor="nom">Nom</label>
                  <input
                    type="text"
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="title2" htmlFor="prenom">Prénom</label>
                  <input
                    type="text"
                    id="prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="title2" htmlFor="adressePostal">Adresse postale</label>
                  <input
                    type="text"
                    id="adressePostal"
                    value={adressePostal}
                    onChange={(e) => setAdressePostal(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="title2" htmlFor="nomSociete">Nom de société</label>
                  <input
                    type="text"
                    id="nomSociete"
                    value={nomSociete}
                    onChange={(e) => setNomSociete(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="title2" htmlFor="adrSociete">Adresse postale de la société</label>
                  <input
                    type="text"
                    id="adrSociete"
                    value={adrSociete}
                    onChange={(e) => setAdrSociete(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="title2" htmlFor="siret">SIRET</label>
                  <input
                    type="text"
                    id="siret"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="title2" htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  
                </div>
                <div className="form-group">
                  <label className="title2" htmlFor="adminPassword">Mot de passe Admin (facultatif)</label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div></div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit">S'inscrire et payer</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <img className='logo' src={logo} alt="Logo" />
                <label className='label-card'>Nom du propriétaire:</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  maxLength="30"
                  placeholder="Nom sur la carte"
                  required
                />
              </div>
              <div className="form-group">
                <label className='label-card'>Numéro de carte bancaire:</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength="19"
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                />
              </div>
              <div className="form-group">
                <label className='label-card'>Date d'expiration:</label>
                <input
                  type="text"
                  value={cardDate}
                  onChange={(e) => setCardDate(e.target.value)}
                  placeholder="MM/AA"
                  required
                />
              </div>
              <div className="form-group">
                <label className='label-card'>Code secret:</label>
                <input
                  type="text"
                  value={cardCode}
                  onChange={(e) => setCardCode(e.target.value)}
                  maxLength="3"
                  placeholder="CVC"
                  required
                />
                  
              </div>
              <button type="submit">Payer</button>
            </form>
          )}
        </div>
      </div>
      {showAlert && (
      <CustomAlert
        message="Mail de confirmation envoyé"
        type="success"
        duration={5000}
        onClose={() => setShowAlert(false)}
      />
    )}
    </div>
  );
}

export default Inscription;
