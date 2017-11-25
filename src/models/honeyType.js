const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const uuid = require('node-uuid');

const HoneyTypeSchema = new Schema({
  _id: {
    type: String,
    default: uuid.v1,
    unique: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: { 
    type: String,
    required: true
  }
}, {
  collection: 'honeyTypes',
  versionKey: false
});

HoneyTypeSchema.plugin(uniqueValidator);

module.exports = mongoose.model('HoneyType', HoneyTypeSchema);
