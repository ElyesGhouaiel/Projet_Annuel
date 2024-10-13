const Sequelize = require('sequelize')
const User = require('./User')
const sequelize = require('../database/database')
const DataTypes = require('sequelize')

const Files = sequelize.define('Files',{
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
    file:{
        type: DataTypes.BLOB('long'), // Utilisation de LONGBLOB pour permettre jusqu'à 4 GiB
    allowNull: false
    } ,
    Taille:{
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0, // Exemple de valeur par défaut
        validate: {
          max: 20 * 1024 * 1024 * 1024 // Taille maximale en octets (20 Go)
        }
    }
},{
  freezeTableName: true,  
})
Files.belongsTo(User, { foreignKey: 'userid' });


module.exports = Files
