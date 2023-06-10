const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads/")
    },
    filename: (req, file, cb)=>{
        const uniqueSuf = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const fileExt = path.extname(file.originalname);
        const fileName = `img_${uniqueSuf}.${fileExt}`
        cb(null, fileName)
    }
})

const up = multer({storage})

module.exports = up