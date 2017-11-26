const express = require('express');
const passport = require('passport');
const config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');

const Users = require("../models/user");

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

const getToken = (headers) => {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// create (POST) -> new user (self-registration for manager)
router.post('/signup', (req, res, next) => {

  const requiredParams = [
    'email',
    'password',
    'role'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error('Ошибка запроса "POST /api/users/signup" !');
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    var newUser = new Users({
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });

    newUser.save((err, createdUser) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/users/signup" !');
        console.error('Такой пользователь уже существует !');
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: 'Такой пользователь уже существует!'
        });
      } else if (createdUser) {
        var token = jwt.sign({
            email: newUser.email,
            role: newUser.role,
            id: newUser.id,
            isActivated: newUser.isActivated
          },
          config.secret, {
            expiresIn: 1440
          }
        );

        console.log('Запрос "POST /api/users/signup" успешно выполнен.');
        console.log('Успешно создан новый пользователь.');

        res.status(200).json({
          success: true,
          message: 'Успешно создан новый пользователь.',
          data: createdUser,
          token: token
        });
      } else {
        console.error('Ошибка запроса "POST /api/users/signup" !');
        console.error('Новый пользователь не был создан !');

        res.status(400).json({
          success: false,
          message: 'Новый пользователь не был создан !'
        });
      }

    });

  }

});

// create (POST) -> new user (registration by manager)
/*
router.post('/createUser', (req, res, next) => {

  var allParams = [
    'managerId',

    'phone',
    'password',
    'role',

    'fullName',
    'photoUrl',
    'description',

    'companyTitle',
    'companyAddress',
    'workTimeFrom',
    'workTimeTo',
    'companyLogoUrl',
    'isActivated'
  ];

  var resultRequired = superCheck(req.body, allParams.slice(0, 4), 'uncollected');

  var resultOptional = superCheck(req.body, allParams, 'unexpected');

  if (resultRequired !== 'success') {
    console.error('Ошибка запроса "POST /api/users/createUser" !');
    console.error(resultRequired);

    res.status(400).json({
      success: false,
      message: resultRequired
    });
  } else if (resultOptional !== 'success') {
    console.error('Ошибка запроса "POST /api/users/createUser" !');
    console.error(resultOptional);

    res.status(400).json({
      success: false,
      message: resultOptional
    });
  } else {

    var newUser = new Users({
      managerId: req.body.managerId,
      phone: req.body.phone,
      password: req.body.password,
      role: req.body.role,

      fullName: req.body.fullName,
      photoUrl: req.body.photoUrl,
      description: req.body.description,

      companyTitle: req.body.companyTitle,
      companyAddress: req.body.companyAddress,
      workTimeFrom: req.body.workTimeFrom,
      workTimeTo: req.body.workTimeTo,
      companyLogoUrl: req.body.companyLogoUrl,

      isActivated: req.body.isActivated || true
      
    });

    newUser.save((err, createdUser) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/users/createUser" !');
        console.error('Ошибка при создании нового пользователя !');
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: `Ошибка при создании нового пользователя !\n${err}`
        });
      } else if (createdUser) {

        var token = jwt.sign({
            phone: newUser.phone,
            role: newUser.role,
            id: newUser.id,
            isActivated: newUser.isActivated
          },
          config.secret, {
            expiresIn: 1440
          }
        );

        console.log('Запрос "POST /api/users/createUser" успешно выполнен.');
        console.log('Успешно создан новый пользователь.');

        res.status(200).json({
          success: true,
          message: 'Успешно создан новый пользователь.',
          data: createdUser,
          token: token
        });
      } else {
        console.error('Ошибка запроса "POST /api/users/createUser" !');
        console.error('Новый пользователь не был создан !');

        res.status(400).json({
          success: false,
          message: 'Новый пользователь не был создан !'
        });
      }

    });

  }

});
*/

// authorize (POST) -> single user
router.post('/signin', (req, res, next) => {
  
  var requiredParams = [
    'email',
    'password'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error('Ошибка запроса "POST /api/users/signin" !');
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    Users.findOne({
      email: req.body.email
    }).select('+password').exec((err, user) => {

      if (err) {
        console.error('Ошибка запроса "POST /api/users/signin" !');
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: 'Пользователь не найден'
        });
      } else if (user) {

        user.comparePassword(req.body.password, (err, isMatch) => {

          if (isMatch && !err) {

            // if user is found and password is right create a token
            var token = jwt.sign({
                email: user.email,
                role: user.role,
                id: user.id,
                isActivated: user.isActivated
              },
              config.secret, {
                expiresIn: 1440
              }
            );

            // return the information including token as JSON
            console.error('Запрос "POST /api/users/signin" успешно выполнен.');
            console.log('Аутентификация прошла успешно. Токен был получен.');

            res.status(200).json({
              success: true,
              message: 'Аутентификация прошла успешно. Токен был получен.',
              data: user,
              token: token
            });

          } else {
            console.error('Ошибка запроса "POST /api/users/signin" !');

            res.status(400).send({
              success: false,
              message: 'Неправильный логин или пароль'
            });
          }

        });

      } else {
        console.error('Ошибка запроса "POST /api/users/signin" !');
        console.error('Аутентификация не пройдена !');

        res.status(400).json({
          success: false,
          message: 'Аутентификация не пройдена !'
        });
      }
    });
  }

});

///////////////////////////////////////////////////////////////////////////////////

// change password (POST)
router.post('/:id/changePassword', (req, res, next) => {

  var userId = req.params.id;
  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;

  var requiredParams = [
    'currentPassword',
    'newPassword'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    Users.findById(userId).select('+password').exec((err, user) => {

      if (err) {
        console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);
        console.error(`Пользователь (id = ${userId}) не найден !`);
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: `Пользователь (id = ${userId}) не найден !`
        });
      } else if (user) {

        user.comparePassword(currentPassword, (err, isMatch) => {

          if (isMatch && !err) {

            user.set({
              password: newPassword
            });

            user.save((err, updatedUser) => {

              if (err) {
                console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);
                console.error(`Ошибка при изменении пароля пользователя (id = ${userId}) !`);
                console.error('ОШИБКА ->', err);

                res.status(400).json({
                  success: false,
                  message: `Ошибка при изменении пароля пользователя (id = ${userId}) !`
                });
              } else if (updatedUser) {
                console.error(`Запрос "POST /api/users/${userId}/changePassword" успешно выполнен.`);
                console.error(`Пароль пользователя (id = ${userId}) был изменён.`);

                res.status(200).json({
                  success: true,
                  message: `Пароль пользователя (id = ${userId}) был изменён.`
                });
              } else {
                console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);
                console.error(`Пароль пользователя (id = ${userId}) не был изменён !`);

                res.status(400).json({
                  success: false,
                  message: `Пароль пользователя (id = ${userId}) не был изменён !`
                });
              }

            });

          } else {
            console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);

            res.status(400).json({
              success: false,
              message: 'Неверный текущий пароль'
            });
          }

        });

      } else {
        console.error(`Ошибка запроса "POST /api/users/${userId}/changePassword" !`);
        console.error(`Изменение пароля для пользователя (id = ${userId}) не выполнено !`);

        res.status(400).json({
          success: false,
          message: 'Пароль не изменён'
        });
      }
    });
  }

});

// reset password (POST)
router.post('/:id/resetPassword', (req, res, next) => {

  var userId = req.params.id;
  var newPassword = req.body.newPassword;

  var requiredParams = [
    'newPassword'
  ];

  var result = superCheck(req.body, requiredParams, 'uncollected & unexpected');

  if (result !== 'success') {
    console.error(`Ошибка запроса "POST /api/users/${userId}/resetPassword" !`);
    console.error(result);

    res.status(400).json({
      success: false,
      message: result
    });
  } else {

    Users.findById(userId).select('+password').exec((err, user) => {

      if (err) {
        console.error(`Ошибка запроса "POST /api/users/${userId}/resetPassword" !`);
        console.error(`Пользователь (id = ${userId}) не найден !`);
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: `Пользователь (id = ${userId}) не найден !`
        });
      } else if (user) {

        user.set({
          password: newPassword
        });

        user.save((err, updatedUser) => {

          if (err) {
            console.error(`Ошибка запроса "POST /api/users/${userId}/resetPassword" !`);
            console.error(`Ошибка при сбросе пароля пользователя (id = ${userId}) !`);
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: `Ошибка при сбросе пароля пользователя (id = ${userId}) !`
            });
          } else if (updatedUser) {
            console.error(`Запрос "POST /api/users/${userId}/resetPassword" успешно выполнен.`);
            console.error(`Пароль пользователя (id = ${userId}) был сброшен.`);

            res.status(200).json({
              success: true,
              message: `Пароль пользователя (id = ${userId}) был сброшен.`
            });
          } else {
            console.error(`Ошибка запроса "POST /api/users/${userId}/resetPassword" !`);
            console.error(`Пароль пользователя (id = ${userId}) не был сброшен !`);

            res.status(400).json({
              success: false,
              message: `Пароль пользователя (id = ${userId}) не был сброшен !`
            });
          }

        });

      } else {
        console.error(`Ошибка запроса "POST /api/users/${userId}/resetPassword" !`);
        console.error(`Сброс пароля для пользователя (id = ${userId}) не выполнен !`);

        res.status(400).json({
          success: false,
          message: `Сброс пароля для пользователя (id = ${userId}) не выполнен !`
        });
      }

    });

  }

});

///////////////////////////////////////////////////////////////////////////////////

// read (GET) -> orders of specific user
router.get('/:id/honeyList', (req, res, next) => {

  var userId = req.params.id;

  Users.findOne({
    _id: userId
  }, (err, user) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/users/${userId}/honeyList" !`);
      console.error(`Ошибка при получении списка ханипотов пользователя (id = ${userId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: `Ошибка при получении пользователя (id = ${userId}) !`
      });
    } else if (user) {

        console.error(`Запрос "GET /api/users/${userId}/honeyList" выполнен успешно !`);
        console.error(`Cписок ханиптов пользователя (id = ${userId}) был получен.`);

        res.status(200).json({
          success: true,
          message: `Cписок ханиптов пользователя (id = ${userId}) был получен.`,
          data: user.honeyList
        });
      }

  });
});

// read (GET) -> single user
router.get('/:id', (req, res, next) => {
  
  var userId = req.params.id;

  Users.findById(userId, (err, user) => {

    if (err) {
      console.error(`Ошибка запроса "GET /api/users/${userId}" !`);
      console.error(`Ошибка при поиске пользователя (id = ${userId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске пользователя (id = ${userId}) !`
      });
    } else if (user) {
      console.log(`Запрос "GET /api/users/${userId}" успешно выполнен.`);
      console.log(`Пользователь (id = ${userId}) был найден.`);

      res.status(200).json({
        success: true,
        message: `Пользователь (id = ${userId}) был найден.`,
        data: user
      });
    } else {
      console.error(`Ошибка запроса "GET /api/users/${userId}" !`);
      console.error(`Пользователь (id = ${userId}) не найден !`);

      res.status(200).json({
        success: false,
        message: `Пользователь (id = ${userId}) не найден !`,
        data: {}
      });
    }

  });

});

// read (GET) -> all members of level
router.get('/', (req, res, next) => {

  var userRole = req.query.role;
  var isActivated = req.query.isActivated;

  var searchParams = {
    role: userRole
  };

  if (isActivated==='true') {
    searchParams.isActivated = true;
  }
  else if (isActivated==='false') {
    searchParams.isActivated = false;
  }
  else if (isActivated==='null') {
    searchParams.isActivated = null;
  }

  if (['client', 'admin'].indexOf(userRole) < 0) {
    console.error(`Ошибка запроса "GET /api/users?role=${userRole}" !`);
    console.error('Данные, переданные в параметрах запроса, некорректны !');

    res.status(400).json({
      success: false,
      message: 'Данные, переданные в параметрах запроса, некорректны !',
    });
  } else {

    Users.count(
      searchParams,
      (err, amountOfUsers) => {

      if (err) {
        console.error(`Ошибка запроса "GET /api/users?role=${userRole}" !`);
        console.error(`Ошибка при подсчёте количества пользователей с ролью ${userRole} !`);
        console.error('ОШИБКА ->', err);

        res.status(400).json({
          success: false,
          message: `Ошибка при подсчёте количества пользователей с ролью ${userRole} !`
        });
      } else if (amountOfUsers) {

        Users.find(
          searchParams,
          (err, users) => {

          if (err) {
            console.error(`Ошибка запроса "GET /api/users?role=${userRole}" !`);
            console.error(`Ошибка при получении пользователей с ролью "${userRole}" !`);
            console.error('ОШИБКА ->', err);

            res.status(400).json({
              success: false,
              message: `Ошибка при получении пользователей с ролью "${userRole}" !`
            });
          } else if (users) {
              console.log(`Запрос "GET /api/users?role=${userRole}" успешно выполнен.`);
              console.log(`Список пользователей с ролью "${userRole}" был получен.`);

              res.status(200).json({
                success: true,
                message: `Список пользователей с ролью "${userRole}" был получен.`,
                total: amountOfUsers,
                data: users
              });
          }

        })

      } else {
          console.error(`Ошибка запроса "GET /api/users?role=${userRole}" !`);
          console.error(`Пользователи с ролью "${userRole}" не получены !`);

          res.status(200).json({
            success: false,
            message: `Пользователи с ролью "${userRole}" не получены !`,
            total: 0,
            data: []
          });
      }
    });

  }

});

///////////////////////////////////////////////////////////////////////////////////

// update (PUT) -> single user
router.put('/:id', (req, res, next) => {

  var userId = req.params.id;

  Users.findById(userId, (err, user) => {

    if (err) {
      console.error(`Ошибка запроса "PUT /api/users/${userId}" !`);
      console.error(`Ошибка при поиске пользователя (id = ${userId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при поиске пользователя (id = ${userId}) !`
      });
    } else if (user && req.body) {

      user.set({
        fullName: req.body.fullName || user.fullName,
        photoUrl: req.body.photoUrl || user.photoUrl,
        aboutSelf: req.body.aboutSelf || user.aboutSelf,
        companyTitle: req.body.companyTitle || user.companyTitle,
        companyLogoUrl: req.body.companyLogoUrl || user.companyLogoUrl,
        isActivated: req.body.isActivated || user.isActivated
      });

      user.save((err, updatedUser) => {

        if (err) {
          console.error(`Ошибка запроса "PUT /api/users/${userId}" !`);
          console.error(`Ошибка при обновлении пользователя (id = ${userId}) !`);
          console.error('ОШИБКА ->', err);

          res.status(400).json({
            success: false,
            message: `Ошибка при обновлении пользователя (id = ${userId}) !`
          });

        } else if (updatedUser) {
            console.log(`Запрос "PUT /api/users/${userId}" успешно выполнен.`);
            console.log(`Пользователь (id = ${userId}) был обновлён.`);

            res.status(200).json({
              success: true,
              message: `Пользователь (id = ${userId}) был обновлён.`,
              data: updatedUser
          });
        }

      });

    } else {
      console.error(`Ошибка запроса "PUT /api/users/${userId}" !`);
      console.error(`Пользователь (id = ${userId}) не был обновлен !`);

      res.status(200).json({
        success: false,
        message: `Пользователь (id = ${userId}) не был обновлен !`
      });
    }

  });

});

// delete (DELETE) -> single user
router.delete('/:id', (req, res, next) => {

  var userId = req.params.id;

  Users.remove({
    _id: userId
  }, (err) => {

    if (err) {
      console.error(`Ошибка запроса "DELETE /api/users/${userId}" !`);
      console.error(`Ошибка при удалении пользователя (id = ${userId}) !`);
      console.error('ОШИБКА ->', err);

      res.status(400).json({
        success: false,
        message: `Ошибка при удалении пользователя (id = ${userId}) !`
      });
    } else {
      console.log(`Запроc "DELETE /api/users/${userId}" успешно выполнен.`);
      console.log(`Пользователь (id = ${userId}) был удалён !`);

      res.status(200).json({
        success: true,
        message: `Пользователь (id = ${userId}) был удалён !`
      });
    }

  });

});

module.exports = router;