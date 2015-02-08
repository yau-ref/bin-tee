var config = require('./config.js')

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

function checkSessionCooldown(cooldown, actionName){
  return function(req, res, next){
    if(typeof req.session.rateLimitations == 'undefined')
      req.session.rateLimitations = {}
    var now = Date.now();
    var last = req.session.rateLimitations[actionName];
    var timeout =  !last ? 0 : cooldown - now + last;
    if(timeout > 0){
      res.status(429).json({'err': 'cooldown', 'timeout': timeout})
    }else{
      req.session.rateLimitations[actionName] = now
      next()
    }
  }
}

function checkIPCooldown(sessionLimit, cooldown){
  var iptable = {};
  return function(req, res, next){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if(typeof iptable[ip] == 'undefined'){
      iptable[ip] = {};
      iptable[ip].sessions = {};
      iptable[ip].count = 0;
      iptable[ip].lastVisit = 0;
    }
    if(!iptable[ip].sessions[req.sessionID]){
      iptable[ip].sessions[req.sessionID] = true;
      iptable[ip].count += 1;
    }
    var now = Date.now();
    var last = iptable[ip].lastVisit;
    var timeout = !last ? 0 : cooldown - now + last;
    if(timeout <= 0)
      iptable[ip].lastVisit = now;
    else if(iptable[ip].count > sessionLimit)
      res.status(429).json({'err': 'cooldown', 'timeout': timeout})
    next();
  }
}

var ONE_MINUTE = 60000; 

// REST
app.get('/quotes', quotes.all);
app.get('/quotes/top', quotes.top);
app.post('/quotes', checkSessionCooldown(ONE_MINUTE * 5, 'QuotePosting'), quotes.add);
app.get('/quotes/:quoteId/comments', quotes.comments);
app.post('/quotes/:quoteId/comments', checkSessionCooldown(ONE_MINUTE, 'CommentPosting'), quotes.addComment);
app.post('/quotes/:quoteId/vote', checkIPCooldown(50, ONE_MINUTE * 5), quotes.vote);
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
