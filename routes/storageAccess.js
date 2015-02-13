var DB_QUOTES = 0;
var DB_META = 1;
var DB_COMMENTS = 2;

exports.all = function(redisClient, callback, errHandler){
  redisClient.select(DB_QUOTES, function(){
    redisClient.keys('*', function(err, ids){
      if(errorOccured(err, errHandler))
        return;
      redisClient.mget(ids, function(err, quotesData){
        if(errorOccured(err, errHandler))
          return;
        callback(parseQuotes(quotesData));
      });
    });
  });
};

exports.top = function(redisClient, callback, errHandler){
  redisClient.select(DB_META, function(){
    redisClient.smembers("topQuotes", function(err, ids){
      if(errorOccured(err, errHandler))
        return;
      redisClient.select(DB_QUOTES, function(){
        redisClient.mget(ids, function(err, quotesData){
          if(errorOccured(err, errHandler))
            return;
          callback(parseQuotes(quotesData));
        });  
      });
    });
  });
};
  
exports.byId = function(redisClient, quoteId, callback, errHandler){
  redisClient.select(DB_QUOTES, function(){
    redisClient.get(quoteId, function(err, quoteData){
      if(errorOccured(err, errHandler))
        return;
      var quote = Array(JSON.parse(quoteData))
      callback(quote);
    });
  });
}

exports.vote = function(redisClient, quoteId, score, callback, errHandler){
  redisClient.select(DB_QUOTES, function(){
    redisClient.get(quoteId, function(err, quoteData){
      if(errorOccured(err, errHandler))
        return;
      var quote = JSON.parse(quoteData)
      quote.rating += score
      redisClient.set(quoteId, JSON.stringify(quote))
      if(quote.rating >= 100){
        redisClient.select(DB_META, function(){
          redisClient.sadd('topQuotes', quoteId, function(err){
            if(errorOccured(err, errHandler))
              return;
          });
        });
      }
      callback(quote)
    });
  });
}

exports.add = function(redisClient, quoteText, callback, errHandler){
  var safeQuoteText = makeItSafe(quoteText);
  redisClient.select(DB_META, function(){
    redisClient.incr('lastQuoteId', function(err, quoteId){
      if(errorOccured(err, errHandler))
        return;
      redisClient.select(DB_QUOTES, function(){
        var quote = JSON.stringify({id: quoteId, text: safeQuoteText, rating: 0, date: currentDate()});
        redisClient.set(quoteId, quote, function(err){
          if(errorOccured(err, errHandler))
            return;
        });
      });
      callback(quoteId);
    });
  });
}

exports.comments = function(redisClient, quoteId, callback, errHandler){
  redisClient.select(DB_COMMENTS, function(){
    redisClient.lrange(quoteId, 0, -1, function(err, comments){
      if(errorOccured(err, errHandler))
        return;
      var normalizedArray = comments.map(function(quote){return JSON.parse(quote)})
      callback(normalizedArray);
    });
  });
}

exports.addComment = function(redisClient, quoteId, commentText){
  redisClient.select(DB_META, function(){
    redisClient.incr('lastCommentId', function(err, commentId){
      redisClient.select(DB_COMMENTS, function(){
        var safeCommentText = makeItSafe(commentText)
        var comment = JSON.stringify({id: commentId, text: safeCommentText, date: currentDate()})
        redisClient.rpush(quoteId, comment)
      });
    });
  });
}

function makeItSafe(text){
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function parseQuotes(quotesData){
  return quotesData.map(function(quote){return JSON.parse(quote)}).sort(function(a,b) { return b.id - a.id});
}

function errorOccured(err, callback){
  var occured = err != null;
  if(occured)
    callback(err)
  return occured;
}
