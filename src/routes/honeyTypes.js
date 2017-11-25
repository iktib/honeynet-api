const express = require('express');

const HoneyType = require('../models/honeyType');

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

// create (POST) -> new honeyType
router.post('/', (req, res, next) => {

  const requiredParams = [
    'name',
    'description'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error('Ошибка запроса "POST /api/honeyTypes" !');
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    var newHoneyType = new HoneyType({
      name: req.body.name,
      description: req.body.description,
    });

    newHoneyType.save((err, savedHoneyType) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/honeyTypes" !');
        console.error('ОШИБКА ->', err);

        return res.status(400).json({
          success: false,
          message: 'Ошибка при созданиии нового типа ханипота !'
        });
      } else if (savedHoneyType) {
          console.log('Запрос "POST /api/honeyTypes" успешно выполнен.');
          console.log(`Был создан новый тип ханипота (id = ${savedHoneyType._id}).`);

          res.status(200).json({
            success: true,
            message: `Был создан новый тип ханипота (id = ${savedHoneyType._id}).`,
            data: savedHoneyType
          });
      } else {
          console.error('Ошибка запроса "POST /api/honeyPots" !');
          console.error('Новый тип ханипота не был создан !');

          res.status(400).json({
            success: false,
            message: 'Новый тип ханипота не был создан !'
          });
      }

    });

  }

});

// read (GET) -> all honeyTypes
router.get('/', (req, res, next) => {

  var searchParams = {};

  HoneyType.count(searchParams, (err, amountOfHoneyTypes) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/honeyTypes" !`);
      console.error('Ошибка при подсчёте обшего количества типов ханипотов !');
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: 'Ошибка при подсчёте обшего количества типов ханипотов !'
      });
    } else if (amountOfHoneyTypes) {

      HoneyType.find(searchParams, (err, honeyTypes) => {

        if (err) {
          console.error(`Ошибка запроса "GET /api/honeyTypes" !`);
          console.error('Ошибка при получении cписка типов ханипотов !');
          console.error('ОШИБКА ->', err);

          res.status(400).json({
            success: false,
            message: 'Ошибка при получении списка типов ханипотов !'
          });
        } else if (honeyTypes) {
              console.log(`Запрос "GET /api/honeyTypes" успешно выполнен.`);
              console.log('Список типов ханипотов был получен.');

              res.status(200).json({
                success: true,
                message: 'Список типов ханипотов была получен.',
                total: amountOfHoneyTypes,
                data: honeyTypes
              });
          }

        });
      } else {
        console.error(`Ошибка запроса "GET /api/honeyTypes" !`);
        console.error('Типы ханипотов не были найдены !');

        res.status(200).json({
          success: true,
          message: 'Типы ханипотов не были найдены !',
          total: 0,
          data: []
        });
      }

    });

});
  
// read (GET) -> single honeyType
router.get('/:id', (req, res, next) => {

  var honeyTypeId = req.params.id;

  HoneyType.findOne({
    _id: honeyTypeId
  }, (err, honeyType) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/honeyTypes/${honeyTypeId}" !`);
      console.error(`Ошибка при поиске типа ханипота (id = ${honeyTypeId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске типа ханипота (id = ${honeyTypeId}) !`
      });
    } else if (honeyType) {
      console.log(`Запрос "GET /api/honeyTypes/${honeyTypeId}" успешно выполнен.`);
      console.log(`Тип ханипота (id = ${honeyTypeId}) был найден.`);

      res.status(200).json({
        success: true,
        message: `Тип ханипота (id = ${honeyTypeId}) был найден.`,
        data: honeyType
      });
    } else {
      console.error(`Ошибка запроса "GET /api/honeyTypes/${honeyTypeId}" !`);
      console.error(`Тип ханипота (id = ${honeyTypeId}) не найден !`);

      res.status(200).json({
        success: false,
        message: `Тип ханипота (id = ${honeyTypeId}) не найден !`,
        data: {}
      });
    }

  })
});

// update (PUT) -> single honeyType
router.put('/:id', (req, res, next) => {

  var honeyTypeId = req.params.id;

  HoneyType.findOne({
    _id: honeyTypeId
  }, (err, honeyType) => {

    if (err) {
      console.error(`Ошибка запроса "PUT /api/honeyTypes/${honeyTypeId}" !`);
      console.error(`Ошибка при поиске типа ханипота (id = ${honeyTypeId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске типа ханипота (id = ${honeyTypeId}) !`
      });
    } else if (honeyType && req.body) {

      const requiredParams = [
        '_id',
        'name',
        'description'
      ];

      var result = superCheck(req.body, requiredParams, 'unexpected');

      // Object.keys(req.body).toString() === requiredParams.toString()
      if (result !== 'success') {
        console.error(`Ошибка запроса "PUT /api/honeyTypes/${honeyTypeId}" !`);
        console.error(result);

        res.status(400).json({
          success: false,
          message: result
        });
      } else {

        honeyType.set({
          name: req.body.name || honeyType.name,
          description: req.body.description || honeyType.description,
        });

        honeyType.save((err, updatedHoneyType) => {

          if (err) {
            console.error(`Ошибка запроса "PUT /api/honeyTypes/${honeyTypeId}" !`);
            console.error(`Ошибка при обновлении типа ханипота (id = ${honeyTypeId}) !!!`);
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: `Ошибка при обновлении типа ханипота (id = ${honeyTypeId}) !!!`
            });
          } else if (updatedHoneyType) {
              console.log(`Запрос "PUT /api/honeyTypes/${honeyTypeId}" успешно выполнен.`);
              console.log(`Тип ханипота (id = ${honeyTypeId}) был обновлён.`);

              res.status(200).json({
                success: true,
                message: `Тип ханипота (id = ${honeyTypeId}) был обновлён.`,
                data: updatedHoneyType
              });
          }

        })

      }

    } else {
      console.error(`Ошибка запроса "PUT /api/honeyTypes/${honeyTypeId}" !`);
      console.error(`Тип ханипота (id = ${honeyTypeId}) не был обновлён !!!`);

      res.status(200).json({
        success: false,
        message: `Тип ханипота (id = ${honeyTypeId}) не был обновлён !!!`
      });
    }

  })
});

// delete (DELETE) -> single honeyType
router.delete('/:id', (req, res, next) => {

  var honeyTypeId = req.params.id;

  Orders.remove({
    _id: honeyTypeId
  }, (err) => {

    if (err) {
      console.error(`Ошибка запроса "DELETE /api/honeyTypes/${honeyTypeId}" !`);
      console.error(`Ошибка при удалении типа ханипота (id = ${honeyTypeId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при удалении типа ханипота (id = ${honeyTypeId}) !`
      });
    } else {
        console.log(`Запроc "DELETE /api/honeyTypes/${honeyTypeId}" успешно выполнен.`);
        console.log(`Тип ханипота (id = ${honeyTypeId}) был удалён !`);

        res.status(200).json({
          success: true,
          message: `Тип ханипота (id = ${honeyTypeId}) был удалён !`
        });
    }

  });

});

module.exports = router;