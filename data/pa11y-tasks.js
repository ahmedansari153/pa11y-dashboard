const fs = require('fs');
var createClient = require('pa11y-webservice-client-node');
const { forEach } = require('underscore');
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
  Object.keys(data).forEach(element => {
    client.tasks.create({
      name: element,
      url: element,
      standard: "WCAG2AA"
    }, function (error, task) {
      if (error) {
        console.error('Error:', error);
      }
      if (task) {
        console.log('Imported:', task.name);
      }
    });
  });
});