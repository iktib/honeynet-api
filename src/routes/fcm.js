const express = require('express');
var constants = require('../constants/constants.json');
var registerFunction = require('../functions/register');
var devicesFunction = require('../functions/devices');
var deleteFunction = require('../functions/delete');
var sendFunction = require('../functions/send-message');

const router = express.Router();

router.post('/devices', function (req, res) {
    // console.log(req, res)

    var userId = req.body.userId;
    var registrationId = req.body.registrationId;

    if (typeof userId == 'undefined' || typeof registrationId == 'undefined') {
        res.json(constants.error.msg_invalid_param);
    } else if (!userId.trim() || !registrationId.trim()) {
        res.json(constants.error.msg_empty_param);
    } else {

        registerFunction.register(userId, registrationId, function (result) {

            res.json(result);

            if (result.result != 'error') {
                io.emit('update', {
                    message: 'New Device Added',
                    update: true
                });
            }
        });
    }
});

router.get('/devices', function (req, res) {
    devicesFunction.listDevices(function (result) {
        res.json(result);
    });
});

router.delete('/devices/:device', function (req, res) {
    var registrationId = req.params.device;
    deleteFunction.removeDevice(registrationId, function (result) {
        res.json(result);
    });
});

router.post('/send', function (req, res) {
    var title = req.body.title;        
    var message = req.body.message;
    var userId = req.body.userId;
    var orderId = req.body.orderId;

    sendFunction.sendMessage(title, message, userId, orderId, function (result) {
        res.json(result);
    });
});

module.exports = router;

