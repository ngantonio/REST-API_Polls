module.exports = {

  port:         process.env.PORT || 3000,
  database:     process.env.MONGODB || "mongodb://localhost:27017/eshop",
  SECRET_TOKEN: 'miClaveSecretaDeTokenSuperLarga'
}