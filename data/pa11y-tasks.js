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
  client.tasks.get({}, function (err, tasks){
    for(var t of tasks) {
      client.task(t.id).remove(function(err) {
        if(err)
          console.log(err);
      });
    }
  });
  Object.keys(data).forEach(element => {
    client.tasks.create({
      name: element,
      url: element,
      standard: "WCAG2AA",
      hideElements: ".navigation.b2c, .breadcrumb, .support-title, .article-feedback, .article-nav, .return-to-result, .rel-help-library-wrap, .support-link-banner-wrap, .contact-us-link-menu, .footer-box, iframe"
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