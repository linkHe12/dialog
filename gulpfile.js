/**
 * @file load tasks
 */
const gulp = require('gulp');
const config = {};

let gulpTaskList = require("fs").readdirSync("./gulptask");

for (let path of gulpTaskList) {
    require("./gulptask/" + path)(gulp, config);
}
