var express  = require('express');
var static   = require('express-static');
var Firebase = require('firebase');

var app = express();

app.use(static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response, next) {
  var database = new Firebase(process.env.firebase_url);

  database.once('value', function(event) {
    request.data = event.val(); 
    next();
  });

}, function(request, response) {
  response.render('index', { data: request.data.overview });
});


var server = app.listen(process.env.PORT || 5000, function(){
    console.log('server is running at %s', server.address().port);
});