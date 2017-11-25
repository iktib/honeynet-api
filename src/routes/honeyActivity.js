const express = require('express');

const router = express.Router();

const http = require('http');

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


// read (GET) -> all honeyNotes
router.get('/getLogs', (req, res, next) => {

    var options = {
      host: 'example.com',
      port: 80,
      path: '/foo.html'
    };
    
    http.get(options, function(resp){
      resp.on('data', function(chunk){
        //do something with chunk
      });
    }).on("error", function(e){
      console.log("Got error: " + e.message);
    });


    console.log(`Запрос "GET /api/honeyActivity/getLogs" успешно выполнен.`);
    console.log(`Логи ханипота (id = ${honeyNoteId}) были получены.`);

    res.status(200).json({
      success: true,
      message: `Добавленный ханипот (id = ${honeyNoteId}) был обновлён.`,
      data: updatedHoneyNote
    });

});
  
router.post('/alert', (req, res, next) => {

    var data = req.body.alert;

    console.log(data);

    res.status(200).json({
        result: data
    });
    
});

module.exports = router;
