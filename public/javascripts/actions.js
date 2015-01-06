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
    $http.get('/q'+ quoteId + '/vote/' + (score > 0 ? 'up' : 'down')).
      success(function(data, status, headers, config) {
        if(data.result == 'success'){
          $('#r'+quoteId).text(data.rating)
        }
    });
  };  
  $scope.submitComment = function(quoteId){    
    $http.post('/quotes/' + quoteId + '/comments', {text: this.text}).
      success(function(data, status, headers, config) {
        $('#comment-add-text-' + quoteId).val('')
        loadComments($scope, $http, quoteId);
      }).
      error(function(data, status, headers, config) {
        alert('Error!')
      });
  };       
}

function quoteSubmitController($scope, $http){
  $scope.submit = function(){
    $http.post('/quotes/add', {text: this.text}).
      success(function(data, status, headers, config) {
        toggleWriteQuoteForm();
        window.location.reload();
      }).
      error(function(data, status, headers, config) {
        alert('Error!')
      });
  }
}

function quotesController($scope, $http){
  loadQuotes($scope, $http, false);
}

function topQuotesController($scope, $http){
  loadQuotes($scope, $http, true);
}

function oneQuoteController($scope, $http){
  $scope.quoteById = function(quoteId){
      var responsePromise = $http.get('/quotes/' + quoteId);
      responsePromise.success(function(data, status, headers, config) {
        $scope.quotes = data;
      });
      responsePromise.error(function(data, status, headers, config) {
        $scope.quotes = [{text: 'Error while loading', rating: status, id: '##', date: ''}];
      });
  }
}

function loadQuotes($scope, $http, topOnly){
  var responsePromise = $http.get(topOnly ? '/quotes/top' : '/quotes/');
  responsePromise.success(function(data, status, headers, config) {
    $scope.quotes = data;
  });
  responsePromise.error(function(data, status, headers, config) {
    $scope.quotes = [{text: 'Error while loading', rating: status, id: '##', date: ''}];
  });
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
