const User = require('../modele/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { Op,Sequelize } = require('sequelize');

const EMAIL_USER = "killianc142@gmail.com";
const EMAIL_PASS = "qaqf wlxy kulg vokg"; // Remplacez par votre mot de passe Gmail
const API_KEY = process.env.API_KEY;



// API permettant de créer un utilisateur et si le mot de passe pour le mode Admin correspond, l'utilisateur créer est admin
exports.createUser = async (req, res) => {
    const { nom, prenom, email, adresse_postale, adresse_postale_societe, Nom_de_societe, siret, password, quantiteStockage, stockagedisponible, role } = req.body;

    const result = await User.findOne({ where: { email: email } });
    if (result) {
        return res.status(400).json("Erreur : email déjà existant");
    } else {
        const hashedPassword = await bcrypt.hash(password, 5);
        await User.create({ nom, prenom, email, adresse_postale, adresse_postale_societe, Nom_de_societe, siret, password: hashedPassword, quantiteStockage, stockagedisponible, role });
        return res.status(200).json("Création réussie");
    }
};



//API permettant d'envoyer un mail lors de l'inscription
exports.sendMail = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const { to, text, fichier } = req.body;

        const mailOptions = {
            from: EMAIL_USER,
            to: to,
            subject: 'Votre facture',
            text: text,
            attachments: [{
                filename: 'facture.pdf',
                content: Buffer.from(fichier, 'base64'), // Convertir base64 en buffer
                encoding: 'base64'
            }]
        };

        transporter.sendMail(mailOptions)
            .then(info => res.status(200).send('E-mail envoyé: ' + info.response))
            .catch(error => res.status(500).send(error.toString()));
    } catch (error) {
        res.status(500).send(error.toString());
    }
};


// API permettant l'envoie d'un email pour prévenir de la supression du compte
exports.sendMailSuppression = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const { to, text } = req.body;

        const mailOptions = {
            from: EMAIL_USER,
            to: to,
            subject: 'Suppression de compte',
            text: text
        };

        transporter.sendMail(mailOptions)
            .then(info => res.status(200).send('E-mail envoyé: ' + info.response))
            .catch(error => res.status(500).send(error.toString()));
    } catch (error) {
        res.status(500).send(error.toString());
    }
};

// API permettant la vérification de l'utilisateur, si il existe et si l'identifiant et le mtp sont correcte
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const result = await User.findOne({ where: { email: email } });

    if (!result) {
        return res.status(400).json('Mot de passe ou identifiant faux');
    } else {
        const passwordTrue = await bcrypt.compare(password, result.password);

        if (!passwordTrue) {
            return res.status(400).json(false);
        }

        const token = jwt.sign(
            {
                email,
                id: result.id,
                nom: result.nom,
                prenom: result.prenom,
                quantiteStockage: result.quantiteStockage,
                stockagedisponible: result.stockagedisponible,
                role: result.role,
                password:password,
                quantiteStockage:result.quantiteStockage,
                nomsociete:result.Nom_de_societe,
                siret:result.siret,
                adresse_postale:result.adresse_postale,
                adresse_postale_societe:result.adresse_postale_societe
            },
            API_KEY,
            { expiresIn: '1h' }
        );

        return res.status(200).json(token);
    }
};



// API qui vérifie si l'utilisateur à un cookie avec le token, evitant les usurpasion
exports.authenticator = async (req, res, next) => {
    const token = req.body.token ? req.body.token : req.headers.authorization;

    if (token) {
        let decoded = jwt.verify(token, API_KEY);
        if (decoded) {
            next();
        } else {
            return res.status(401).json("Unauthorized");
        }
    } 
};

//verifie si l'utilisateur est admin ou non
exports.Admin_OR_NOT = async (req, res, next) => {
    const token = req.body.token ? req.body.token : req.headers.authorization;

    jwt.verify(token, API_KEY, async (err, decoded) => {
        if (err) {
            return res.status(401).json("Unauthorized");
        } else {
            const result = await User.findOne({ where: { email: decoded.email } });
            console.log(result.role);
            let role = result.role;

            if (role.toLowerCase() === "Admin") {
                next();
            } else {
                return res.status(401).json("Vous n'avez pas le bon rôle");
            }
        }
    });
};


// API qui affiche la liste de tous les utilisateurs
exports.listeUser = async (req, res) => {
    const users = await User.findAll();
    res.status(200).json(users);
};


//API qui permet de trouver l'utilisateur selon l'iduser du fichier en question
exports.listeUserOnly = async (req, res) => {
    try {
        const {userID}=req.body

      

               // Récupère tous les fichiers liés à l'ID de l'utilisateur
            const user = await User.findOne({ where: { id: userID } });

            // Retourne les fichiers
            return res.status(200).json({ user });

           



    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération de l'historique de l'utilisateur" ,userID});
    }
};


//API qui supprime l'utilisateur
exports.DeleteUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await User.destroy({ where: { email: email} });
        if (result > 0) {
            return res.status(200).json("Suppression réussie");
        } else {
            return res.status(400).json("Erreur : impossible de supprimer l'utilisateur");
        }
    } catch (error) {
        console.error("Une erreur s'est produite lors de la suppression de l'utilisateur :", error);
        return res.status(500).json("Une erreur s'est produite lors de la suppression de l'utilisateur");
    }
};

//API met à jours les donnée de l'utilisateur, de son stockage acheté
exports.updateUser = async (req, res) => {
  
    const { size, id } = req.body;

    await User.update({
        stockagedisponible: size,
        
        }, {
            where: { id: id }
        });

    res.status(200).json('Mise à jour réalisée');

};




//API qui ajoute  20GO supplémentaire sur la quentité de stockage total
exports.Add20Go = async (req, res) => {
    const { email } = req.body;

    try {
        // Trouver l'utilisateur avec l'email donné
        const user = await User.findOne({ where: { email: email } });

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Mettre à jour la quantité de stockage
        user.quantiteStockage = 42949672960;

        // Sauvegarder les modifications
        await user.save();

        return res.status(200).json("User updated successfully");
    } catch (error) {
        console.error(error); // Optionnel : journaliser l'erreur pour le débogage
        return res.status(500).json("An error occurred");
    }
};

//API qui permet de récupérer l'id du user lors de la création de compte pour l'ajout du pdf de facture sur le compte du user
exports.GetId = async (req, res) => {
    const { email } = req.body;

    try {
        // Trouver l'utilisateur avec l'email donné
        const user = await User.findOne({ where: { email: email } });

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json("User not found");
        }


        return res.status(200).json(user)
    } catch (error) {
        console.error(error); // Optionnel : journaliser l'erreur pour le débogage
        return res.status(500).json("An error occurred");
    }
};



// API qui recherche la quantité de stockage de l'utilisateur
exports.StockgaDisponibleUser = async (req, res) => {
    try {
        const { userID } = req.body;

        // Rechercher l'utilisateur avec l'ID spécifié
        const user = await User.findOne({
            attributes: [
                [Sequelize.col('id'), 'userId'],
                [Sequelize.col('stockagedisponible'), 'stockageDisponible'] // Ajoutez les attributs que vous souhaitez renvoyer
            ],
            where: { id: userID }
        });

        // Vérifier si l'utilisateur a été trouvé
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Retourner les données de l'utilisateur
        return res.status(200).json( user );

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
    }
};
    