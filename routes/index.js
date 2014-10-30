exports.index = function(req, res){
  res.render('index', { title: '/bin/tee'})
}

exports.quote = function(req, res){
  var id = req.params.id
  res.render('quote', { title: '/bin/tee ' + id, quoteId: id})
}
