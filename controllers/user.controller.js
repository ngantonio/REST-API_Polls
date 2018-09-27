const User = require('../models/user.model');

function updateLastLogin(userId,loginDate){
  User.updateOne({ _id: userId}, { $set: { lastLogin: loginDate }},(err, rows)=>{});
}


module.exports = {
  updateLastLogin
}