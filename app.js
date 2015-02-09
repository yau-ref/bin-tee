var config = require('./config.js')
var cooldownCheckers = require('./cooldownCheckers.js')

var express = require('express');
var http = require('http');
var path = require('path');

var redis = require('redis');
var redisClient = redis.createClient(config.redis.port, config.redis.host, config.redis.options);

var routes = require('./routes');
var quotes = require('./routes/quotes');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Extracting real client ip in case we behind a proxy
express.logger.token('non-proxy-ip', function(request){
  if (request['headers'] && request['headers']['x-forwarded-for'])
    return request['headers']['x-forwarded-for']
  if (request['socket'] && request['socket']['remoteAddress'])
    return request['socket']['remoteAddress']
  return '';
});
express.logger.format('proxy',
  ':non-proxy-ip :remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
);
app.use(express.logger('dev'));  // ATTENTION! 

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: config.session.secret}));
app.use(express.methodOverride());
app.use(function(req,res,next){
  req.redisClient = redisClient;
  next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// REST
app.get('/quotes', quotes.all);
app.get('/quotes/top', quotes.top);
app.post('/quotes',
  cooldownCheckers.forIP(config.cooldown.quotePosting.sessionLimit, config.cooldown.quotePosting.ipTimeout),
  cooldownCheckers.forSession(config.cooldown.quotePosting.sessionTimeout, 'QuotePosting'),
  quotes.add);
app.get('/quotes/:quoteId/comments', quotes.comments);
app.post('/quotes/:quoteId/comments',
  cooldownCheckers.forIP(config.cooldown.commentPosting.sessionLimit, config.cooldown.commentPosting.ipTimeout),
  cooldownCheckers.forSession(config.cooldown.commentPosting.sessionTimeout, 'CommentPosting'),
  quotes.addComment);
app.post('/quotes/:quoteId/vote',
  cooldownCheckers.forIP(25, config.cooldown.quoteVoting.ipTimeout),
  quotes.vote);
app.get('/quotes/:quoteId', quotes.byId);

// Pages
app.get('/', routes.index);
app.get('/top', routes.top);
app.get('/add', routes.writenew);
app.get('/q:id', routes.quote);
app.use(routes.pageNotFound);
app.use(function(err, req, res, next) {
  res.status(err.status || 500).end();
});

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

server.listen(config.server.port, config.server.host, function(){
  console.log('Express server listening on port ' + config.server.port);
});
