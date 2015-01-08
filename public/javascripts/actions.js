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
        if(data.result == 'success'){
          $('#r'+quoteId).text(data.rating)
        }
    });
  };  
  $scope.submitComment = function(quoteId){    
    var textarea = $('#comment-add-text-' + quoteId);
    var text = textarea.val();
    textarea.val('');
    $http.post('/quotes/' + quoteId + '/comments', {text: text}).
      success(function(data, status, headers, config) {
        loadComments($scope, $http, quoteId);
      }).
      error(function(data, status, headers, config) {
        alert('Error!')
      });
  };       
}

function quoteSubmitController($scope, $http){
  $scope.submit = function(){
    $http.post('/quotes', {text: this.text}).
      success(function(data, status, headers, config) {
        toggleWriteQuoteForm();
        window.location.reload();
      }).
      error(function(data, status, headers, config) {
        alert('Error!')
      });
  }
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
      $scope.commentCache[quoteId] = [{text: status}]
    });
}
