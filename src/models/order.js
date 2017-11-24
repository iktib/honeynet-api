const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const uuid = require('node-uuid');
const Users = require("../models/user");


const OrderSchema = new Schema({

  _id: {
    type: String,
    default: uuid.v1,
    unique: true
  },
  clientId: {
    type: String,
    ref: 'Users',
    required: true
  },
  companyTitle: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },

  creationDate: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: String,
    required: true
  },
  deliveryTimeFrom: {
    type: String,
    required: true
  },
  deliveryTimeTo: {
    type: String,
    required: true
  },
  currentState: {
    type: String,
    enum: ['new', 'rejected', 'accepted', 'delivery', 'paid'],
    required: true
  },
  orderStates: {
    new: {
      time: {    
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['success', 'fail', 'none'],
        default: 'none'
      }
    },
    rejected: {
      time: {    
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['success', 'fail', 'none'],
        default: 'none'
      }
    },
    accepted: {
      time: {    
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['success', 'fail', 'none'],
        default: 'none'
      }
    },
    delivery: {
      time: {    
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['success', 'fail', 'none'],
        default: 'none'
      }
    },
    paid: {
      time: {    
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['success', 'fail', 'none'],
        default: 'none'
      }
    }
  },
  isOrderSelected: {
    type: Boolean,
    default: false
  }

}, {
  collection: 'orders',
  versionKey: false
});

OrderSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Orders', OrderSchema);
