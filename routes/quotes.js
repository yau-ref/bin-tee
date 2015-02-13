var quotes = require('./storageAccess.js');

exports.all = function(req, res){
  quotes.all(req.redisClient, function(quotes){
    res.json(quotes);
  }, sendServerError(res));
}

exports.top = function(req, res){
  quotes.top(req.redisClient, function(quotes){
    res.json(quotes);
  }, sendServerError(res));
}

exports.byId = function(req, res){
  var quoteId = req.params.quoteId
  quotes.byId(req.redisClient, quoteId, function(quote){
    res.json(quote);
  }, sendServerError(res));
}

exports.vote = function(req, res){
  var quoteId = req.params.quoteId
  var score = (req.body.score == 'up' ? 1 : -1)
  if(typeof req.session.votes == 'undefined')
    req.session.votes = {};
  var oldScore = req.session.votes[quoteId];
  var userScore = score + (oldScore == null ? 0 : oldScore);
  if(userScore > 1 || userScore < -1){
    res.status(403).json({'err': 'Voted already'})
    return;
  }
  req.session.votes[quoteId] = userScore
  quotes.vote(req.redisClient, quoteId, score,
    function(quote){
      res.json({'rating' : quote.rating})
    },
    function(err){
      //TODO: Only 404?
      res.status(404).json({'err': 'No such quote: ' + quoteId})
    });
}

exports.add = function(req, res){
  var text = req.body.text
  var redisClient = req.redisClient
  if(text.length < 10 && text.trim().length < 10)
    res.status(403).send('Too short');
  else
    quotes.add(req.redisClient, text, function(quoteId){
      res.json({'quoteId': quoteId})
    }, sendServerError(res));
}

exports.comments = function(req, res){
  var quoteId = req.params.quoteId;
  var redisClient = req.redisClient;
  quotes.comments(redisClient, quoteId,
    function(comments){
      res.json(comments)
    },
    function(err){
      res.status(500).json([{'err': 'Error while loading comments'}])
    });
}

exports.addComment = function(req, res){
  var quoteId = req.params.quoteId;
  var commentText = req.body.text;
  var redisClient = req.redisClient;
  res.end();
  quotes.addComment(redisClient, quoteId, commentText); //TODO: Does it need to have result handlers?
}

function sendServerError(res){
  return function(err){
    res.status(500).end();
  }
}
