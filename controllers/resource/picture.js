
const path = require('path');
module.exports = {
    async ctrlUp (req, res){
        
        const filename = req.file.filename
        const targetpath = path.join(__dirname, '..', 'uploads', filename)

        try {
            
            res.sendFile(targetpath)

        } catch (error) {
            console.log(error)
            res.status(500).json({message:"Erro ao salvar imagem"})
        }
    }
}