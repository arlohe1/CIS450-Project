var app = angular.module('angularjsNodejsTutorial', []);

// Controller for the Dashboard Page
 app.controller('dashboardController', function($scope, $http) {
   console.log("In app controller");

   // Proportion of each race affected
   $http({
      url: '/dashboardSummary',
      method: 'GET'
    }).then(res => {
      console.log("DASHBOARD: ", res.data);

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

  // Map with number of Disasters
  $scope.showMap = function () {
    $http({
      url: '/dashboardSummary/map',
      method: 'GET'
    }).then(res => {

      console.log(res.data);

      // update statesData with query results
      var states1 = [];
      var states2 = [];
      for (i = 0; i < statesData.features.length; i++) {
        for (j = 0; j < res.data.length; j++) {
          var state = res.data[j][0];
          var count = res.data[j][1];

          if (statesData.features[i].id == state) {
            statesData.features[i].properties.density = count;
          }
        }
      }

      var mapboxAccessToken = 'pk.eyJ1IjoicmFjaGVsbHNtYWUiLCJhIjoiY2szdnJtdTMwMDFndzNybWphM3ZpMTN4MiJ9.HMczds7TOlaf86UaM4cp6g';
      var map = L.map('mapid').setView([37.8, -96], 4);

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
          id: 'mapbox/light-v9'
      }).addTo(map);

      function getColor(d) {
        return d > 2000 ? '#800026' :
               d > 1500  ? '#BD0026' :
               d > 1000  ? '#E31A1C' :
               d > 500  ? '#FC4E2A' :
               d > 250   ? '#FD8D3C' :
               d > 100   ? '#FEB24C' :
               d > 50   ? '#FED976' :
                          '#FFEDA0';
      }

      function style(feature) {
        return {
            fillColor: getColor(feature.properties.density),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>Number of Disasters</h4>' +  (props ?
            '<b>' + props.name + '</b><br />' + props.density + ' events'
            : 'Hover over a state');
    };

    info.addTo(map);


    }, err => {
      console.log("showMap ERROR", err);
    })
  };
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
