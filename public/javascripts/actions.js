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
                        <a href="#" class="rateUp">+</a> \
                        <span class="rating">{rating}</span> \
                        <a href="#" class="rateDown">−</a> \
                        <p class="info"> \
                          <span class="quote_date">{date}</span> \
                          <a href="#" class="quote_id"># {id}</a> \
                        </p> \
                      </div> \
                   </div>'
  return template.supplant({rating: quoteData.rating, date: quoteData.date, id: quoteData.id}).supplant({text: quoteData.text})
}

function loadQuotes(list){
  $.ajax({
    url: '/quotes/',
    success: function(quotes){
      for(var i in quotes) {
        $(list).append($(makeQuote(quotes[i])))
      }
    }
  })
}


$(document).ready(function(){

})
