exports.index = function(req, res){
  var redisClient = req.redisClient
  redisClient.scan(0, function(err, ids){
    redisClient.mget(ids[1], function(err, quotes){
      var normalizedArray = quotes.map(function(quote){return JSON.parse(quote)})
      res.render('index', { title: '/bin/tee', quotes: normalizedArray})
    });
  });
}

exports.top = function(req, res){
  var redisClient = req.redisClient
  redisClient.select(1, function(){
    redisClient.smembers("topQuotes", function(err, ids){
      redisClient.select(0, function(){
        redisClient.mget(ids, function(err, quotes){
          var normalizedArray = quotes.map(function(quote){return JSON.parse(quote)});
          res.render('index', { title: '/bin/tee top', quotes: normalizedArray})
        });  
      });
    });
  });
}

exports.quote = function(req, res){
  var redisClient = req.redisClient
  var quoteId = req.params.id
  redisClient.get(quoteId, function(err, quote){
    var normalizedQuote = Array(JSON.parse(quote))
    res.render('index', { title: '/bin/tee #' + quoteId, quotes: normalizedQuote})
  });
}

exports.writenew = function(req, res){
  res.render('writenew', { title: '/bin/tee write new'})
}

exports.pageNotFound = function(req, res){
  res.status(404);
  res.render('404', {title: '/bin/tee page not found'})
}
