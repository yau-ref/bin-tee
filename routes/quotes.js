var quotes = [
  {
    "id": "2",
    "text": "This is quote text. It is very interesting quote. I hope you like it. Lalala... ",
    "rating": 100,
    "date": "27.10.14"
  },
  {
    "id": "1",
    "text": "Пушкин А.С: Духовной жаждою томим, В пустыне мрачной я влачился, И шестикрылый серафим На перепутье мне явился. Перстами легкими как сон Моих зениц коснулся он: Отверзлись вещие зеницы, Как у испуганной орлицы. Моих ушей коснулся он, И их наполнил шум и звон: И внял я неба содроганье, И горний ангелов полет, И гад морских подводный ход, И дольней лозы прозябанье.",
    "rating": 120,
    "date": "26.10.14"
  }
]

exports.all = function(req, res){
  res.json(quotes)
}


exports.byId = function(req, res){
  var id = req.params.id
  var quote = quotes.filter(function(quote){
    return quote.id === id;
  })
  res.json(quote)
}
