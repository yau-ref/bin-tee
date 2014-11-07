exports.index = function(req, res){
  res.render('index', { title: '/bin/tee', topOnly: false})
}

exports.top = function(req, res){
  res.render('index', { title: '/bin/tee top', topOnly: true})
}

exports.quote = function(req, res){
  var id = req.params.id
  res.render('index', { title: '/bin/tee ' + id, topOnly: false, quoteId: id})
}

exports.writenew = function(req, res){
  res.render('writenew', { title: '/bin/tee write new'})
}

exports.pageNotFound = function(req, res){
  res.status(404);
  res.render('404', {title: '/bin/tee page not found'})
}
