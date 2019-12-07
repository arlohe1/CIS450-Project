var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard Page
 app.controller('dashboardController', function($scope, $http) {
   console.log("In app controller");

   $http({
      url: '/dashboardSummary',
      method: 'GET'
    }).then(res => {
      console.log("DASHBOARD: ", res.data);

      // Proportion of each race affected
      flat = [];
      for (var i = 0; i < res.data.length; i++) {
        flat = flat.concat(res.data[i]);
      }
      new Chart(document.getElementById("pie-chart"), {
          type: 'pie',
          data: {
            labels: ['White', 'Hispanic', 'Black', 'Native', 'Asian', 'Pacific'],
            datasets: [{
              label: "Population",
              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
              data: flat
            }]
          },
          options: {
            title: {
              display: true,
              text: 'Percentage of Different Races Affected By Disasters'
            }
          }
      });
    }, err => {
      console.log("Dashboard ERROR: ", err);
    });


   // Top event types affecting people
   var showTopEvents = function() {
      $http({
        url: '/dashboardSummary/topEvents',
        method: 'GET'
      }).then(res => {
        $scope.topEvents = res.data;
        console.log(res.data);
      }, err => {
        console.log("topEvents ERROR ", err)
      })
    };
  showTopEvents();

  // Region with highest disaster occurences
  var showTopRegion = function () {
    $http({
      url: '/dashboardSummary/topRegion',
      method: 'GET'
    }).then(res => {
      $scope.topCounty = res.data[0][1].charAt(0).toUpperCase() + res.data[0][1].slice(1);
      $scope.topState = res.data[0][0].charAt(0).toUpperCase() + res.data[0][0].slice(1);
      $scope.topCount = res.data[0][2];
      console.log(res.data);
    }, err => {
      console.log("topRegion ERROR ", err)
    })
  };
  showTopRegion();

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
