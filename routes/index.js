var quotes = require('./storageAccess.js');

exports.index = function(req, res){
  quotes.all(req.redisClient, function(quotes){
    res.render('index', { title: '/bin/tee', quotes: quotes});
  });
}

exports.top = function(req, res){
  quotes.top(req.redisClient, function(quotes){
    res.render('index', { title: '/bin/tee top', quotes: quotes});
  });
}

exports.quote = function(req, res){
  var quoteId = req.params.id
  quotes.byId(req.redisClient, quoteId, function(quote){
    res.render('index', { title: '/bin/tee #' + quoteId, quotes: quote});
  });
}

exports.writenew = function(req, res){
  res.render('writenew', { title: '/bin/tee write new'});
}

exports.pageNotFound = function(req, res){
  res.status(404);
  res.render('404', {title: '/bin/tee page not found'});
}
