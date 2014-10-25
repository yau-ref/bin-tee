
/*
 * GET marks listing.
 */

  var marks = []
  marks["Харухи Судзумия"] = "Матан: 5;Алгебра: 4; Информатика: 2;Визуальные среды: 5;Химия: 4;ИИ: 3"
  marks["Суисейсека Десу"] = "Матан: 2;Алгебра: 5; Информатика: 5;Визуальные среды: 5;Химия: 4;ИИ: 5"
  marks["Саймон Бур"] = "Матан: 5;Алгебра: 3; Информатика: 5;Визуальные среды: 3;Химия: 5;ИИ: 4"


exports.list = function(req, res){
  var username = req.params.username
  res.setHeader('Content-Type', 'text/html')
  res.end(marks[username])
};

exports.addMark = function(req, res){
  var data = req.body
  var username = data.username
  var subject = data.subject
  var mark = data.markValue
  
  var newEntry = subject + ': ' + mark

  var subjrx = new RegExp(subject + ': [0-5]')
  if(!subjrx.test(marks[username]))
    marks[username] = marks[username] + '; ' + newEntry
  
  res.end("OK")
};

exports.updateMark = function(req, res){
  var data = req.body
  var username = data.username
  var subject = data.subject
  var mark = data.markValue
  
  var newEntry = subject + ': ' + mark

  var subjrx = new RegExp(subject + ': [0-5]')
  marks[username] = subjrx.test(marks[username]) ?
                      marks[username].replace(subjrx, newEntry) :
                      marks[username] + '; ' + newEntry


  res.end("OK")
};


exports.deleteMark = function(req, res){
  var data = req.body
  var username = data.username
  var subject = data.subject
  var mark = data.markValue
  
  var newEntry = subject + ': ' + mark

  console.log(subject)
  var subjrx = new RegExp(subject + ': [0-5]')
  marks[username] = marks[username].replace(subjrx, '')

  res.end("OK")
};
