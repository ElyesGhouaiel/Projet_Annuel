const express=require('express')

// Partie ou l'on retrouve l'api pour créer les tableaux

const Route=express.Router()
const Table=require('../controller/SqlTable')


Route.get('/createTable',Table.creatTables)

module.exports=Route