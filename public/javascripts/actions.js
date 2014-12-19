function pageController($scope, $http){
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
