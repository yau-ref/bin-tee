var express = require('express');
var http = require('http');
var path = require('path');

var routes = require('./routes');
var quotes = require('./routes/quotes');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/quotes/', quotes.all);
app.get('/quotes/:id', quotes.byId);
app.get('/', routes.index);
app.get('/:id', routes.quote);
app.get('/:id/voteUp', quotes.voteUp);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
