const express = require('express');

const HoneyNote = require('../models/honeyNote');

const mongoose = require('mongoose');

const router = express.Router();

const superCheck = (requestBody, requiredParams, option) => {
  var message = [];

  if (option.indexOf('uncollected') + 1) {
    var uncollectedData = requiredParams.filter(i => Object.keys(requestBody).indexOf(i) < 0);
    if (uncollectedData.length > 0) {
      message.push(`Не были получены обязательные параметры : ${uncollectedData.join(', ')}`);
    }
  }

  if (option.indexOf('unexpected') + 1) {
    var unexpectedData = Object.keys(requestBody).filter(i => requiredParams.indexOf(i) < 0);
    if (unexpectedData.length > 0) {
      message.push(`Были получены неожиданные параметры : ${unexpectedData.join(', ')}`);
    }
  }

  return (message.length === 0) ? 'success' : message.join('\n');
}

// create (POST) -> new honeyNote
router.post('/', (req, res, next) => {

  const requiredParams = [
    'typeId',
    'clientId',
    'utcTimeStamp',
    'ipAddress',
    'connectionPort'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error('Ошибка запроса "POST /api/honeyNotes" !');
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    var newHoneyNote = new HoneyNote({
      typeId: req.body.typeId,
      clientId: req.body.clientId,
      utcTimeStamp: req.body.utcTimeStamp,
      ipAddress: req.body.ipAddress,
      connectionPort: req.body.connectionPort
    });

    newHoneyNote.save((err, savedHoneyNote) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/honeyNotes" !');
        console.error('ОШИБКА ->', err);

        return res.status(400).json({
          success: false,
          message: 'Ошибка при добавлени нового ханипота !'
        });
      } else if (savedHoneyNote) {
          console.log('Запрос "POST /api/honeyNotes" успешно выполнен.');
          console.log(`Был добавлен новый ханипот (id = ${savedHoneyNote._id}).`);

          res.status(200).json({
            success: true,
            message: `Был добавлен новый ханипот (id = ${savedHoneyNote._id}).`,
            data: savedHoneyNote
          });
      } else {
          console.error('Ошибка запроса "POST /api/honeyNotes" !');
          console.error('Новый ханипот не был добавлен !');

          res.status(400).json({
            success: false,
            message: 'Новый ханипот не был добавлен !'
          });
      }

    });

  }

});

// read (GET) -> all honeyNotes
router.get('/', (req, res, next) => {

  var searchParams = {};

  HoneyNote.count(searchParams, (err, amountOfHoneyNotes) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/honeyNotes" !`);
      console.error('Ошибка при подсчёте обшего количества добавленных ханипотов !');
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: 'Ошибка при подсчёте обшего количества добавленных ханипотов !'
      });
    } else if (amountOfHoneyNotes) {

      HoneyNote.find(searchParams, (err, honeyNotes) => {

        if (err) {
          console.error(`Ошибка запроса "GET /api/honeyNotes" !`);
          console.error('Ошибка при получении cписка добавленных ханипотов !');
          console.error('ОШИБКА ->', err);

          res.status(400).json({
            success: false,
            message: 'Ошибка при получении списка добавленных ханипотов !'
          });
        } else if (honeyNotes) {
            console.log(`Запрос "GET /api/honeyNotes" успешно выполнен.`);
            console.log('Список добавленных ханипотов был получен.');

            res.status(200).json({
                success: true,
                message: 'Список добавленных ханипотов была получен.',
                total: amountOfHoneyNotes,
                data: honeyNotes
            });
          }

        });
    
    } else {
        console.error(`Ошибка запроса "GET /api/honeyNotes" !`);
        console.error('Добавленные ханипоты не были найдены !');

        res.status(200).json({
            success: true,
            message: 'Добавленные ханипоты не были найдены !',
            total: 0,
            data: []
        });
    }

    });

});
  
// read (GET) -> single honeyNote
router.get('/:id', (req, res, next) => {

  var honeyNoteId = req.params.id;

  HoneyNote.findOne({
    _id: honeyNoteId
  }, (err, honeyNote) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/honeyNotes/${honeyNoteId}" !`);
      console.error(`Ошибка при поиске ханипота (id = ${honeyNoteId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске ханипота (id = ${honeyNoteId}) !`
      });
    } else if (honeyNote) {
        console.log(`Запрос "GET /api/honeyNotes/${honeyNoteId}" успешно выполнен.`);
        console.log(`Ханипот (id = ${honeyNoteId}) был найден.`);

        res.status(200).json({
            success: true,
            message: `Ханипот (id = ${honeyNoteId}) был найден.`,
            data: honeyNote
        });
    } else {
        console.error(`Ошибка запроса "GET /api/honeyNotes/${honeyNoteId}" !`);
        console.error(`Ханипота (id = ${honeyNoteId}) не найден !`);

        res.status(200).json({
            success: false,
            message: `Ханипот (id = ${honeyNoteId}) не найден !`,
            data: {}
        });
    }

  })
});

// update (PUT) -> single HoneyNote
router.put('/:id', (req, res, next) => {

  var honeyNoteId = req.params.id;

  HoneyNote.findOne({
    _id: honeyNoteId
  }, (err, honeyNote) => {

    if (err) {
      console.error(`Ошибка запроса "PUT /api/honeyNotes/${honeyNoteId}" !`);
      console.error(`Ошибка при поиске добавленного ханипота (id = ${honeyNoteId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске добавленного ханипота (id = ${honeyNoteId}) !`
      });
    } else if (honeyNote && req.body) {

      const requiredParams = [
        'typeId',
        'clientId',
        'utcTimeStamp',
        'ipAddress',
        'connectionPort'
      ];

      var result = superCheck(req.body, requiredParams, 'unexpected');

      // Object.keys(req.body).toString() === requiredParams.toString()
      if (result !== 'success') {
        console.error(`Ошибка запроса "PUT /api/honeyNotes/${honeyNoteId}" !`);
        console.error(result);

        res.status(400).json({
          success: false,
          message: result
        });
      } else {

        honeyNote.set({
            typeId: req.body.typeId || honeyNote.typeId,
            clientId: req.body.clientId || honeyNote.clientId,
            utcTimeStamp: req.body.utcTimeStamp || honeyNote.utcTimeStamp,
            ipAddress: req.body.ipAddress || honeyNote.ipAddress,
            connectionPort: req.body.connectionPort || honeyNote.connectionPort
        });

        honeyNote.save((err, updatedHoneyNote) => {

          if (err) {
            console.error(`Ошибка запроса "PUT /api/honeyNotes/${honeyNoteId}" !`);
            console.error(`Ошибка при обновлении ханипота (id = ${honeyNoteId}) !!!`);
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: `Ошибка при обновлении ханипота (id = ${honeyNoteId}) !!!`
            });
          } else if (updatedHoneyNote) {
              console.log(`Запрос "PUT /api/honeyNotes/${honeyNoteId}" успешно выполнен.`);
              console.log(`Добавленный ханипот (id = ${honeyNoteId}) был обновлён.`);

              res.status(200).json({
                success: true,
                message: `Добавленный ханипот (id = ${honeyNoteId}) был обновлён.`,
                data: updatedHoneyNote
              });
          }

        })

      }

    } else {
      console.error(`Ошибка запроса "PUT /api/honeyNotes/${HoneyNoteId}" !`);
      console.error(`Добавленный ханипот (id = ${HoneyNoteId}) не был обновлён !!!`);

      res.status(200).json({
        success: false,
        message: `Добавленный ханипот (id = ${HoneyNoteId}) не был обновлён !!!`
      });
    }

  })
});

// delete (DELETE) -> single HoneyNote
router.delete('/:id', (req, res, next) => {

  var honeyNoteId = req.params.id;

  Orders.remove({
    _id: honeyNoteId
  }, (err) => {

    if (err) {
      console.error(`Ошибка запроса "DELETE /api/honeyNotes/${honeyNoteId}" !`);
      console.error(`Ошибка при удалении добавленного ханипота (id = ${honeyNoteId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при удалении добавленного ханипота (id = ${honeyNoteId}) !`
      });
    } else {
        console.log(`Запроc "DELETE /api/honeyNotes/${honeyNoteId}" успешно выполнен.`);
        console.log(`Добавленный ханипот (id = ${honeyNoteId}) был удалён !`);

        res.status(200).json({
          success: true,
          message: `Добавленный ханипот (id = ${honeyNoteId}) был удалён !`
        });
    }

  });

});

module.exports = router;