const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs');
const uuid = require('node-uuid');


const UserSchema = new Schema({
  //###################################################
  _id: {
    type: String,
    default: uuid.v1,
    unique: true
  },
  managerId: {
    type: String
  },
  isActivated: {
    type: Boolean,
    default: null
  },
  //###################################################
  phone: {
    type: String,
    unique: true,
    validate: {
      validator: (v) => {
        return /^\+7\d{10}$/.test(v);
      },
      message: '{VALUE} is not a valid phone number!'
    },
    required: true
  },
  whatsApp: {
    type: String,
    default: "Номер для WhatsApp",
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['client', 'manager', 'forwarder'],
    default: 'client'
  },
  //###################################################
  fullName: {
    type: String,
    default: "Имя Фамилия"
  },
  photoUrl: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: "Комментарий"
  },
  //###################################################
  companyTitle: {
    type: String,
    default: "Название компании"
  },
  companyAddress: {
    type: String,
    default: "Адрес компании"
  },
  workTimeFrom: {
    type: String,
    default: '10:00'
  },
  workTimeTo: {
    type: String,
    default: '18:00'
  },
  companyLogoUrl: {
    type: String,
    default: ""
  }
  //###################################################
}, {
  collection: 'users',
  versionKey: false
});

UserSchema.plugin(uniqueValidator);

UserSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.methods.comparePassword = function (passw, cb) {
  bcrypt.compare(passw, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

/*
UserSchema.methods.setPassword = function (password, cb) {
  var self = this;
  bcrypt.randomBytes(function(err, buf) {
      if (err) {
          return cb(err);
      }
      var salt = buf.toString('hex');
      bcrypt.pbkdf2(password, salt, function(err, hashRaw) {
          if (err) {
              return cb(err);
          }
          self.set(new Buffer(hashRaw, 'binary').toString('hex'));
          self.set(salt);
          cb(null, self);
      });
  });
};
*/

module.exports = mongoose.model('Users', UserSchema);
