var FCM = require('fcm-node');
var constants = require('../constants/constants.json');
var serverKey = constants.fcm_api_key;
var fcm = new FCM(serverKey);

const Devices = require('../models/device');

exports.sendMessage = function (title, message, userId, orderId, callback) {
  const resMsg = []

  Devices.find({
    userId: userId
  }, (err, deviceList) => {

    if (err) {
      console.error('ОШИБКА ->', err);
    }

    if (deviceList) {

      const regTokens = []
      deviceList.forEach(device => {
        regTokens.push(device.registrationId)
      })

      var msg = {
        registration_ids: regTokens,

        notification: {
          title: title,
          body: message
        },

        data: {
          title: title,
          message: message,
          orderId: orderId,
          soundname: "default"
          
        }
      };


      fcm.send(msg, function (err, response) {
        if (err) {
          callback(constants.error.msg_send_failure)
        } else {
          callback(constants.error.msg_send_success)
        }
      });
      
    } else {
      console.error('err');
    }


  });

};