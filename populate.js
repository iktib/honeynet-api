const request = require('request');

const handler = function (err, response, body) {
  if (response && response.statusCode === 200) {
    console.log('response', response.body)
  } else if(response) {
    console.log('code', response.statusCode)
    console.log('body', response.body)
  } else {
    console.log('API donw')
    
  }
  if (err) {
    console.error('err', err);
  }
}

const apiUrl = 'http://sweet-pay-api.herokuapp.com/api/users/createUser'
request.post({
  url: 'http://sweet-pay-api.herokuapp.com/api/users/createUser',
  form: {
    fullName: 'Максим',
    phone: '+79185665953',
    password: '123456',
    role: 'manager',
    isActivated: true,
    managerId: 0
  },
}, handler)


request.post({
  url: 'http://sweet-pay-api.herokuapp.com/api/users/createUser',
  form: {
    fullName: 'Лена',
    phone: '+77079988081',
    password: '123456',
    role: 'manager',
    isActivated: true,
    managerId: 0
  },
}, handler)


request.post({
  url: 'http://sweet-pay-api.herokuapp.com/api/users/createUser',
  form: {
    fullName: 'Таир',
    phone: '+77017586082',
    password: '123456',
    role: 'manager',
    isActivated: true,
    managerId: 0
  },
}, handler)


request.post({
  url: 'http://sweet-pay-api.herokuapp.com/api/users/createUser',
  form: {
    fullName: 'Женя',
    phone: '+77771550011',
    password: '123456',
    role: 'manager',
    isActivated: true,
    managerId: 0
  },
}, handler)