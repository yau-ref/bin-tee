var quotes = require('./storageAccess.js');

exports.all = function(req, res){
  quotes.all(req.redisClient, function(quotes){
    res.json(quotes);
  });  
}

exports.top = function(req, res){
  quotes.top(req.redisClient, function(quotes){
    res.json(quotes);
  });
}

exports.byId = function(req, res){
  var quoteId = req.params.quoteId
  quotes.byId(req.redisClient, quoteId, function(quote){
    res.json(quote);
  });
}

exports.vote = function(req, res){
  var quoteId = req.params.quoteId
  if(req.cookies.votes === undefined){
    res.cookie('votes', quoteId, { maxAge: 900000, httpOnly: true })
  }else if(req.cookies.votes.toString().split(';').indexOf(quoteId) >= 0){
    res.json({'result': 'fail', 'msg': 'Voted already'})
    return;
  }else{
    res.cookie('votes', req.cookies.votes + ';' + quoteId, { maxAge: 900000, httpOnly: true })
  }

  var score = req.body.score
  var redisClient = req.redisClient     
  
  quotes.vote(redisClient, quoteId, score,
    function(quote){
      res.json({'result': 'success', 'rating' : quote.rating})
    },
    function(err){
      res.json({'result': 'fail', 'msg': 'No such quote:' + quoteId})
    });
}

exports.add = function(req, res){
  var quoteText = req.body.text
  var redisClient = req.redisClient
  res.end()
  quotes.add(req.redisClient, req.body.text)
}

exports.comments = function(req, res){
  var quoteId = req.params.quoteId;
  var redisClient = req.redisClient;
  quotes.comments(redisClient, quoteId,
    function(comments){
      res.json(comments)
    },
    function(err){
      res.json([{text: 'Error while loading comments'}])
    });
}

exports.addComment = function(req, res){
  var quoteId = req.params.quoteId
  var commentText = req.body.text
  var redisClient = req.redisClient
  res.end()
  quotes.addComment(redisClient, quoteId, commentText)
}


