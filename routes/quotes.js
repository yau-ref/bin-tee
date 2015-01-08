var quotes = require('./storageAccess.js');
var DB_COMMENTS = 2;

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
  var safeQuoteText = 
    quoteText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  var quoteId = Math.round(Math.random() * 1000).toString()
  var quote = JSON.stringify({id: quoteId, text: safeQuoteText, rating: 0, date: currentDate()})
  var redisClient = req.redisClient 
  redisClient.set(quoteId, quote)
  res.end() //TODO: move up
}

exports.comments = function(req, res){
  var quoteId = req.params.quoteId;
  var redisClient = req.redisClient;
  redisClient.select(DB_COMMENTS, function(){
    redisClient.lrange(quoteId, 0, -1, function(err, comments){
      var normalizedArray = comments.map(function(quote){return JSON.parse(quote)})
      res.json(normalizedArray)
      redisClient.select(0) // TODO: this about it
    });
  });
}

exports.addComment = function(req, res){
  var quoteId = req.params.quoteId
  var commentText = req.body.text
  var safeCommentText = 
    commentText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  var commentId = Math.round(Math.random() * 1000).toString()
  var comment = JSON.stringify({id: commentId, text: safeCommentText, date: currentDate()})
  var redisClient = req.redisClient
  redisClient.select(DB_COMMENTS, function(){
    redisClient.rpush(quoteId, comment)
    redisClient.select(0)
    res.end()  
  });
}

function currentDate(){

  function complete(x){
    return x < 10 ? '0' + x : x
  }

  var today = new Date();
  var yy = today.getFullYear().toString().substr(2,2);
  var dd = complete(today.getDate());
  var mm = complete(today.getMonth()+1);
  var hh = complete(today.getHours());
  var mnt = complete(today.getMinutes());

  return dd+'.'+mm+'.'+yy +' '+ hh + ':' + mnt;
}
