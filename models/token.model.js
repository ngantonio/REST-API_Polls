const mongoose = require('mongoose');
const moment = require('moment'); 
const Schema = mongoose.Schema;

const SessionSchema = Schema({

  uid:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tokenHash: string,
  valid_from:{
    type: Date, 
    default: Date.now()
  },
  expired_at:{
    type: Date, 
    default: Date.now()
  }

});

module.exports = mongoose.model('Session',SessionSchema);