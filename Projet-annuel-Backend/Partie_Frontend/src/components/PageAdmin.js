import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import './Admin.css';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import Video from '../img/city-night-panorama-moewalls-com.mp4';

//page faite par elyes

//composant réservé au user qui sont Admin
function PageAdmin() {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [token, setToken] = useState('');
  const [totalFile, setTotalFile] = useState(2);
  const [totalFileNow, setTotalFileNow] = useState(0);
  const [chartType, setChartType] = useState('bar');
  const [totalFileByUser, setFileByUser] = useState([]);
  const [AllFileOfUsers, setAllfilesOFUsers] = useState([]);

  // États pour le filtrage et le tri
  const [filterNom, setFilterNom] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [sortType, setSortType] = useState('date'); // Ajout d'état pour le tri

  useEffect(() => {
    const value = Cookies.get('token');
    if (value) {
      const decodedToken = jwtDecode(value);
      const tokenData = JSON.parse(value);

      setUserId(decodedToken.id);
      setRole(decodedToken.role);
      setToken(tokenData);
    }
  }, []);


  // on appelle les api qui permettent d'avoir des infos sur les user, les fichiers etc...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('http://localhost:8000/file/fileAllcount', {
          token: token
        });
        if (response.status === 200) {
          setTotalFile(response.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error);
      }

      try {
        const responseNow = await axios.post('http://localhost:8000/file/fileAllcountNow', {
          token: token
        });
        if (responseNow.status === 200) {
          setTotalFileNow(responseNow.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des fichiers :', error);
      }

      try {
        const FileByUsers = await axios.post('http://localhost:8000/file/repartition', {
          token: token
        });
        if (FileByUsers.status === 200) {
          setFileByUser(FileByUsers.data);
          console.log(FileByUsers.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite , attention :', error);
      }

      try {
        const AllFilesOFUsers = await axios.post('http://localhost:8000/file/showAllFiles', {
          token: token
        });
        if (AllFilesOFUsers.status === 200) {
          setAllfilesOFUsers(AllFilesOFUsers.data);
          console.log(AllFilesOFUsers.data);
        }
      } catch (error) {
        console.error('Une erreur s\'est produite , attention :', error);
      }
    };

    fetchData();
  }, [token]);

  const data = {
    labels: ['Total de fichier uploadé', 'Fichier uploadé aujourd\'hui'],
    datasets: [
      {
        label: 'Nombre de fichiers',
        data: [totalFile, totalFileNow],
        backgroundColor: ['#5eabbae5', '#454040'], // Liste des couleurs de fond
 
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white', // Couleur des labels de la légende
          font: {
            size: 20 // Taille de la police des labels de la légende
          }
        }
      },
      tooltip: {
        titleColor: 'white', // Couleur du titre des tooltips
        bodyColor: 'white', // Couleur du texte des tooltips
        backgroundColor: '#5eabbae5', // Couleur de fond des tooltips pour plus de contraste
      }
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'radar':
        return <Radar data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  // Filtrage et tri des fichiers
  const filteredFiles = AllFileOfUsers
    .filter(file => 
      (filterNom === '' || file.nom.toLowerCase().includes(filterNom.toLowerCase())) &&
      (filterDate === '' || file.createdAt.includes(filterDate)) &&
      (filterUserId === '' || file.userid.toString().includes(filterUserId))
    )
    .sort((a, b) => {
      if (sortType === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt); // Tri par date d'upload
      } else if (sortType === 'size') {
        return b.Taille - a.Taille; // Tri par taille
      }
      return 0;
    });


// Fonction pour formater la taille en bytes en une chaîne lisible
// bytes: nombre de bytes à formater
// decimalPlaces: nombre de décimales à afficher (par défaut 2)
const formatBytes = (bytes, decimalPlaces = 2) => {
  // Si le nombre de bytes est 0, retourne directement '0 Byte'
  if (bytes === 0) return '0 Byte';

  // Définition de la base pour les conversions (1024 pour les unités binaires)
  const k = 1024;

  // Assure que le nombre de décimales est au moins 0
  const dm = decimalPlaces < 0 ? 0 : decimalPlaces;

  // Tableau des unités de mesure de taille
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  // Calcule l'index de l'unité appropriée
  // Math.log(bytes) / Math.log(k) donne le nombre de fois que k entre dans bytes
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Calcule la valeur en l'unité appropriée et la formate
  // Math.pow(k, i) calcule k^i
  // toFixed(dm) arrondit à 'dm' décimales
  // parseFloat supprime les zéros inutiles à la fin
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
    
return (
  <div className="admin-dashboard">
    <video autoPlay muted loop className="background-video">
      <source src={Video} type="video/mp4" />
    </video>

    {role === 'Admin' ? (
      <div className="admin-content">
        <section className="chart-section">
          <h2 className="section-title">Statistiques</h2>
          <div className="chart-controls">
            <label htmlFor="chartType">Type de graphique :</label>
            <select id="chartType" value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Barre</option>
              <option value="line">Ligne</option>
              <option value="pie">Camembert</option>
              <option value="radar">Radar</option>
            </select>
          </div>
          <div className="chart-container">
            {renderChart()}
          </div>
        </section>

        <section className="users-section">
          <h2 className="section-title">Liste des utilisateurs</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom et prénom</th>
                  <th>Fichiers uploadés</th>
                  <th>Stockage utilisé / Total</th>
                </tr>
              </thead>
              <tbody>
                {totalFileByUser.map(file => (
                  <tr key={file.userId}>
                    <td>{file.userId}</td>
                    <td>{`${file.nom} ${file.prenom}`}</td>
                    <td>{file.nombre_de_fichiers}</td>
                    <td>{`${formatBytes(file.taille_totale_fichiers)} / ${formatBytes(parseFloat(file.quantiteStockage), 2)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="files-section">
          <h2 className="section-title">Liste des fichiers</h2>
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Filtrer par nom de fichier"
              value={filterNom}
              onChange={(e) => setFilterNom(e.target.value)}
            />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filtrer par ID d'utilisateur"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
            />
            <div className="sort-control">
              <label htmlFor="sortType">Trier par :</label>
              <select
                id="sortType"
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="date">Date d'upload</option>
                <option value="size">Poids</option>
              </select>
            </div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom du fichier</th>
                  <th>Taille</th>
                  <th>Date de création</th>
                  <th>ID utilisateur</th>
                  <th>Email utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>{file.id}</td>
                    <td>{file.nom}</td>
                    <td>{formatBytes(file.Taille)}</td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td>{file.userid}</td>
                    <td>{file.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    ) : (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        <button onClick={() => window.location.href='/User'} className="back-button">Retour</button>
      </div>
    )}
  </div>
);
}
export default PageAdmin;
