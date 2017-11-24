const express = require('express');

const Orders = require('../models/order');

const mongoose = require('mongoose');

// const mongoose = require('mongoose');
// var DateModule = require('date-and-time');
// var parseDate = DateModule.parse(req.params.date, 'YYYY-MM-DD', true);


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

// create (POST) -> new order
router.post('/', (req, res, next) => {

  const requiredParams = [
    'clientId',
    'companyTitle',
    'price',

    'creationDate',
    'creationTime',

    'deliveryDate',
    'deliveryTimeFrom',
    'deliveryTimeTo'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error('Ошибка запроса "POST /api/orders" !');
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    var newOrder = new Orders({
      clientId: req.body.clientId,
      companyTitle: req.body.companyTitle,
      price: req.body.price,
      //###################################################
      creationDate: req.body.creationDate,
      deliveryDate: req.body.deliveryDate,
      deliveryTimeFrom: req.body.deliveryTimeFrom,
      deliveryTimeTo: req.body.deliveryTimeTo,
      //###################################################
      currentState: 'new',
      orderStates: {
        new: {
          time: req.body.creationTime,
          status: 'success'
        }
      }
    });

    newOrder.save((err, savedOrder) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/orders" !');
        console.error('`а !');
        console.error('ОШИБКА ->', err);

        return res.status(400).json({
          success: false,
          message: 'Ошибка при сохранении заказа !'
        });
      } else if (savedOrder) {
        console.log('Запрос "POST /api/orders" успешно выполнен.');
        console.log(`Был создан новый заказ (id = ${savedOrder._id}).`);

        res.status(200).json({
          success: true,
          message: `Был создан новый заказ (id = ${savedOrder._id}).`,
          data: savedOrder
        });
      } else {
        console.error('Ошибка запроса "POST /api/orders" !');
        console.error('Новый заказ не был создан !');

        res.status(400).json({
          success: false,
          message: 'Новый заказ не был создан !'
        });
      }

    });

  }

});

router.get('/', (req, res, next) => {

  // filter=:desiredDate&skip=:skipNumber&size=:sizeValue

  var date = req.query.filter;
  var skipped = parseInt(req.query.skip);
  var size = parseInt(req.query.size);
  var searchParams = {};

  if ((date !== 'none' && new Date(date) == 'Invalid Date') || skipped < 0 || size < 0) {
    console.error(`Ошибка запроса "GET /api/orders/filter=${date}&skip=${skipped}&size=${size}" !`);
    console.error('Данные, переданные в параметрах запроса, некорректны !');

    res.status(400).json({
      success: false,
      message: 'Данные, переданные в параметрах запроса, некорректны !',
    });
  } else {

    if (date !== 'none') {
      searchParams.deliveryDate = date
    };


    Orders.count(searchParams, (err, amountOfOrders) => {

      if (err) {
        console.error(`Ошибка запроса "GET /api/orders/filter=${date}&skip=${skipped}&size=${size}" !`);
        console.error('Ошибка при подсчёте обшего количества подходящих заказов !');
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: 'Ошибка при подсчёте обшего количества подходящих заказов !'
        });
      } else if (amountOfOrders) {

        Orders.find(searchParams).skip(skipped).limit(size).exec((err, orders) => {

          if (err) {
            console.error(`Ошибка запроса "GET /api/orders/filter=${date}&skip=${skipped}&size=${size}" !`);
            console.error('Ошибка при получении указанной части подходящих заказов !');
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: 'Ошибка при получении указанной части подходящих заказов !'
            });
          } else if (orders) {
            console.log(`Запрос "GET /api/orders/filter=${date}&skip=${skipped}&size=${size}" успешно выполнен.`);
            console.log('Указанная часть подходящих заказов была получена.');

            res.status(200).json({
              success: true,
              message: 'Указанная часть подходящих заказов была получена.',
              total: amountOfOrders,
              data: orders
            });
          }

        });
      } else {
        console.error(`Ошибка запроса "GET /api/orders/filter=${date}&skip=${skipped}&size=${size}" !`);
        console.error('Подходящие заказы не были найдены !');

        res.status(200).json({
          success: true,
          message: 'Подходящие заказы не были найдены !',
          total: 0,
          data: []
        });
      }

    });

  }

});

// the latest orders (by deliveryDate)
router.get('/latest', (req, res, next) => {
  
  var size = parseInt(req.query.size);

  if (size < 0) {
    console.error(`Ошибка запроса "GET /api/orders/latest/size=:${size}'" !`);
    console.error('Данные, переданные в параметрах запроса, некорректны !');

    res.status(400).json({
      success: false,
      message: 'Данные, переданные в параметрах запроса, некорректны !',
    });
  } else {

    Orders.count({}, (err, amountOfOrders) => {

      if (err) {
        console.error(`Ошибка запроса "GET /api/orders/latest/size=:${size}'" !`);
        console.error('Ошибка при подсчёте обшего количества подходящих заказов !');
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: 'Ошибка при подсчёте обшего количества подходящих заказов !'
        });
      } else if (amountOfOrders) {

        Orders.find({}).sort({deliveryDate: -1}).limit(size).exec((err, orders) => {

          if (err) {
            console.error(`Ошибка запроса "GET /api/orders/latest/size=:${size}'" !`);
            console.error('Ошибка при получении указанной части подходящих заказов !');
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: 'Ошибка при получении указанной части подходящих заказов !'
            });
          } else if (orders) {
            console.log(`Запрос "GET /api/orders/latest/size=:${size}'" успешно выполнен.`);
            console.log('Указанная часть подходящих заказов была получена.');

            res.status(200).json({
              success: true,
              message: 'Указанная часть подходящих заказов была получена.',
              total: amountOfOrders,
              data: orders
            });
          }

        });
      } else {
        console.error(`Ошибка запроса "GET /api/orders/latest/size=:${size}'" !`);
        console.error('Подходящие заказы не были найдены !');

        res.status(200).json({
          success: true,
          message: 'Подходящие заказы не были найдены !',
          total: 0,
          data: []
        });
      }

    });

  }

});
  
// read (GET) -> single order
router.get('/:id', (req, res, next) => {

  var orderId = req.params.id;

  Orders.findOne({
    _id: orderId
  }, (err, order) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/orders/${orderId}" !`);
      console.error(`Ошибка при поиске заказа (id = ${orderId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске заказа (id = ${orderId}) !`
      });
    } else if (order) {
      console.log('Запрос "GET /api/orders/:id" успешно выполнен.');
      console.log(`Заказ (id = ${orderId}) был найден.`);

      res.status(200).json({
        success: true,
        message: `Заказ (id = ${orderId}) был найден.`,
        data: order
      });
    } else {
      console.error('Ошибка запроса "GET /api/orders/:id" !');
      console.error(`Заказ (id = ${orderId}) не найден !`);

      res.status(200).json({
        success: false,
        message: `Заказ (id = ${orderId}) не найден !`,
        data: {}
      });
    }

  })
});

// update (PUT) -> single order
router.put('/:id', (req, res, next) => {

  var orderId = req.params.id;

  // requiredParams.filter(i => Object.keys(req.body).indexOf(i) < 0).length !== 0
  Orders.findOne({
    _id: orderId
  }, (err, order) => {

    if (err) {
      console.error(`Ошибка запроса "PUT /api/orders/${orderId}" !`);
      console.error(`Ошибка при поиске заказа (id = ${orderId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске заказа (id = ${orderId}) !`
      });
    } else if (order && req.body) {

      const requiredParams = [
        '_id',
        'clientId',
        'companyTitle',
        'creationDate',
        'orderStates',

        'price',

        'deliveryDate',
        'deliveryTimeFrom',
        'deliveryTimeTo',

        'currentState',
        'completionTime',
        'completionStatus'
      ];

      var result = superCheck(req.body, requiredParams, 'unexpected');

      // Object.keys(req.body).toString() === requiredParams.toString()
      if (result !== 'success') {
        console.error(`Ошибка запроса "PUT /api/orders/${orderId}" !`);
        console.error(result);

        res.status(400).json({
          success: false,
          message: result
        });
      } else {

        order.set({

          price: req.body.price || order.price,

          deliveryDate: req.body.deliveryDate || order.deliveryDate,
          deliveryTimeFrom: req.body.deliveryTimeFrom || order.deliveryTimeFrom,
          deliveryTimeTo: req.body.deliveryTimeTo || order.deliveryTimeTo,

          currentState: req.body.currentState || order.currentState,
          orderStates: {
            [req.body.currentState]: {
              time: req.body.completionTime,
              status: req.body.completionStatus
            }
          } || order.orderStates

        });

        order.save((err, updatedOrder) => {

          if (err) {
            console.error(`Ошибка запроса "PUT /api/orders/${orderId}" !!!`);
            console.error(`Ошибка при обновлении заказа (id = ${req.params.id}) !!!`);
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: `Ошибка при обновлении заказа (id = ${req.params.id}) !!!`
            });
          } else if (updatedOrder) {
            console.log(`Запрос "PUT /api/orders/${orderId}" успешно выполнен.`);
            console.log(`Заказ (id = ${req.params.id}) был обновлён.`);

            res.status(200).json({
              success: true,
              message: `Заказ (id = ${req.params.id}) был обновлён.`,
              data: updatedOrder
            });
          } else {
            console.error(`Ошибка запроса "PUT /api/orders/${orderId}" !!!`);
            console.error(`Заказ (id = ${req.params.id}) не был обновлён !!!`);

            res.status(200).json({
              success: false,
              message: `Заказ (id = ${req.params.id}) не был обновлён !!!`
            });
          }

        })

      }

    } else {
      console.error(`Ошибка запроса "PUT /api/orders/${orderId}" !`);
      console.error(`Заказ (id = ${req.params.id}) не найден !`);

      res.status(200).json({
        success: false,
        message: `Заказ (id = ${req.params.id}) не найден !`
      });
    }

  })
});

// delete (DELETE) -> single order
router.delete('/:id', (req, res, next) => {

  var orderId = req.params.id;

  Orders.remove({
    _id: orderId
  }, (err) => {

    if (err) {
      console.error(`Ошибка запроса "DELETE /api/orders/${orderId}" !`);
      console.error(`Ошибка при удалении заказа (id = ${orderId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при удалении заказа (id = ${orderId}) !`
      });
    } else {
      console.log(`Запроc "DELETE /api/orders/${orderId}" успешно выполнен.`);
      console.log(`Заказ (id = ${orderId}) был удалён !`);

      res.status(200).json({
        success: true,
        message: `Заказ (id = ${orderId}) был удалён !`
      });
    }

  });

});

module.exports = router;