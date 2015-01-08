exports.all = function(redisClient, callback){
  redisClient.scan(0, function(err, ids){
    redisClient.mget(ids[1], function(err, quotesData){
      var quotes = quotesData.map(function(quote){return JSON.parse(quote)});
      callback(quotes);
    });
  });
};

exports.top = function(redisClient, callback){
  redisClient.select(1, function(){
    redisClient.smembers("topQuotes", function(err, ids){
      redisClient.select(0, function(){
        redisClient.mget(ids, function(err, quotesData){
          var quotes = quotesData.map(function(quote){return JSON.parse(quote)});
          callback(quotes);
        });  
      });
    });
  });
};
  
exports.byId = function(redisClient, quoteId, callback){
  redisClient.get(quoteId, function(err, quoteData){
    var quote = Array(JSON.parse(quoteData))
    callback(quote);
  });
}

exports.vote = function(redisClient, quoteId, score, successCallback, errorCallback){
  redisClient.get(quoteId, function(err, quoteData){
    if(err != null){
      errorCallback(err);
      return;
    }
    
    var quote = JSON.parse(quoteData)
    quote.rating += (score == 'up' ? 1 : -1)
    redisClient.set(quoteId, JSON.stringify(quote))
    
    if(quote.rating >= 100){
      // NOTE: A quote should stay in the Top even if its rating falls below 100
      redisClient.select(1, function(){
        redisClient.sadd('topQuotes', quoteId)
        redisClient.select(0)
      });
    }
    
    successCallback(quote)
  });
}

exports.add = function(redisClient, quoteText){
  var safeQuoteText = 
    quoteText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  var quoteId = Math.round(Math.random() * 1000).toString() //TODO: make it more... predictable
  var quote = JSON.stringify({id: quoteId, text: safeQuoteText, rating: 0, date: currentDate()})
  redisClient.set(quoteId, quote)
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
