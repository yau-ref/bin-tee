function pageController($scope, $http){
  $scope.toggleWriteQuoteForm = toggleWriteQuoteForm;
  loadQuotes($scope, $http);
}

function loadQuotes($scope, $http){
  var responsePromise = $http.get('/quotes/');
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
