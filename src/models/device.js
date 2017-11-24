const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var deviceSchema = new Schema({
  userId: String,
  registrationId: String

}, {
  collection: 'device',
  versionKey: false
});

module.exports = mongoose.model('device', deviceSchema);