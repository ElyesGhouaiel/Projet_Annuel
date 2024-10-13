const { error, log } = require('console')
const  File=require('../modele/Files')
const  User=require('../modele/User')
const { Op,Sequelize } = require('sequelize');
const Cookies = require('cookies')
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');
const { now } = require('sequelize/lib/utils');

//Partie Api File

require('dotenv').config()



// Api permettant de récupérer tous les fichiers de l'utilisateur correspondant
exports.showFiles = async (req, res) => {
    try {
        let id
        const {token,userID}=req.body

        jwt.verify(token, process.env.API_KEY, async (err, decoded) => {

               // Récupère tous les fichiers liés à l'ID de l'utilisateur
            const files = await File.findAll({ where: { userid: userID } });

            // Retourne les fichiers
            return res.status(200).json({ files });

        })        



    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'historique de l'utilisateur" ,userID});
    }
}



// APi permettant de récupérer tous les fichiers de chaque utilisateurs
exports.showFilesOfUsers = async (req, res) => {
  try {
    const { token } = req.body;

    jwt.verify(token, process.env.API_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token invalide" });
      }

      // Récupère tous les fichiers de tous les utilisateurs
      const files = await File.findAll();

      // Crée un tableau de promesses pour récupérer les utilisateurs associés
      const fileWithUserPromises = files.map(async file => {
        // Récupère l'utilisateur associé au fichier
        const user = await User.findOne({ where: { id: file.userid } }); // Assurez-vous que 'userId' est le bon champ

        // Retourne un objet contenant les données du fichier et l'email de l'utilisateur
        return {
          ...file.dataValues,
          userEmail: user ? user.email : 'Email non disponible', // Ajoutez l'email de l'utilisateur
        };
      });

      // Attends que toutes les promesses se résolvent
      const filesWithUsers = await Promise.all(fileWithUserPromises);

      // Retourne les fichiers avec les informations utilisateur
      return res.status(200).json(filesWithUsers);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des fichiers" });
  }
};



// API d'insertion des fichier 
exports.InsertFile = async (req, res) => {
    try {
      // Extraire les données du corps de la requête
      const { nom, taille, userid, stockagedisponible } = req.body;
      const fileBuffer = req.file.buffer; // Utiliser req.file.buffer pour accéder aux données binaires du fichier

    // Calculer le stockage final
    const stockageFinal = stockagedisponible - taille;


      // Traite  le contenu du fichier comme nécessaire
      console.log('Contenu du fichier en hexadécimal :', fileBuffer.toString('hex'));
  
   await File.create({ nom: nom, file: fileBuffer, Taille: taille, userid: userid });
            await User.update({
                            stockagedisponible:stockageFinal
                            
                            }, {
                                where: { id: userid }
                            });
      

      // Mettre à jour l'espace de stockage disponible de l'utilisateur
  
      return res.status(200).json(stockageFinal);
    } catch (error) {
      console.error('Une erreur s\'est produite lors de l\'envoi du fichier :', error);
      return res.status(500).json('Une erreur s\'est produite lors de l\'envoi du fichier.');
    }
  };
  




//API pour supprimer un fichier via son id
exports.deleteFile = async (req, res) => {
    const { id } = req.body; 
    
    try {
        const result = await File.destroy({
            where: { id: id }
        });

        // Vérifier si un fichier a été supprimé
        if (result === 0) {
            return res.status(404).json({ message: 'Fichier non trouvé ou déjà supprimé.' });
        }

        res.status(200).json({ message: 'Suppression réalisée' });

    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du fichier. Veuillez réessayer plus tard.' });
    }
};



//API qui supprime tous les fichiers du user lors de la suppression de compte
exports.deleteFileOfUser = async (req, res) => {
    const { userid } = req.body; 
    


    try {
      const numberFilenow = await File.destroy({
        where: { userid: userid }
       
      });
  
      res.status(200).json('suppression réussi');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur lors de la suppression" });
    }

};



//API permettant de compter le nombre total de fichier uplouade par l'utilisateur
exports.countFile = async (req, res) => {
    const { userid } = req.body; 
    
    const numberFile = await File.count({
        where: { userid: userid }
    });
    res.status(200).json(numberFile);

};



//API permettant de compter le nombre total de fichier présent dans la bdd donc sur le site
exports.countAllFile = async (req, res) => {
    
    const numberFile = await File.count();
    res.status(200).json(numberFile);

};


// API permettant de compter les fichiers upluoade seulement le jout même 
exports.countAllFileNow = async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const numberFilenow = await File.count({
        where: {
            createdAt: {
                [Op.gte]: startOfToday,
                [Op.lt]: endOfToday
            }
        }
    });
    res.status(200).json(numberFilenow);

};

// API permettant de voir la liste des utilisateurs avec le nombre de fichiers et la taille totale des fichiers par utilisateur
exports.repartitionFileByUser = async (req, res) => {
  try {
    // Étape 1 : Récupérer tous les utilisateurs
    const users = await User.findAll({
      attributes: ['id', 'nom', 'prenom', 'stockagedisponible', 'quantiteStockage']
    });

    // Étape 2 : Compter les fichiers et calculer la taille totale des fichiers pour chaque utilisateur
    const userFileData = await Promise.all(users.map(async (user) => {
      const fileCount = await File.count({
        where: { userId: user.id }
      });

      const totalFileSize = await File.sum('Taille', {
        where: { userId: user.id }
      });

      return {
        userId: user.id,
        nom: user.nom,
        prenom: user.prenom,
        stockagedisponible: user.stockagedisponible,
        quantiteStockage: user.quantiteStockage,
        nombre_de_fichiers: fileCount,
        taille_totale_fichiers: totalFileSize || 0 // taille totale des fichiers en octets, valeur par défaut si null
      };
    }));

    // Retourner les résultats
    res.status(200).json(userFileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de la répartition des fichiers par utilisateur" });
  }
};
