const createClient = require('pa11y-webservice-client-node');
const fs = require('fs');
const { forEach } = require('underscore');
const config = require('../config');
const client = createClient('http://' + config.webservice.host + ':' + config.webservice.port + '/');
const puppeteer = require('puppeteer');
//" -u "sitemap url" -r "rename tasks with current page titles"

parseSitemap("https://wwww.lg.com/us/sitemap-cs.xml")

function parseSitemap(url) { // Paramaters: Sitemap Url 
    client.tasks.get({}, function (err, tasks){
        return new Promise(async (resolve, reject) => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url, {waitUntil: 'load', timeout: 0});
            console.log(url);
            let urlObj = await page.evaluate(() => {
                let obj = [];
                document.querySelectorAll('loc').forEach(function (currentValue, currentIndex, listObj) {
                    obj.push({
                        url: currentValue.innerHTML,
                        title: ""
                    });
                }); 
                console.log(obj);
                return obj;
            });
            browser.close();
            resolve(urlObj);
        }).then((urlObj) => {
            getTitles(urlObj);
        });
    });
}
function getTitles(arr) { //Get titles for all urls found in sitemap parse. If not found delete item from array.
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        let updated = arr;
        for(let i=0; i<updated.length; i++) {
            await page.goto(updated[i].url, {waitUntil: 'load', timeout: 0});
            let title = await page.evaluate(() => {
                return document.querySelector("title");
            });
            let found = false;
            for (let j = 0; j < updated.length; j++) {
                if(updated[i].title == title) {
                    found = true;
                    break;
                }                
            }
            if(found == false)
                updated[i].title = title;
            else {
                updated[i].splice();
            }
        }
        resolve(updated);
    }).then((updated) => {
        addTasks(updated);
    });
}
function addTasks (data) {
    client.tasks.get({}, function (err, tasks){
        for(var d of data) {
            let exists = false;
            for(var t of tasks) {
                if(d.title==t.name) {
                    exists=true;
                    console.log(d.url, " already exists in the task list")
                    break;
                }
            }
            if(!exists) {
                if(d.url.includes("lg.com/us/support/help-library/"))  {
                    client.tasks.create({
                        name: d.title,
                        url: element,
                        standard: "WCAG2AA",
                        timeout: 1000000,
                        hideElements: ".navigation.b2c, .breadcrumb, .support-title, .article-feedback, .article-nav, .return-to-result, .rel-help-library-wrap, .support-link-banner-wrap, .contact-us-link-menu, .footer-box, iframe, img[src='https://tags.w55c.net/rs?id=cd05700e2b8a4cc08a1d25adb8bace5f&t=homepage']"
                      }, function (error, task) {
                        if (error) {
                          console.error('Error:', error);
                        }
                        if (task) {
                          console.log('Imported:', task.name);
                        }
                      });
                }
                else {
                    client.tasks.create({
                        name: d.title,
                        url: element,
                        standard: "WCAG2AA",
                        timeout: 1000000,
                        hideElements: "iframe, img[src='https://tags.w55c.net/rs?id=cd05700e2b8a4cc08a1d25adb8bace5f&t=homepage'"
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
        }
    });
}

function tasksTitleRename() { //Renames all tasks that have URL's as names with titles of page
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