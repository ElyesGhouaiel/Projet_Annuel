const Sequelize = require('sequelize')

const sequelize = require('../database/database')
const DataTypes = require('sequelize')

const User = sequelize.define('User',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    nom:{
        type: DataTypes.STRING,
        allowNull: false
    },
    prenom:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false
    } ,
    adresse_postale:{
        type: DataTypes.STRING,
        allowNull: false
    } 
    ,adresse_postale_societe:{
        type: DataTypes.STRING,
        allowNull: false
    } ,
    Nom_de_societe:{
        type: DataTypes.STRING,
        allowNull: false
    } ,  siret:{
        type: DataTypes.INTEGER,
        allowNull: false
    } ,
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },quantiteStockage:{
        type: DataTypes.STRING,
        allowNull: false
    },stockagedisponible:{
        type: DataTypes.STRING,
        allowNull: false
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false
    }
},{
  freezeTableName: true,  
})

module.exports = User
