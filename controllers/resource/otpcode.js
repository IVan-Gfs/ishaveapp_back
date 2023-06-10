

function gerarOTP(n){
    var otp = Math.random().toString().replace('.','').substring('1',`${n+1}`)
    return otp;
}

module.exports =  gerarOTP




