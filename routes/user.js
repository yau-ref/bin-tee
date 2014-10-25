
/*
 * GET users listing.
 */

exports.list = function(req, res){
  var users = "Харухи Судзумия,Суисейсека Десу,Саймон Бур"
  res.setHeader('Content-Type', 'text/html')
  res.end(users)
};
