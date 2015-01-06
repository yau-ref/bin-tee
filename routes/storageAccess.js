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
