var app = angular.module('angularjsNodejsTutorial', []);
var mapboxAccessToken = 'pk.eyJ1IjoicmFjaGVsbHNtYWUiLCJhIjoiY2szdnJtdTMwMDFndzNybWphM3ZpMTN4MiJ9.HMczds7TOlaf86UaM4cp6g';

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

     // create map
     var map = L.map('mapid').setView([37.8, -96], 3.45);

     L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
         id: 'mapbox/light-v9'
     }).addTo(map);

     function setColor(a) {
       if (a > 2000) {
         return '#800026';
       }
       else if (a > 1500) {
         return '#BD0026';
       }
       else if (a > 1000) {
         return '#E31A1C';
       }
       else if (a > 500) {
         return '#FC4E2A';
       }
       else if (a > 250) {
         return  '#FEB24C';
       }
       else if (a > 100) {
         return '#FEB24C';
       }
       else {
         return '#FFEDA0';
       }
     }

     function style(feature) {
       return {
           fillColor: setColor(feature.properties.density),
           weight: 2,
           opacity: 1,
           color: 'white',
           dashArray: '3',
           fillOpacity: 0.75
       };
   }

   function onEachState(state, layer) {
     layer.on({
       mouseover: function (s) {
          var layer = s.target;
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
      },

       mouseout: function (s) {
            geojson.resetStyle(s.target);
            info.update();
      },

       click: function (s) {
         map.fitBounds(s.target.getBounds());
       }
     });
   }

   geojson = L.geoJson(statesData, {
       style: style,
       onEachFeature: onEachState
   }).addTo(map);

   var info = L.control();
   info.onAdd = function (map) {
       this._div = L.DomUtil.create('div', 'info');
       this.update();
       return this._div;
   };

   info.update = function (state) {
       this._div.innerHTML = '<h6>Number of Disasters By State</h6>' +
       (state ? '<b>' + state.name + '</b><br />' + state.density + ' events'
           : 'Hover over one for more info!');
   };

   info.addTo(map);

   }, err => {
     console.log("showMap ERROR", err);
   })
 };
});


// Controller for the Search Page
app.controller('searchController', function($scope, $http) {
  $http({
    url: '/filters',
    method: 'GET'
  }).then(res => {
    console.log("Filters: ", res.data);
    res.data.unshift(["all events"])
    $scope.eventTypes = res.data;
    console.log("all added, ", $scope.eventTypes);
  }, err => {
    console.log("Filters ERROR: ", err);
  });

  var months = ["All", "January", "February", "March", "April", "May", "June", "July"];
  var sortCategories = ["Begin Date", "Total Injuries", "Total Deaths", "Total Damages"];

  $scope.months = months;
  $scope.sortCategories = sortCategories;

  $scope.submitEventType = function() {
    console.log("selected event: ", $scope.selectedEventType);
    console.log("selected month: ", $scope.selectedMonth);
    console.log("selected sort category", $scope.selectedCategory);
    $http({
      url: '/filters/' + $scope.selectedEventType + '/' + $scope.selectedMonth + '/' + $scope.selectedCategory,
      method: 'GET'
    }).then(res => {
      console.log("Selected in this event type " + $scope.selectedEventType, res.data);
      $scope.weatherEvents = res.data;
    }, err => {
      console.log("weather events ERROR: ", err);
    });

  }
});


app.controller('countyController', function($scope, $http) {
  console.log('outside in app.js');
  $http({
    url: '/countyQuery',
    method: 'GET'
  }).then(res => {
    console.log("STATES: ", res.data);
    $scope.states = res.data;
  }, err => {
    console.log("STATES ERROR: ", err);
  });

  $scope.selectedStateChanged = function(){
    console.log("Selected state: ", $scope.selectedState[0]);
    $http({
      url: '/countyQuery/' + $scope.selectedState[0],
      method: 'GET'
    }).then(res => {
      console.log("COUNTIES: ", res.data);
      $scope.counties = res.data;
    }, err => {
      console.log("COUNTIES ERROR: ", err);
    });
  }

    $scope.submitCounty = function() {
      if ($scope.selectedState != null && $scope.selectedCounty != null){
        $http({
          url: '/county/' + $scope.selectedState + '/' + $scope.selectedCounty[1],
          method: 'GET',
          responseType: 'text'
        }).then(res => {
          console.log("DESC in county: ", res.data);
          $scope.countyData = res.data;
        }, err => {
          console.log("County ERROR: ", err);
        });
      }
      else if ($scope.selectedState != null){ //else just state
        $http({
          url: '/county/' + $scope.selectedState,
          method: 'GET',
          responseType: 'text'
        }).then(res => {
          console.log("DESC in county: ", res.data);
          $scope.countyData = res.data;
        }, err => {
          console.log("County ERROR: ", err);
        });
      }
    }
});


// Controller for the Census Page
app.controller('censusController', function($scope, $http) {
   $http({
    url: '/censusEvents',
    method: 'GET'
  }).then(res => {

    for (i = 0; i < res.data.length; i++) {
      res.data[i] = res.data[i].toString().replace("/", " or ");
    }

    $scope.event_types = res.data;
    console.log(res.data);
  }, err => {
    console.log("Census ERROR: ", err);
  });

  $scope.showEvents = function() {
    $http({
        url: '/censusEvents/' + $scope.selectedEventType.toString().replace(/\//g, '%20'),
        method: 'GET'
    }).then(res => {
      $scope.events = res.data;
    }, err => {
      console.log("CENSUS ERROR: ", err);
    });
  }
});

// Controller for the Episode Details Page
app.controller('episodeController', function($scope, $location, $http, ) {
  var queryParams = $location.search();
  $http({
    url: '/episodeEvents?ep_id=' + queryParams.ep_id,
    method: 'GET'
  }).then(res => {
    $scope.episodeID = queryParams.ep_id;
    $scope.episodeEvents = res.data;
  }, err => {
    console.log("episodeController ERROR: ", err);
  });

  $http({
    url: '/episodeNarrative?ep_id=' + queryParams.ep_id,
    method: 'GET'
  }).then(res => {
    $scope.episodeNarrative = res.data;
  }, err => {
    console.log("episodeController ERROR: ", err);
  });
});


// Controller for the Event Details Page
app.controller('eventController', function($scope, $location, $http, ) {
  var queryParams = $location.search();
  $http({
    url: '/eventDetails?event_id=' + queryParams.event_id,
    method: 'GET'
  }).then(res => {
    $scope.eventID = queryParams.event_id;
    $scope.events = res.data;
  }, err => {
    console.log("eventController ERROR: ", err);
  });

  $http({
    url: '/eventState?event_id=' + queryParams.event_id,
    method: 'GET'
  }).then(res => {
    let eventState = res.data[0][0];
    if(["north dakota", "south dakota", "minnesota", "michigan", "ohio", "illinois", "nebraska", "missouri", "indiana", "iowa"].includes(eventState)) {
      // Midwest
      $scope.eventRegion = "midwest";
    } else if(["kentucky", "georgia", "louisiana", "florida", "alabama", "mississippi", "arkansas", "south carolina", "north carolina", "west virginia"].includes(eventState)) {
      // South
      $scope.eventRegion = "south";
    } else if(["colorado", "wyoming", "montana", "idaho", "utah", "nevada"].includes(eventState)) {
      // Mountain
      $scope.eventRegion = "mountain";
    } else if(["california", "oregon", "washington"].includes(eventState)) {
      // Pacific
      $scope.eventRegion = "pacific";
    } else if(["maine", "new hampshire", "vermont", "massachusetts", "rhode island", "connecticut"].includes(eventState)) {
      // New England
      $scope.eventRegion = "new-england";
    } else if(["pennsylvania", "new jersey", "new york", "delaware", "maryland", "virginia"].includes(eventState)) {
      // Northeast
      $scope.eventRegion = "northeast";
    } else if(["arizona", "new mexico", "oklahoma", "texas"].includes(eventState)) {
      // Southwest
      $scope.eventRegion = "southwest";
    }
  }, err => {
    console.log("eventController ERROR: ", err);
  });

  $http({
    url: '/eventNarrative?event_id=' + queryParams.event_id,
    method: 'GET'
  }).then(res => {
    $scope.eventNarrative = res.data;
  }, err => {
    console.log("eventController ERROR: ", err);
  });

});
