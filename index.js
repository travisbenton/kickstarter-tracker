var express = require('express');
var static  = require('express-static');

var app = express();

app.use(static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

var server = app.listen(process.env.PORT || 5000, function(){
    console.log('server is running at %s', server.address().port);
});