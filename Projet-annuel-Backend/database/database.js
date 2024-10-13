const Sequelize = require('sequelize')
require('dotenv').config()


const sequelize = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD,{
    host: process.env.HOST,
    dialect: 'mariadb'
})
 
//test de connexion
sequelize.authenticate().then(()=>{
    console.log("authentification réussi");
}).catch((err)=>{
    console.log(err);
})


module.exports= sequelize





