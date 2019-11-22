var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard page
app.controller('dashboardController', function($scope, $http) {
  // TODO: Q1
console.log("In app controller");
   $http({
    url: '/genres',
    method: 'GET'
  }).then(res => {
    console.log("GENRES: ", res.data);
    $scope.genres = res.data;
  }, err => {
    console.log("Genres ERROR: ", err);
  });
  $scope.showMovies = function(g) {
  	$scope.g = g.genre
    $http({
    url: '/genres/'+$scope.g,
    method: 'GET'
  }).then(res => {
    console.log("TOP 10 MOVIES in " +$scope.g, res.data);
    $scope.movies = res.data;
  }, err => {
    console.log("MOVIES in Genre ERROR: ", err);
  });
	}
});

// Controller for the Recommendations Page
app.controller('recommendationsController', function($scope, $http) {
  // TODO: Q2
});

// Controller for the Best Of Page
app.controller('bestofController', function($scope, $http) {
  // TODO: Q3
        $http({
    url: '/decades',
    method: 'GET'
  }).then(res => {
    console.log("Decades: ", res.data);
    $scope.decades = res.data;
  }, err => {
    console.log("Decades ERROR: ", err);
  });
    $scope.submitDecade = function() {
  	$http({
    url: '/decades/'+$scope.selectedDecade,
    method: 'GET'
  }).then(res => {
    console.log("Top Voted Based In " +$scope.selectedDecade, res.data);
    $scope.bestofMovies = res.data;
  }, err => {
    console.log("Top Voted ERROR: ", err);
  });
  }
});
