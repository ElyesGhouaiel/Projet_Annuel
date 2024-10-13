import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import './PageUser.css';
import logo from '../img/dossier.png';
import Delete from '../img/delete.png';
import Ajouter from '../img/ajouter.png';
import Video from '../img/city-night-panorama-moewalls-com.mp4'
import CustomAlert from './CustomAlert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPlus, faSearch, faFilter, faSort } from '@fortawesome/free-solid-svg-icons';
//page faite par elyes


//composant permettant au user d'insérer, supprimer et télécharger les fichier insérer
function PageAccueil() {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [userId, setUserid] = useState('');
  const [token, setToken] = useState('');
  const [denied, setDenied] = useState(false);
  const [quantiteStockage, setQuantiteStockage] = useState(0);
  const [stockageDisponible, setStockageDisponible] = useState(0);
  const [userInfos, setUserInfos] = useState({});
  const [Buttonenable, setButton] = useState(true);

  const [fileName, setFileName] = useState('');
  const [fileToSend, setFileToSend] = useState(null);
  const [fileTaille, setFileTaille] = useState('');
  
  const [sortType, setSortType] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [ShowAlertDelete, setShowAlertDelete] = useState(false);

  useEffect(() => {
    const value = Cookies.get('token'); // Récupère le token stocké dans les cookies
    if (value) {
      const tokenData = JSON.parse(value); // Parse le token en un objet JSON
      const decodedToken = jwtDecode(tokenData); // Décode le token pour extraire les informations utilisateur
      
      setUserid(decodedToken.id); // Définit l'ID utilisateur dans l'état
      setQuantiteStockage(decodedToken.quantiteStockage); // Définit la quantité de stockage dans l'état
      setToken(tokenData); // Définit le token dans l'état

      fetchFiles(decodedToken.id, tokenData); // Récupère les fichiers associés à l'utilisateur
      fetchUserInfos(decodedToken.id); // Récupère les informations utilisateur associées à l'ID
    } else {
      window.location.href = '/Denied'; // Redirige vers une page d'accès refusé si le token est absent
    }
  }, []);

 // On appelle l'API pour vérifier la présence des fichiers
const fetchFiles = async (id, tokenData) => {
  try {
    const response = await axios.post('http://localhost:8000/file/show', {
      token: tokenData, // Inclut le token dans la requête
      userID: id, // Envoie l'ID de l'utilisateur dans la requête
    });

    if (response.status === 200) {
      setFiles(response.data.files); // Met à jour l'état avec les fichiers récupérés
      setFilteredFiles(response.data.files); // Initialise les fichiers filtrés avec les données récupérées
    } else {
      setDenied(true); // Active l'état d'accès refusé si la requête échoue
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error); // Affiche une erreur en cas de problème
  }
};

  // On appelle l'API pour récupérer les informations de l'utilisateur
const fetchUserInfos = async (id) => {
  try {
    const response = await axios.post('http://localhost:8000/user/infosuser', {
      userID: id, // Envoie l'ID de l'utilisateur dans la requête
    });

    if (response.status === 200) {
      setUserInfos(response.data.user); // Met à jour l'état avec les informations utilisateur récupérées
      setStockageDisponible(response.data.user.stockagedisponible); // Met à jour le stockage disponible dans l'état
    } else {
      setDenied(true); // Active l'état d'accès refusé si la requête échoue
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la récupération des informations utilisateur :', error); // Affiche une erreur en cas de problème
  }
};


 // Met à jour le nom du fichier
const handleFileChange = (event) => {
  const file = event.target.files[0]; // Récupère le premier fichier sélectionné
  if (file) {
    setFileName(file.name); // Met à jour l'état avec le nom du fichier
    setFileToSend(file); // Enregistre le fichier pour l'envoi avec son contenu en binaires
    setFileTaille(file.size); // Met à jour la taille du fichier dans l'état
    if (file.size < quantiteStockage) { // Vérifie si la taille du fichier est inférieure à l'espace de stockage disponible
      setButton(false); // Active le bouton d'envoi si la condition est remplie
    }
  }
};



 // Fonction qui appelle l'API pour insérer un fichier
const handleFileUpload = async () => {
  try {
    const formData = new FormData();
    formData.append('file', fileToSend); // Ajoute le fichier à envoyer au formData
    formData.append('nom', fileName); // Ajoute le nom du fichier
    formData.append('taille', fileTaille); // Ajoute la taille du fichier
    formData.append('userid', userId); // Ajoute l'ID utilisateur
    formData.append('stockagedisponible', stockageDisponible); // Ajoute l'espace de stockage disponible
    formData.append('type', fileToSend.type); // Ajoute le type MIME du fichier

    if (fileTaille > stockageDisponible || fileTaille > quantiteStockage) { // Vérifie si le fichier dépasse l'espace de stockage disponible
      alert('Votre fichier dépasse la taille de stockage disponible'); // Alerte si la taille dépasse la limite
    } else {
      const response = await axios.post('http://localhost:8000/file/addFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Spécifie l'en-tête multipart pour l'envoi de fichier,indique que la requête contient des données qui peuvent inclure des fichiers.


        }
      });
      setShowAlert(true);
      // Alerte de succès d'envoi
      fetchFiles(userId, token); // Recharge les fichiers après l'envoi
      setStockageDisponible(response.data); // Met à jour l'espace de stockage disponible après l'envoi
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de l\'envoi du fichier :', error); // Gère les erreurs lors de l'envoi
  }
};



// Fonction qui appelle l'API pour supprimer un fichier
const handleFileDelete = async (ID, fileSize) => {
  try {
    const data = {
      id: ID, // ID du fichier à supprimer
      token: token, // Token d'authentification
    };

    const response = await axios.post('http://localhost:8000/file/delete', data); // Envoie la requête de suppression

    if (response.status === 200) {
      setShowAlertDelete(true) // Alerte de confirmation de suppression
      setFiles(files.filter(file => file.id !== ID)); // Met à jour la liste des fichiers après suppression
      setFilteredFiles(filteredFiles.filter(file => file.id !== ID)); // Met à jour la liste filtrée des fichiers
      updateUserStorage(fileSize); // Met à jour l'espace de stockage de l'utilisateur
    }
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la suppression du fichier :', error); // Gère les erreurs lors de la suppression
  }
};

 // Fonction qui appelle l'API pour mettre à jour le stockage disponible de l'utilisateur
const updateUserStorage = async (fileSize) => {
  try {
    const newStorage = stockageDisponible + fileSize; // Calcule le nouveau stockage disponible
    await axios.post('http://localhost:8000/user/updateuser', {
      id: userId, // ID de l'utilisateur
      size: newStorage, // Nouvelle taille de stockage disponible
    });
    setStockageDisponible(newStorage); // Met à jour l'état avec le nouveau stockage
  } catch (error) {
    console.error('Une erreur s\'est produite lors de la mise à jour du stockage utilisateur :', error); // Gère les erreurs lors de la mise à jour
  }
};


const handleDeleteClick = (fileId, fileSize) => {
  handleFileDelete(fileId, fileSize); // Appelle la fonction de suppression avec l'ID et la taille du fichier
};


useEffect(() => {
  let updatedFiles = [...files]; // Copie des fichiers pour les manipuler

  // Filtrer par nom
  if (searchTerm) {
    updatedFiles = updatedFiles.filter(file =>
      file.nom.toLowerCase().includes(searchTerm.toLowerCase()) // Filtre les fichiers dont le nom correspond à la recherche
    );
  }

  // Filtrer par format
  if (filterFormat) {
    updatedFiles = updatedFiles.filter(file => {
      const fileExtension = file.nom.split('.').pop(); // Récupère l'extension du fichier
      return fileExtension && fileExtension.includes(filterFormat); // Filtre les fichiers par leur format (extension)
    });
  }

  // Trier les fichiers
  if (sortType === 'date') {
    updatedFiles.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)); // Trie par date d'upload (du plus récent au plus ancien)
  } else if (sortType === 'size') {
    updatedFiles.sort((a, b) => b.Taille - a.Taille); // Trie par taille de fichier (du plus grand au plus petit)
  }

  setFilteredFiles(updatedFiles); // Met à jour les fichiers filtrés après les opérations
}, [searchTerm, filterFormat, sortType, files]); // Dépendances : effectue le tri/filtrage à chaque changement
return (
  <div className="dashboard">
    <video autoPlay muted loop className="background-video">
      <source src={Video} type="video/mp4" />
    </video>

    {showAlert && (
      <CustomAlert
        message="Fichier envoyé avec succès"
        type="success"
        duration={5000}
        onClose={() => setShowAlert(false)}
      />
    )}
   {ShowAlertDelete && (
      <CustomAlert
        message="Fichier supprimer avec succès"
        type="success"
        duration={5000}
        onClose={() => setShowAlert(false)}
      />
    )}
    <header className="dashboard-header">
      <button onClick={() => window.location.href = '/DeleteUser'} className="icon-button">
        <FontAwesomeIcon icon={faTrash} />
      </button>
      <button onClick={() => window.location.href = '/NewTarifs'} className="icon-button">
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </header>

    <div className="search-filter-container">
      <div className="search-box">
        <FontAwesomeIcon icon={faSearch} />
        <input
          type="text"
          placeholder="Rechercher un fichier"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-box">
        <FontAwesomeIcon icon={faFilter} />
        <select
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
        >
          <option value="">Tous les formats</option>
          <option value="pdf">PDF</option>
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
          <option value="docx">DOCX</option>
          <option value="xlsx">XLSX</option>
          <option value="txt">TXT</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      <div className="sort-box">
        <FontAwesomeIcon icon={faSort} />
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="date">Date d'upload</option>
          <option value="size">Poids</option>
        </select>
      </div>
    </div>

    <div className="files-grid">
      {Array.isArray(filteredFiles) && filteredFiles.map((file, index) => (
        <div className="file-card" key={index}>
          {file.file && (
            <a href={URL.createObjectURL(new Blob([new Uint8Array(file.file.data)]))} download={file.nom}>
              <img className="file-logo" src={logo} alt="Logo" />
            </a>
          )}
          <p className="file-name">{file.nom}</p>
          <button onClick={() => handleDeleteClick(file.id, file.Taille)} className="delete-button">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ))}
    </div>

    <div className="upload-section">
      <input
        id="file-upload"
        className="file-input"
        type="file"
        onChange={handleFileChange}
      />
      
      {fileName && <p className="file-name-display">Nom du fichier: {fileName}</p>}
      <button className="upload-submit" onClick={handleFileUpload} disabled={Buttonenable}>Envoyer</button>
    </div>
  </div>
);
}

export default PageAccueil;
