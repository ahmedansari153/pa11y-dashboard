// This file is part of Pa11y Dashboard.
//
// Pa11y Dashboard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Pa11y Dashboard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Pa11y Dashboard.  If not, see <http://www.gnu.org/licenses/>.
'use strict';

const presentTask = require('../view/presenter/task');

module.exports = route;

// Route definition
function route(app) {
	app.express.get('/', (request, response, next) => {
		app.webservice.tasks.get({lastres: true}, (error, tasks) => {
			if (error) {
				return next(error);
			}
			let helpLibraryTasks = tasks.filter((task)=>task.url.includes("https://www.lg.com/us/support/help-library/"));
			let supportTasks = tasks.filter((task)=> {
				if(task.url.contains("https://www.lg.com/us/support" && !task.url.contains("https://www.lg.com/us/support/help-library/"))) {
					return task;
				}
			});
			let obsTasks = tasks.filter((task)=> {
				if(!task.url.contains("https://www.lg.com/us/support" && !task.url.contains("https://www.lg.com/us/support/help-library/"))) {
					return task;
				}
			});
			response.render('index', {
				helptasks: helpLibraryTasks.map(presentTask),
				supTasks: supportTasks.map(presentTask),
				tasks: obsTasks.map(presentTask),
				deleted: (typeof request.query.deleted !== 'undefined'),
				isHomePage: true
			});
		});
	});
}
