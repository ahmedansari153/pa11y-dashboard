const fs = require('fs');
var createClient = require('pa11y-webservice-client-node');
var config = require('../config');
var client = createClient('http://' + config.webservice.host + ':' + config.webservice.port + '/');

const getJsonFile = function getJsonFile(filePath, encoding = 'utf8') {
  return new Promise(function getJsonFileImpl(resolve, reject) {
     fs.readFile(filePath, encoding, function readFileCallback(err, contents) {
         if(err) {
            return reject(err);
         }
         resolve(contents);
     });
  })
    .then(JSON.parse);
};
getJsonFile('pa11y-tasks.json').then(function (data) { 
  data.forEach(element => {
    client.tasks.create({
      name:  element.url,
      url: element.url,
      standard: element.standard
    }, function (err, task) {
        if(err)
          console.log(err);
        else console.log(task);
  });
  });
});