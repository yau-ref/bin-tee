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
    
  if(req.session.votes == undefined){
    req.session.votes = []
    req.session.votes[quoteId] = true
  }else if(req.session.votes[quoteId]){
    res.json({'result': 'fail', 'msg': 'Voted already'})
    return
  }else{
    req.session.votes[quoteId] = true
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
  var text = req.body.text
  var redisClient = req.redisClient
  res.end()  
  if(text.length > 10 && text.trim().length > 10)
    quotes.add(req.redisClient, text)
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


