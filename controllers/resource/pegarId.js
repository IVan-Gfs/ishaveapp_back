const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient;
module.exports = {
    async empresa(id){
        const user = await prisma.usuarios.findFirst({
            where: {
                session: {
                    some: {
                        idSession: {
                            equals: id
                        }
                    }
                }
            }, select: {
                empresa: {
                    select: {
                        idEmpresa: true
                    }
                }
            }
        })
        return user.empresa.idEmpresa
    }
}
