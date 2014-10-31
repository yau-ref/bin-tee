var quotes = [
  {
    "id": "2",
    "text": "This is quote text. It is very interesting quote. I hope you like it. Lalala... ",
    "rating": 100,
    "date": "27.10.14 12:30"
  },
  {
    "id": "1",
    "text": "Пушкин А.С: Духовной жаждою томим, В пустыне мрачной я влачился, И шестикрылый серафим На перепутье мне явился. Перстами легкими как сон Моих зениц коснулся он: Отверзлись вещие зеницы, Как у испуганной орлицы. Моих ушей коснулся он, И их наполнил шум и звон: И внял я неба содроганье, И горний ангелов полет, И гад морских подводный ход, И дольней лозы прозябанье.",
    "rating": 120,
    "date": "26.10.14 13:25"
  }
]

function getQuote(id){
  return quotes.filter(function(quote){
    return quote.id === id
  })
}

exports.all = function(req, res){
  res.json(quotes)
}

exports.byId = function(req, res){
  var id = req.params.id
  var quote = getQuote(id)
  res.json(quote)
}

exports.vote = function(req, res){
  var id = req.params.id
  var score = req.params.score
  var quote = getQuote(id)
  if(quote === undefined || quote[0] === undefined){
      res.json({"result": "fail"})
  }else{
    quote[0].rating += (score == "up" ? 1 : -1)
    res.json({"result": "success", "rating" : quote[0].rating})
  }
}

exports.add = function(req, res){
  var quoteText = req.body.text
  var quoteId = Math.round(Math.random() * 100)
  console.log(quoteText)
  quotes.unshift({id: quoteId, text: quoteText, rating: 0, date: currentDate()})
  res.end()
}

function currentDate(){

  function complete(x){
    return x < 10 ? 0 + x : x
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
