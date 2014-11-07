var express = require('express');
var http = require('http');
var path = require('path');

var redis = require('redis');
var redisClient = redis.createClient(6379, 'localhost');

var routes = require('./routes');
var quotes = require('./routes/quotes');
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());

app.use(function(req,res,next){
  req.redisClient = redisClient;
  next();
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/quotes/', quotes.all);
app.get('/quotes/top', quotes.top);
app.post('/quotes/add', quotes.add);
app.get('/quotes/:id', quotes.byId);

app.get('/', routes.index);
app.get('/top', routes.top);
app.get('/add', routes.writenew);
app.get('/q:id', routes.quote);
app.get('/q:id/vote/:score', quotes.vote);

app.use(routes.pageNotFound);

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: err
      });
  });
}else{
  app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
          message: err.message,
          error: {}
      });
  });
}

var server = http.createServer(app);

function exitHandler(options, err) {
  if(options.cleanup){
    console.log('Cleaning')
    console.log('Closing redis connection')
    redisClient.quit()
  }
  // to prevent emmiting exit event again
  if (options.exit){
    server.close()
    process.exit()
  }
}
process.on('exit', exitHandler.bind(null, {cleanup:true}));
process.on('SIGINT', exitHandler.bind(null, {exit:true}));
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
