const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const uuid = require('node-uuid');

const HoneyNotesSchema = new Schema({
  _id: {
    type: String,
    default: uuid.v1,
    unique: true
  },
  typeId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true   
  },
  utcTimeStamp: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  connectionPort: {
    type: String,
    required: true
  }
}, {
  collection: 'honeyNotes',
  versionKey: false
});

HoneyNotesSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HoneyNotes', HoneyNotesSchema);
