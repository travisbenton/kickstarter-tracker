// just for testing
var request = require('request');
var cheerio = require('cheerio');
var firebase = require('firebase');
var moment = require('moment');
var database = new firebase('https://kickstarter.firebaseio.com/');
var date = moment().unix();

request(process.env.url, function (error, response, body) {
  var $ = cheerio.load(body);
  
  database.child(date).set($('[data-pledged]').data());
});