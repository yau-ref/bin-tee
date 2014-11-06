exports.all = function(req, res){
  var redisClient = req.redisClient
  var quoteId = req.params.id
  redisClient.get(quoteId, function(err, quote){
    var normalizedQuote = Array(JSON.parse(quote))
    res.json(normalizedQuote)
  });
}

exports.top = function(req, res){
  var topQuotes = quotes.filter(function(quote){
    return quote.rating > 100
  })
  res.json(topQuotes)
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
  var id = req.params.id  
  if(req.cookies.votes === undefined)
    res.cookie('votes', id, { maxAge: 900000, httpOnly: true })
  if(req.cookies.votes.toString().split(';').indexOf(id) >= 0){
    res.json({'result': 'fail', 'msg': 'Voted already'})
    return;
  }
  res.cookie('votes', req.cookies.votes + ';' + id, { maxAge: 900000, httpOnly: true })
  var score = req.params.score
  var quote = getQuote(id)
  if(quote === undefined || quote[0] === undefined){
      res.json({'result': 'fail', 'msg': 'No such quote:' + id})
  }else{
    quote[0].rating += (score == 'up' ? 1 : -1)
    res.json({'result': 'success', 'rating' : quote[0].rating})
  }
}

exports.add = function(req, res){
  var quoteText = req.body.text
  var quoteId = Math.round(Math.random() * 100).toString()
  quotes.unshift({id: quoteId, text: quoteText, rating: 0, date: currentDate()})
  res.end()
}

function currentDate(){

  function complete(x){
    return x < 10 ? '0' + x : x
  }

  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yy = today.getFullYear().toString().substr(2,2);
  var hh = today.getHours();
  var mnt = today.getMinutes();

  dd = complete(dd)
  mm = complete(mm)
  hh = complete(hh)
  mnt = complete(mnt)

  return dd+'.'+mm+'.'+yy +' '+ hh + ':' + mnt;
}
