var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard Page
 app.controller('dashboardController', function($scope, $http) {
   console.log("In app controller");
     $http({
      url: '/',
      method: 'GET'
    }).then(res => {
      console.log("DASHBOARD: ", res.data);
      $scope.genres = res.data;
    }, err => {
      console.log("Dashboard ERROR: ", err);
    });
    // $scope.showMovies = function(g) {
    // 	$scope.g = g.genre
    //   $http({
    //   url: '/genres/'+$scope.g,
    //   method: 'GET'
    // }).then(res => {
    //   console.log("TOP 10 MOVIES in " +$scope.g, res.data);
    //   $scope.movies = res.data;
    // }, err => {
    //   console.log("MOVIES in Genre ERROR: ", err);
    // });
//  }
});

// Controller for the Search Page
app.controller('searchController', function($scope, $http) {
  // TODO: Q2
});

// Controller for the County Page
app.controller('countyController', function($scope, $http) {
  $scope.submitIds = function() {
    $http({
      url: '/county/' + $scope.countyName,
      method: 'GET'
    }).then(res => {
      //console.log(data)
      console.log("DESC in county: ", res.data);
      $scope.countyDesc = res.data;
    }, err => {
      console.log("County ERROR: ", err);
    });
  }
});


// Controller for the Census Page
app.controller('censusController', function($scope, $http) {
   $http({
    url: '/census',
    method: 'GET'
  }).then(res => {
    var data = ["white", "black", "hispanic", "asian", "native", "pacific"];
    console.log(data);
    //console.log("CENSUS: ", res.data);
    //$scope.census = res.data;
    $scope.races = data;
  }, err => {
    console.log("Census ERROR: ", err);
  });


  $scope.showEvents = function(r) {
  	$scope.r = r;
    $http({
      url: '/census/'+$scope.r,
      method: 'GET'
  }).then(res => {
    console.log("Number of events affecting group " + $scope.r, res.data);
    $scope.events = res.data;
  }, err => {
    console.log("CENSUS ERROR: ", err);
  });
	}
});

// app.controller('censusController', function($scope, $http) {
//   $http({
//     url: '/census',
//     method: 'GET'
//   }).then(res => {
//     console.log("Census: ", res.data);
//     $scope.census = res.data;
//   }, err => {
//     console.log("Census ERROR: ", err);
//   });
//     $scope.submitDecade = function() {
//   	$http({
//     url: '/decades/'+$scope.selectedDecade,
//     method: 'GET'
//   }).then(res => {
//     console.log("Top Voted Based In " +$scope.selectedDecade, res.data);
//     $scope.bestofMovies = res.data;
//   }, err => {
//     console.log("Top Voted ERROR: ", err);
//   });
//   }
// });
