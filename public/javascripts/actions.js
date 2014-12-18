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
  var template =  '<div id="q{id}" class="quote"> \
                      <p class="text">{text}</p> \
                      <div class="controls"> \
                        <a href="" onclick="voteUp({id}); return false;" class="voteUp">+</a> \
                        <span class="rating" id="r{id}">{rating}</span> \
                        <a href="" onclick="voteDown({id}); return false;" class="voteDown">−</a> \
                        <a href="#" onclick="openComments({id}); return false;" class="quote-comments-button fa fa-comments-o"></a> \
                        <p class="info"> \
                          <span class="quote_date">{date}</span> \
                          <a href="/q{id}" class="quote_id"># {id}</a> \
                        </p> \
                      </div> \
                      <div id="quote-comments-{id}" class="comments hidden"></div>\
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


// ACCESSING COMMENTS

function loadComments(quoteId){
  $.ajax({
    url: '/quotes/' + quoteId + '/comments',
    datatype: 'json', 
    success: function(comments){
      var quoteComments = $("#quote-comments-" + quoteId)
      quoteComments.empty();
      //TODO: check result status
      for(var i in comments) {
        quoteComments.append($(makeComment(comments[i])))
      }
      var template = '<form>\
                        <textarea id="comment-add-text-{quoteId}" placeholder="Your comment text"></textarea> \
                        <button onclick="sendComment({quoteId}); return false;" class="fa fa-send"></button> \
                      </form>';
      quoteComments.append(template.supplant({quoteId: quoteId}));
    }
  });
}

function sendComment(quoteId){
  var commentText = $("textarea#comment-add-text-" + quoteId).val();
  
  $.ajax({
    type: "POST",
    url: "/quotes/" + quoteId + "/comments",
    datatype: 'json', 
    data: {'text': commentText},
    success: function(){
      loadComments(quoteId);
    }
  });
  
  
  return false;
}

function makeComment(commentData){
  var template =  '<div id="c{id}" class="comment"> \
                      <p class="comment-text">{text}</p> \
                      <p class="comment-info"> \
                        <span class="comment-date">{date}</span> \
                      </p> \
                   </div>';
  return template.supplant({date: commentData.date, id: commentData.id}).supplant({text: commentData.text})
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

function openComments(id){
  loadComments(id);
  $('#q'+id).toggleClass("opened-quote");
  $('#quote-comments-' + id).toggleClass("hidden");
}
