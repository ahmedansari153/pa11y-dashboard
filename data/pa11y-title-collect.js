const createClient = require('pa11y-webservice-client-node');
const fs = require('fs');
const { forEach } = require('underscore');
const config = require('../config');
const client = createClient('http://' + config.webservice.host + ':' + config.webservice.port + '/');
const puppeteer = require('puppeteer');
// -f "json file path" -u "sitemap url" -r "rename tasks with current page titles"
const parseArgs = require('minimist-lite')(process.argv.slice(2));

init(parseArgs);

function init(arg) {
    let keys = Object.keys(arg);
    let values = Object.values(arg);
    let path = "";
    if(keys.length == 1){
        console.log("Please refer to the documentation to use this application");
    }
    for(i=0;i<keys.length;i++) {
        if(keys[i] == "f")
            path = values[i];
        else if(keys[i] == "u")
            parseSitemap(values[i]);
        else if(keys[i] == "r")
            taskTitleRename();
    }
} 
function parseSitemap(url) {
    client.tasks.get({}, function (err, tasks){
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'load', timeout: 0});
            let urlObj = await page.evaluate(() => {
                let obj = {};
                document.querySelectorAll('loc').forEach(function (currentValue, currentIndex, listObj) {
                    obj[currentValue.innerHTML] = {url:currentValue.innerHTML}
                }); 
                return obj;
            });
            resolve(urlObj);
        }).then((urlObj) => {
            addTasks(urlObj);
        });
    });
}

function parseJSON(filePath, encoding) { //Parse local JSON File to object.
    return new Promise(function getJsonFileImpl(resolve, reject) {
        fs.readFile(filePath, encoding, function readFileCallback(err, contents) {
            if(err) {
            return reject(err);
            }
            resolve(contents);
        });
    }).then(JSON.parse);
}

function addTasks (data) {
    client.tasks.get({}, function (err, tasks){
        for(var d of data) {
            let exists = false;
            for(var t of tasks) {
                if(d.url==t.url) {
                    exists=true;
                    console.log(d.url, " already exists in the task list")
                    break;
                }
            }
            if(!exists) {
                client.tasks.create({
                    name: d.url,
                    url: element,
                    standard: "WCAG2AA",
                    timeout: 600000,
                    hideElements: ""
                }, function (error, task) {
                    if (error) {
                        console.log('Error:', error);
                    }
                    if (task) {
                        console.log('Imported:', task.name);
                    }
                });
            }
        }
    });
}

function taskTitleRename() { //Renames all tasks that have URL's as names with titles of page
    client.tasks.get({}, function (err, tasks){
        return new Promise(async (resolve, reject) => {
        try {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                for(var t of tasks) {
                    let url = t.name;
                    let id = t.id;
                    if(isValidHttpUrlHelper(url)) {
                        await page.goto(url, {waitUntil: 'load', timeout: 0});
                        let title = await page.evaluate(() => {
                                let articleTitle = document.querySelector("title:first-of-type")
                                if(articleTitle)
                                    return articleTitle.getInnerHTML();
                        });
                        if (title.length > 0) {
                            client.task(id).edit({
                                name: title
                            }, function (err, task) {
                                // task  =  object representing the newly updated task, or null if an error occurred
                            });
                        }
                    }
                }
                browser.close();
                
            } catch (error) {
                console.log(error);
            }
        });
        
    });
}

function isValidHttpUrlHelper (string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;  
    }

    return url.protocol === "http:" || url.protocol === "https:";
}