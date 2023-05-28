const querystring = require("node:querystring");
const crypto = require("node:crypto");
const secret = "this_witt_saoamae_gen_cdac_stein";

const encryptPassword = (password) => {

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString('hex');

  return `${salt}:${hash}`;
};

const verifyPassword =  (pass, hashedPass) => {
  const [salt, storedPass] = hashedPass.split(':');

  //Este é o método usado para geração de um hash, passamos como parâmetro:
  // a senha, o salt, o numéro de iterações realizadas, comprimento do valor dispersado, em bytes, algoritimo de hash
  const hash = crypto.pbkdf2Sync(pass,salt,1000,64,'sha512').toString('hex');

  return hash === storedPass;
}

const gerarURL = (dados) => {
  const iv = crypto.randomBytes(16); //gerar vetor de inicialização, com comprimento de 16 bytes
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secret), iv); // gerar cipher, passando o alg, secret e iv
  let encryptedData = cipher.update(JSON.stringify(dados), "utf-8", "hex");//encriptar os dados 
  encryptedData += cipher.final("hex"); //

  const query = querystring.stringify({d: encryptedData, v: iv.toString("hex"),// gerar string de consulta com dados encripitados
  });
  const url = `127.0.0.1:5500/ishaveapp_back/mail-front-end/confirmCad.html?${query}`; // construir url 

  return url;
};


const decryiptURL = (url, ivHex) => {
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secret),
    iv
  );
  let decryptedData = decipher.update(url, "hex", "utf8");
  decryptedData += decipher.final("utf8");

  return JSON.parse(decryptedData);
};

module.exports = { encryptPassword, verifyPassword, gerarURL, decryiptURL };

const urlConfirm = gerarURL({
  nome: "carlos",
  email: "carlos23@gmail.com",
  password: "ilovethecaroftheworld",
});




// const queryParametros = querystring.parse(urlConfirm.split("?")[1]);
// const encryptedData = queryParametros.d;
// const ivHex = queryParametros.v;
// console.log("URL de confirmação: " + urlConfirm);
// const dados = decryiptURL(encryptedData, ivHex);
// console.log("Dados descripitografados: " + dados.nome);
