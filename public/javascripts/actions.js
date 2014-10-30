$(document).ready(function(){

})

String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b]
      return typeof r === 'string' || typeof r === 'number' ? r : a
    }
  )
}

function makeQuote(quoteData){
  var template =  '<div class="quote"> \
                      <p class="text">{text}</p> \
                      <div class="controls"> \
                        <a href="" onclick="voteUp({id})" class="voteUp">+</a> \
                        <span class="rating" id="r{id}">{rating}</span> \
                        <a href="" onclick="voteDown({id})" class="voteDown">−</a> \
                        <p class="info"> \
                          <span class="quote_date">{date}</span> \
                          <a href="/{id}" class="quote_id"># {id}</a> \
                        </p> \
                      </div> \
                   </div>'                   
  return template.supplant({rating: quoteData.rating, date: quoteData.date, id: quoteData.id}).supplant({text: quoteData.text})
}

function loadQuotes(list, id){
  $.ajax({
    url: '/quotes/' + (id == undefined ? '' : id),
    success: function(quotes){
      for(var i in quotes) {
        $(list).append($(makeQuote(quotes[i])))
      }
    }
  })
}

function vote(id, score){
  $.ajax({
    url: '/'+ id + "/vote/" + (score > 0 ? "up" : "down"),
    success: function(res){
      if(res.result == 'success')
        $("#r"+id).text(res.rating)
    }
  })
}

// HANDLERS
function voteUp(id){
  vote(id, 1)
  return false
}

function voteDown(id){
  vote(id, -1)
  return false
}
