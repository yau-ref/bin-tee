var DB_QUOTES = 0;
var DB_META = 1;
var DB_COMMENTS = 2;

exports.all = function(redisClient, callback){
  redisClient.select(DB_QUOTES, function(){
    redisClient.scan(0, function(err, ids){
      redisClient.mget(ids[1 /*[pointerId, [ids]]*/], function(err, quotesData){
        var quotes = quotesData.map(function(quote){return JSON.parse(quote)}).sort(function(a,b) { return a.id - b.id});
        callback(quotes);
      });
    });
  });
};

exports.top = function(redisClient, callback){
  redisClient.select(DB_META, function(){
    redisClient.smembers("topQuotes", function(err, ids){
      redisClient.select(DB_QUOTES, function(){
        redisClient.mget(ids, function(err, quotesData){
          var quotes = quotesData.map(function(quote){return JSON.parse(quote)});
          callback(quotes);
        });  
      });
    });
  });
};
  
exports.byId = function(redisClient, quoteId, callback){
  redisClient.select(DB_QUOTES, function(){
    redisClient.get(quoteId, function(err, quoteData){
      var quote = Array(JSON.parse(quoteData))
      callback(quote);
    });
  });
}

exports.vote = function(redisClient, quoteId, score, successCallback, errorCallback){
  redisClient.select(DB_QUOTES, function(){
    redisClient.get(quoteId, function(err, quoteData){
      if(err != null){
        errorCallback(err);
        return;
      }
      
      var quote = JSON.parse(quoteData)
      quote.rating += (score == 'up' ? 1 : -1)
      redisClient.set(quoteId, JSON.stringify(quote))
      
      if(quote.rating >= 100){
        redisClient.select(DB_META, function(){
          redisClient.sadd('topQuotes', quoteId)
        });
      }
      
      successCallback(quote)
    });
  });
}

exports.add = function(redisClient, quoteText){
  var safeQuoteText = makeItSafe(quoteText)
  redisClient.select(DB_META, function(){
    redisClient.incr('lastQuoteId', function(err, quoteId){
      var quote = JSON.stringify({id: quoteId, text: safeQuoteText, rating: 0, date: currentDate()})
      redisClient.select(DB_QUOTES, function(){
        redisClient.set(quoteId, quote);
      });
    });
  });
}

exports.comments = function(redisClient, quoteId, successCallback, errorCallback){
  redisClient.select(DB_COMMENTS, function(){
    redisClient.lrange(quoteId, 0, -1, function(err, comments){
      if(err != null){
        errorCallback(err)
      }else{
        var normalizedArray = comments.map(function(quote){return JSON.parse(quote)})
        successCallback(normalizedArray)
      }
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
