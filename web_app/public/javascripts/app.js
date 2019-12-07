var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard Page
 app.controller('dashboardController', function($scope, $http) {
   console.log("In app controller");
     $http({
      url: '/dashboardSummary',
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
      method: 'GET',
      responseType: 'text'
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


// Controller for the Episode Details Page
app.controller('episodeController', function($scope,  $location, $http,) {
  var queryParams = $location.search();
  $http({
    url: '/episodeEvents?ep_id='+queryParams.ep_id,
    method: 'GET'
  }).then(res => {
    $scope.episodeID = queryParams.ep_id;
    $scope.episodeEvents = res.data;
  }, err => {
    console.log("episodeController ERROR: ", err);
  });

   $http({
    url: '/episodeNarrative?ep_id='+queryParams.ep_id,
    method: 'GET'
  }).then(res => {
    $scope.episodeNarrative = res.data;
  }, err => {
    console.log("episodeController ERROR: ", err);
  });

});
