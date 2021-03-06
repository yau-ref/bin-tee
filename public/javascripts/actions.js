angular.module('bintee', ['ngSanitize']);
  
function pageController($scope, $http){
  $scope.toggleWriteQuoteForm = toggleWriteQuoteForm  
  $scope.commentCache = [];
  $scope.comments = function(quoteId){
    return $scope.commentCache[quoteId];
  };
  $scope.openComments = function(quoteId){
    loadComments($scope, $http, quoteId);
    $('#q'+quoteId).toggleClass('opened-quote')
    $('#quote-comments-' + quoteId).toggleClass("hidden");
  }; 
  $scope.voteQuote = function(quoteId, score){
    $http.post('/quotes/'+ quoteId + '/vote', {score: (score > 0 ? 'up' : 'down')}).
      success(function(data, status, headers, config) {
        $('#r'+quoteId).text(data.rating)
      });
  };  
  $scope.submitComment = function(quoteId){    
    var textarea = $('#comment-add-text-' + quoteId);
    var text = textarea.val();
    if(text.length < 10){
      alert('Too short')
      return;
    }
    if(text.trim().length < 10){
      alert('Too much spaces')
      return;
    }    
    textarea.val('');
    $http.post('/quotes/' + quoteId + '/comments', {text: text}).
      success(function(data, status, headers, config) {
        loadComments($scope, $http, quoteId);
      }).
      error(function(data, status, headers, config) {
        if(status == 429)
          alertTimeoutError(data.timeout, 'commenting')
      });
  };       
}

function quoteSubmitController($scope, $http){
  $scope.submit = function(){
    var text = this.text
    if(text.length < 10){
      alert('Too short!')
      return;
    }
    if(text.trim().length < 10){
      alert('Too much spaces')
      return;
    }
    $http.post('/quotes', {text: text}).
      success(function(data, status, headers, config) {
        toggleWriteQuoteForm();
        window.location.reload();
      }).
      error(function(data, status, headers, config) {
        if(status == 429)
          alertTimeoutError(data.timeout, 'posting')
      });
  }
}

function alertTimeoutError(rawTimeout, actionName){
  var timeout = Math.round(rawTimeout / 1000)
  var time = timeout > 59 ? Math.round(timeout / 60) + ' minutes' : timeout + ' seconds'
  alert('You are ' + actionName +' to often. Try after ' + time)
}

function toggleWriteQuoteForm(){
  $('#quoteAddForm').toggleClass('hidden');
}

function loadComments($scope, $http, quoteId){ 
  $http.get('/quotes/' + quoteId + '/comments').
    success(function(data, status, headers, config) {
      $scope.commentCache[quoteId] = data
    }).
    error(function(data, status, headers, config) {
//      $scope.commentCache[quoteId] = [{text: status}]
    });
}
