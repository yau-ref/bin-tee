var config = require('./config.js')
var redis = require('redis');
var redisClient = redis.createClient(config.redis.port, config.redis.host);

redisClient.flushall();

redisClient.select(0, function(){
  redisClient.set(2, JSON.stringify({
      'id': '2',
      'text': 'This is quote text. It is very interesting quote. I hope you like it. Lalala... ',
      'rating': 99,
      'date': '27.10.14 12:30'
  }));
  
  redisClient.set(1, JSON.stringify({
      'id': '1',
      'text': 'Пушкин А.С: Духовной жаждою томим, В пустыне мрачной я влачился, И шестикрылый серафим На перепутье мне явился. Перстами легкими как сон Моих зениц коснулся он: Отверзлись вещие зеницы, Как у испуганной орлицы. Моих ушей коснулся он, И их наполнил шум и звон: И внял я неба содроганье, И горний ангелов полет, И гад морских подводный ход, И дольней лозы прозябанье.',
      'rating': 120,
      'date': '26.10.14 13:25'
  }));



  redisClient.select(2, function(){
    redisClient.rpush(1, JSON.stringify({
      'id' : '1',
      'text' : 'Солнце русской поэзии',
      'date': '26.10.14 13:30'
    }));
    redisClient.rpush(1, JSON.stringify({
      'id' : '2',
      'text' : 'Невыразимо',
      'date': '26.10.14 14:00'
    }));

    redisClient.select(1, function(){
      redisClient.sadd('topQuotes', 1)
      redisClient.set('lastQuoteId', 2)
      redisClient.set('lastCommentId', 2)
      redisClient.quit();
    });

  });
  

});
