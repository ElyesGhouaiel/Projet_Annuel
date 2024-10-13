const express = require("express");
const app = express();
const cors = require('cors');
const multer = require('multer');



//Partie du backend 


// Configurer le timeout global
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes en millisecondes
  res.setTimeout(600000); // 10 minutes en millisecondes
  next();
});

// Configurez multer pour accepter des fichiers jusqu'à 20 Go
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 * 1024 } // 20 Go en octets
});

app.use(express.json());
app.use(cors());

// Importer les routes
const User = require('./routes/UserRoute');
const Table = require('./routes/TableRoute');
const File = require('./routes/FileRoute');

// Utiliser les routes
app.use("/user", User);
app.use("/table", Table);
app.use("/file", File);

// Lancer le serveur
app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
