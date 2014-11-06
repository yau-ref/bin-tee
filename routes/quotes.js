exports.all = function(req, res){
  var redisClient = req.redisClient
  
  redisClient.scan(0, function(err, ids){
    redisClient.mget(ids[1], function(err, quotes){
      var normalizedArray = quotes.map(function(quote){return JSON.parse(quote)})
      res.json(normalizedArray)
    });
  });
}

exports.top = function(req, res){
  var redisClient = req.redisClient
  
  redisClient.select(1, function(){
    redisClient.smembers("topQuotes", function(err, ids){
      redisClient.select(0, function(){
        redisClient.mget(ids, function(err, quotes){
          var normalizedArray = quotes.map(function(quote){return JSON.parse(quote)})
          res.json(normalizedArray)
        });  
      });
    });
  });
}

exports.byId = function(req, res){
  var redisClient = req.redisClient
  var quoteId = req.params.id
  redisClient.get(quoteId, function(err, quote){
    var normalizedQuote = Array(JSON.parse(quote))
    res.json(normalizedQuote)
  });
}

exports.vote = function(req, res){
  var quoteId = req.params.id  
  if(req.cookies.votes === undefined){
    res.cookie('votes', quoteId, { maxAge: 900000, httpOnly: true })
  }else if(req.cookies.votes.toString().split(';').indexOf(quoteId) >= 0){
    res.json({'result': 'fail', 'msg': 'Voted already'})
    return;
  }else{
    res.cookie('votes', req.cookies.votes + ';' + quoteId, { maxAge: 900000, httpOnly: true })
  }

  var score = req.params.score
  var redisClient = req.redisClient     
  redisClient.get(quoteId, function(err, quote){
    if(err != null){
      res.json({'result': 'fail', 'msg': 'No such quote:' + quoteId})
      return;
    }
    
    var q = JSON.parse(quote)
    q.rating += (score == 'up' ? 1 : -1)
    redisClient.set(quoteId, JSON.stringify(q))
    
    if(q.rating >= 100){
      // NOTE: A quote should stay in the Top even if its rating falls below 100
      redisClient.select(1, function(){
        redisClient.sadd('topQuotes', quoteId)
        redisClient.select(0)
      });
    }
    
    res.json({'result': 'success', 'rating' : q.rating})
  });
}

exports.add = function(req, res){
  var quoteText = req.body.text
  var quoteId = Math.round(Math.random() * 1000).toString()
  var quote = JSON.stringify({id: quoteId, text: quoteText, rating: 0, date: currentDate()})
  var redisClient = req.redisClient 
  redisClient.set(quoteId, quote)
  res.end()
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
