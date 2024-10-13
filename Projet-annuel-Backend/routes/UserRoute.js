const express=require('express')

// Partie ou l'on retrouve les routes des API USer

const Route=express.Router()
const User=require('../controller/userController.')


Route.post('/createUser',User.createUser)

Route.post('/senmail',User.sendMail)

Route.post('/senmaildelete',User.sendMailSuppression)

Route.post('/login', User.login)

Route.post('/admin', User.Admin_OR_NOT)

Route.post('/token', User.authenticator)

Route.get('/ListeUser', User.listeUser)

Route.post('/infosuser', User.listeUserOnly)

Route.post('/deleteUser', User.DeleteUser)

Route.post('/updateuser', User.updateUser)

Route.post('/add20go', User.Add20Go)
Route.post('/GETID', User.GetId)


Route.post('/UserStockage', User.StockgaDisponibleUser)

module.exports=Route