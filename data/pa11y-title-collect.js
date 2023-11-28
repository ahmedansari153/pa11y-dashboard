const createClient = require('pa11y-webservice-client-node');
const { forEach } = require('underscore');
const config = require('../config');
const client = createClient('http://' + config.webservice.host + ':' + config.webservice.port + '/');
const puppeteer = require('puppeteer');

client.tasks.get({}, function (err, tasks){
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
        } catch (error) {
            console.log(error);
        }
        for(var t of tasks) {
            let url = t.name;
            let id = t.id;
            await page.goto(url, {waitUntil: 'load', timeout: 0});
            try {
                let title = await page.evaluate(() => {
                    return document.querySelector("h1.article-title").getInnerHTML();
               });  
            } catch (error) {
                console.log("Unable to get title for: ", url);
                console.log(error);
            }
            if (title.length > 0) {
                client.task(id).edit({
                    name: title
                }, function (err, task) {
                    // task  =  object representing the newly updated task, or null if an error occurred
                });
            }
        }
        browser.close();
    });
});