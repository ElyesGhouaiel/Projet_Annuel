const User=require('../modele/User')

const File=require('../modele/Files')


//API permettant de créer la bdd pour le site, donc de créer les entités
exports.creatTables= async(req,res)=>{
   
    await User.sync({ alter: true });
    
    await File.sync({ alter: true });

    res.status(200).json("table User créer")

}