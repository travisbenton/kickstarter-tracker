var express = require('express');
var app = express();

var request = require('request');
var cheerio = require('cheerio');
var firebase = require('firebase');
var database = new firebase('https://kickstarter.firebaseio.com/');
var moment = require('moment');
var date = moment().utcOffset(-300).format('YYYY-MM-DD HH:mm');
var url = 'https://www.kickstarter.com/projects/less/less-like-chess-but-less';

request(url, function (error, response, body) {
  var $ = cheerio.load(body);
  
  database.child(date).set($('[data-pledged]').data());
  // console.log(date);
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


