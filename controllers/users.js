const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;

module.exports = {
    async register(req,res){
        
        const newUser = await prisma.usuarios.create({data:{
                nomeUsuario: req.body.nomeUsuario,
                emailUsuario: req.body.emailUsuario,
                senhaUsuario: req.body.senhaUsuario,
                prestador: req.body.adm ? undefined : req.body.prestadorId,
                enderecoId: req.body.enderecoId 
            }})

        res.json(newUser)
    },
    async userexists(req, res, next){
        const qtdUserWithData = await prisma.usuarios.count({
            where:{
                emailUsuario: req.body.emailUsuario,
                senhaUsuario: req.body.senhaUsuario
            }
        })

        if( qtdUserWithData == 1){
            res.send('<h2>Usuário já existente, faça o login</h2>')
        }else{
            next();
        }
    },
    async logar(req,res){
        const user = await prisma.usuarios.count({
            where: {
                emailUsuario: req.body.emailUsuario,
                senhaUsuario: req.body.senhaUsuario
            } 
        })
        if(user == 1){
            res.send("Conceder acesso")
        }else{
            res.send("Senha ou usuário inválidos")
        }
    }
}
