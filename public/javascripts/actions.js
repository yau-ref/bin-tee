$(document).ready(function(){

  $("#quoteAddButton").click(function(){
    $.ajax({
      url: '/quotes/add',
      type: 'POST',
      data: {
        text: $('#quoteAddText').val()
      },
      datatype: 'json', 
      success: function(quotes){
        $('#quoteAddForm').toggleClass("hidden")
        location.reload()
      }
    })   
    return false;
  });

  $('#writeNew').click(function(){
    var form = $('#quoteAddForm')
    form.toggleClass("hidden")
    return false;
  });  

});

String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b]
      return typeof r === 'string' || typeof r === 'number' ? r : a
    }
  )
};

function makeQuote(quoteData){
  var template =  '<div class="quote"> \
                      <p class="text">{text}</p> \
                      <div class="controls"> \
                        <a href=""  onclick="voteUp({id}); return false;" class="voteUp">+</a> \
                        <span class="rating" id="r{id}">{rating}</span> \
                        <a href="" onclick="voteDown({id}); return false;" class="voteDown">−</a> \
                        <p class="info"> \
                          <span class="quote_date">{date}</span> \
                          <a href="/q{id}" class="quote_id"># {id}</a> \
                        </p> \
                      </div> \
                   </div>'                   
  return template.supplant({rating: quoteData.rating, date: quoteData.date, id: quoteData.id}).supplant({text: quoteData.text})
};


//QUOTES ACCESSING
function loadQuotesByPath(list, path){
  $.ajax({
    url: path,
    datatype: 'json', 
    success: function(quotes){
      $(list).empty();
      for(var i in quotes) {
        $(list).append($(makeQuote(quotes[i])))
      }
    }
  })
};

function loadQuotes(list, topOnly){
  loadQuotesByPath(list, topOnly ? '/quotes/top/' : '/quotes/')
};

function loadQuote(list, id){
  loadQuotesByPath(list, '/quotes/' + id)
};

function vote(id, score){
  $.ajax({
    url: '/q'+ id + '/vote/' + (score > 0 ? 'up' : 'down'),
    datatype: 'json', 
    success: function(res){
      if(res.result == 'success')
        $('#r'+id).text(res.rating)
    }
  })
};

// HANDLERS
function voteUp(id){
  vote(id, 1);
  return false;
};

function voteDown(id){
  vote(id, -1);
  return false;
};
