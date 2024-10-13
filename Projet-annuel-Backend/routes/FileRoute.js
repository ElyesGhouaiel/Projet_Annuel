const express=require('express')
const multer = require('multer');

// Partie ou l'on retrouve les routes des API File

const Route=express.Router()
const File=require('../controller/FileController')
const User=require('../controller/userController.')
// Configuration de Multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

Route.post('/addFile',upload.single('file'),File.InsertFile)

Route.post('/show',User.authenticator,File.showFiles)

Route.post('/showAllFiles',User.authenticator,File.showFilesOfUsers)



Route.post('/delete',User.authenticator,File.deleteFile)

Route.post('/deleteAllfileUser',File.deleteFileOfUser)

Route.post('/filecount',User.authenticator,File.countFile)

Route.post('/fileAllcount',User.authenticator,File.countAllFile)

Route.post('/fileAllcountNow',User.authenticator,File.countAllFileNow)

Route.post('/repartition',User.authenticator,File.repartitionFileByUser)


module.exports=Route