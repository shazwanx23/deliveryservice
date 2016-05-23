angular.module('customer_controllers', [])

// Start AppCtrl
.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS,AuthService) {
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
  $scope.logout = function(){
    AuthService.logout();
    $state.go('splash', {}, {reload: true});
  }

  $scope.user = AuthService.getUserCookie();
})
// End  AppCtrl


// Start  EditCustomerProfileCtrl
.controller('EditCustomerProfileCtrl', function($scope, $state,$ionicPopup,AuthService,CustomersModel) {
  var user = AuthService.getUserCookie();
  $scope.form = {};
  $scope.form.email = user.email;
  $scope.updateEmail = function(form){
    CustomersModel.update(user.id,form)
    .success(function(){
      console.log('email update success');
    });
  }
  $scope.updatePassword = function(passwordForm) {
    var error = false;
    var errorMessage = '';
    console.log(user.password);
    if(passwordForm.password !== user.password){
      error = true;
      errorMessage = 'Current Password does not match';
    }
    if(passwordForm.newPassword !== passwordForm.newPasswordAgain){
      error = true;
      errorMessage += '<br />New Password field does not match Password Again field';
    }
    if(error) {
      var alertPopup = $ionicPopup.alert({
        title: 'Password update failed!',
        template: errorMessage

      });
      
    };
    if(!error){
      user.password = passwordForm.newPassword;
      CustomersModel.update(user.id,user)
      .success(function(){
        var alertPopup = $ionicPopup.alert({
        title: 'Password update successful',
        template: errorMessage
        });
        passwordForm = {};
      });
    }
  }
})

.controller('BookCtrl', function($state,$scope,$ionicPopup,$cordovaGeolocation,
  $timeout, $ionicPlatform,$ionicModal,DriversModel,
  AuthService,BookingsModel,ionicTimePicker,VehiclesModel) {  

  $scope.form = {};
  // $scope.driversLocation = {};
  $scope.place = '';
    //Declare all states
  $scope.showBook = true;
  $scope.showSelectDrivers = true;
  
  //Declare functions to toggle between states
  $scope.reset = function(){
    $scope.showBook = true;
    $scope.showSelectDrivers = false;
  }
  // estimate how far driver is from customer's location
  // start maps
    $ionicPlatform.ready(function() {

    $cordovaGeolocation.getCurrentPosition({
      timeout:10000,
      enableHighAccuracy:true
    }).then(function(position) {
      $scope.getDrivers();
      // console.log(position);
      var latLng = new google.maps.LatLng(position.coords.latitude
                                         ,position.coords.longitude);
      
      $scope.latitude = position.coords.latitude;
      $scope.longitude = position.coords.longitude;
      $scope.form.pickup =  $scope.latitude + "," +$scope.longitude ;


      var mapOptions = {
        center: latLng,
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
 
        var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
        }); 
         // initAutocomplete
      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      $scope.map.addListener('bounds_changed', function() {
        searchBox.setBounds($scope.map.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        // $scope.form.destination = $scope.searchBox;
        $scope.place = places[0].formatted_address;
        console.log($scope.place[0].formatted_address);
        $scope.initMap();
        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);

        });
         var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
          });    
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        $scope.form.destination = places[places.length-1].name;
        places.forEach(function(place) {
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };
          
          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: $scope.map,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        $scope.map.fitBounds(bounds);
      });
      // end initAutocomplete
       
        var infoWindow = new google.maps.InfoWindow({
              content: "Here I am!"
          });
       
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open($scope.map, marker);
        });
      });
    //start distance
    $scope.initMap = function() {
        var bounds = new google.maps.LatLngBounds;
        var markersArray = [];

        var origin1 = {lat: $scope.latitude, lng: $scope.longitude}
        var destinationA = $scope.place;
         console.log($scope.driversLocation[0]);
         console.log(origin1);

        var destinationIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=D|FF0000|000000';
        var originIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=O|FFFF00|000000';

        var geocoder = new google.maps.Geocoder;

        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
          origins: [origin1],
          destinations: [destinationA],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, function(response, status) {
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
          } else {
            // console.log(response);
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;            
            $scope.form.destination_geocode = response.destinationAddresses[0];
            console.log($scope.form.destination_geocode);
            var showGeocodedAddressOnMap = function(asDestination) {
              var icon = asDestination ? destinationIcon : originIcon;
              return function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                  $scope.map.fitBounds(bounds.extend(results[0].geometry.location));
                  if(asDestination){
                      markersArray.push(new google.maps.Marker({
                      map: $scope.map,
                      position: results[0].geometry.location,
                      icon: icon
                    }));
                  }
                } else {
                  alert('Geocode was not successful due to: ' + status);
                }
              };
            };

            for (var i = 0; i < originList.length; i++) {
              var results = response.rows[i].elements;
              geocoder.geocode({'address': originList[i]},
                  showGeocodedAddressOnMap(false));
              for (var j = 0; j < results.length; j++) {
                geocoder.geocode({'address': destinationList[j]},
                    showGeocodedAddressOnMap(true));
                     console.log( originList[i] + ' to ' + destinationList[j] +
                                         ': ' + results[j].distance.text + ' in ' +
                                         results[j].duration.text + '<br>');
                $scope.form.distance = parseFloat(results[j].distance.text);
                console.log($scope.form.distance);
              }
            }
          }
        });
      }
        function deleteMarkers(markersArray) {
        for (var i = 0; i < markersArray.length; i++) {
          markersArray[i].setMap(null);
        }
        markersArray = [];
      }
      // $scope.initMap();
    //end distance
    }, function(error) {
        console.log(error);
    });
  })
  
  //end maps
  //start timepicker
    $scope.timeFromPicker = '';
    var ipObj1 = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is '
          , selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
        $scope.timeFromPicker = selectedTime.getUTCHours() + ":" 
        + selectedTime.getUTCMinutes();
        console.log($scope.timeFromPicker);
        $scope.form.timein = $scope.timeFromPicker;
      }
    },
    inputTime: 52200,   //Optional hours converted to number of seconds
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set2'    //Optional
  };

  $scope.showTimePicker = function(){
    ionicTimePicker.openTimePicker(ipObj1);  
    
  }
  //end timepicker
  //user presses select driver
  $scope.showDrivers = function(){
    $scope.showBook = false;
  }
  $scope.availableDrivers = {};
  $scope.getDrivers = function(){
    DriversModel.allDeep().success(function(response){
      data = response.data;      
    }).then(function(){
      $scope.drivers = data;            
    }).then(function(){
      $scope.getAvailableDrivers()
    })
  };
  $scope.counter = 0;
  $scope.driversLocation = {};
  $scope.getAvailableDrivers = function(){
    var j = 0;
    for(var i=0;i<$scope.drivers.length;i++){
      if($scope.drivers[i].availability){
        $scope.availableDrivers[j] = $scope.drivers[i];        
        var driverName = $scope.drivers[i].email.split('@');
        $scope.availableDrivers[j].username = driverName[0];
        j++;
      }
    }
    for(var k=0;k<j;k++){
      $scope.driversLocation[k] = {lat : parseFloat($scope.availableDrivers[k].latitude),
       lng : parseFloat($scope.availableDrivers[k].longitude)};
       //start get available drivers distance from customer
       $scope.distance = {};
       var bounds = new google.maps.LatLngBounds();
       var markersArray = [];
       var destinationIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=D|FF0000|000000';
        var originIcon = 'https://chart.googleapis.com/chart?' +
            'chst=d_map_pin_letter&chld=O|FFFF00|000000';
        var geocoder = new google.maps.Geocoder;
        var origin1 = $scope.driversLocation[k];
        var destinationA = { lat: $scope.latitude , lng: $scope.longitude };
        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
          origins: [origin1],
          destinations: [destinationA],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, function(response, status) {
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
          } else {
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;                        
            var showGeocodedAddressOnMap = function(asDestination) {
              var icon = asDestination ? destinationIcon : originIcon;
              return function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                  $scope.map.fitBounds(bounds.extend(results[0].geometry.location));
                  if(asDestination){
                      markersArray.push(new google.maps.Marker({
                      map: $scope.map,
                      position: results[0].geometry.location,
                      icon: icon
                    }));
                  }
                } else {
                  alert('Geocode was not successful due to: ' + status);
                }
              };
            };
            
            for (var i = 0; i < originList.length; i++) {
              var results = response.rows[i].elements;
              geocoder.geocode({'address': originList[i]},
                  showGeocodedAddressOnMap(false));
              for (var j = 0; j < results.length; j++) {
                geocoder.geocode({'address': destinationList[j]},
                    showGeocodedAddressOnMap(true));
                    $scope.availableDrivers[$scope.counter].distance = parseFloat(results[j].distance.text);
                     console.log($scope.availableDrivers[$scope.counter].distance);                     
                     $scope.counter++;
                     
              }
            }
          }
        });
    //end get available drivers distance from customer    
    }
    console.log($scope.driversLocation);


  }
  $scope.vehicle = {};
  $scope.bookingByDriver = {};
  $scope.rating_total = 0;
  $scope.counter = 0;
  $scope.driver_rating = 0;
  //start view driver's profile in modal
   $ionicModal.fromTemplateUrl('templates/customer/view_driver_modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modal) {
    $scope.modal = modal;
    });
     $scope.openModal = function(driver) {
      $scope.rating_total = 0;
      $scope.counter = 0;
      $scope.driver_rating = 0;
      console.log('show modal');
      $scope.modal.show();
      VehiclesModel.getVehicleByDriver(driver.id)
        .success(function(response){
          $scope.vehicle = response.data[0];
          console.log($scope.vehicle);
          $scope.driver = driver;
        })
        BookingsModel.getBookingsByDriver(driver.id)
          .success(function(response){
            $scope.bookingByDriver = response.data;             
            for(var i=0;i<$scope.bookingByDriver.length; i++){
              if($scope.bookingByDriver[i].driver_rating){
                $scope.rating_total += parseInt($scope.bookingByDriver[i].driver_rating);
                $scope.counter++;
              }
            } 
            console.log("Total : " + $scope.rating_total);  
            console.log("counter : " + $scope.counter);  
            $scope.driver_rating = ($scope.rating_total/$scope.counter);         
            $scope.driver_rating = $scope.driver_rating.toFixed(1);
            $scvope.driver.driver_rating = $scope.driver_rating;
            $scope.driver.completed = $scope.counter;
            if($scope.rating_total == 0){
              $scope.driver.driver_rating = 0;
            }
          })

    };
    $scope.closeModal = function() {
      $scope.modal.hide();
      console.log('hide modal');
    };
    //user checks one of the checkboxes
    $scope.calculate = function(driver_id){
      console.log('calculate price of booking');
      $scope.thisVehicle = {};
      VehiclesModel.getVehicleByDriver(driver_id)
        .success(function(response){
          $scope.thisVehicle = response.data[0];
          console.log($scope.thisVehicle);
          $scope.form.price = $scope.form.distance * $scope.thisVehicle.rate;
          $scope.form.rate = $scope.thisVehicle.rate;
        })
    }
    //end user checks
  //end view drivers profile
  // $scope.getDrivers();
  $scope.drivers = {};
  $scope.booking = {}; 
  $scope.createBooking = function(form){
    form.booking_status = "pending";
    var user = AuthService.getUserCookie();        
    console.log(user.id);
    form.customer = user.id;
    BookingsModel.create(form).success(function(){
      console.log("booking successful");
      $state.go('customer.booking_pending');
    }).then(function(){
      BookingsModel.getLatestBookingByCustomer(user.id)
        .then(function(response){
          $window.localStorage.setItem('booking', JSON.stringify( response.data.data[0] ));
          console.log(response.data.data[0]);
        })
    })
  }

})


.controller('EditBookCtrl', function($state,$ionicPopup,$window,$scope,BookingsModel,DriversModel) {  
    $scope.form = {};
    $scope.booking = function(){
      BookingsModel.getLatestBookingByCustomer(5).success(function(response){
        data = response.data;
        console.log(data[0]);
        $scope.form = data[0];
        $scope.form.timein = Number(data[0].timein);
      }).error(function(){
        console.log("get booking failed");
      })
    }

    $scope.getDrivers = function(){
      DriversModel.all().success(function(response){
        data = response.data;
      }).then(function(){
        $scope.drivers = data;      
      })
    }
    // $scope.getDrivers();
    $scope.booking();

    $scope.updateBooking = function(form){
       form.user_id = 5;
       console.log(form.id);
       console.log(form.pickup);
       console.log(form.destination);
       console.log(form.timein);
       BookingsModel.update(form.id,form).success(function(){
       console.log("Update successfull");
        var alertPopup = $ionicPopup.alert({
          title: 'Update Successful!',
          template: 'Waiting response for driver'
        });        
       $window.localStorage.setItem('booking_info', JSON.stringify( form ));

        })
       $state.go('customer.booking_pending');

    }

    // }
})

.controller('BookPendingCtrl', function($state,$scope,$timeout,$ionicPopup
  ,$window,BookingsModel,AuthService,Backand,CustomersModel) {  

  $scope.BookingIsPending = false;
  $scope.waiting = true;
  var customer = AuthService.getUserCookie();
  console.log(customer);
  $scope.newBooking = {};
  //open web socket to listen for booking update event
  Backand.on('items_updated', function (data) {
    //get the newly updated booking
    BookingsModel.getLatestBookingByCustomer(customer.id)
      .success(function(response){
        $scope.newBooking = response.data[0];
        console.log($scope.newBooking.booking_status);
        if($scope.newBooking.booking_status === 'accepted'){
          console.log('booking accepted');
          //redirect to booking accepted
          var alertPopup = $ionicPopup.alert({
            title: 'Booking Accepted!',
            template: 'Driver has accepted your booking.'
          });
          $state.go('customer.booking_accepted');
        }
        if($scope.newBooking.booking_status === 'rejected'){
          console.log('booking rejected');
          //redirect to select driver
          var alertPopup = $ionicPopup.alert({
            title: 'Booking Rejected!',
            template: 'The driver you selected in unable to take your request.Please select another driver'
          });
          $state.go('customer.select_driver');
        }
      })
  })   
  $scope.edit_booking = function(){    
    BookingsModel.getLatestBookingByCustomer(customer.id)
      .success(function(response){
        console.log('successful api call');
        var latestBooking = response.data;
        console.log(latestBooking[0].booking_status);
        if(latestBooking[0].booking_status === 'pending'){
          $state.go('customer.edit_book');
        }else{
          $ionicPopup.alert({
            title: 'Cannot Edit Book!',
            template: 'Status of your booking has changed'
          }); 
        }
      })
  }
 
  $scope.promptUser = function() {
       var confirmPopup = $ionicPopup.confirm({
         title: 'No response from selected driver.',
         template: 'Do you want to retry the same driver?' +
              '<small>Select Cancel if you want to select another driver.</small>'
       });

       confirmPopup.then(function(res) {
         if(res) {
          //user press OK
          //retyr same driver
          //refresh the page
           console.log('refreshing the page');
           //$state.go('customer.booking_pending', {}, {reload: true});
           $window.location.reload();
         } else {
          //user press cancel
          //redirect to select driver
           console.log('redirect to select driver');
           $state.go('customer.select_driver');
         }
       });
  };
  

   var userWait = $timeout(function(){
     // A confirm dialog
    //$scope.showConfirm();
    console.log('prompt user');
     $scope.promptUser();
  },5000)
  //start map
 
 $scope.init = function(){
  BookingsModel.getLatestBookingByCustomer(customer.id)
    .success(function(response){
      $scope.booking = response.data[0];
      $scope.initMap();
    })
 }
 $scope.init();
 $scope.initMap = function() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  var coordinate = $scope.booking.pickup;
  var coordinate_split = coordinate.split(",");
  coordinate_split[0] = parseFloat(coordinate_split[0]);
  coordinate_split[1] = parseFloat(coordinate_split[1]);  
  var map = new google.maps.Map(document.getElementById('map2'), {
    zoom: 7,
    center: {lat: coordinate_split[0], lng: coordinate_split[1]}
  });
  var geocoder = new google.maps.Geocoder();
  geocodeAddress(geocoder, map);
  directionsDisplay.setMap(map);
  $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);  

}

  $scope.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
    var coordinate = $scope.booking.pickup;
    var coordinate_split = coordinate.split(",");
    coordinate_split[0] = parseFloat(coordinate_split[0]);
    coordinate_split[1] = parseFloat(coordinate_split[1]);  
    directionsService.route({
      origin: {lat: coordinate_split[0], lng: coordinate_split[1]},
      destination: $scope.booking.destination_geocode,
      travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
  function geocodeAddress(geocoder, resultsMap) {
    console.log($scope.booking.destination)
    var address = $scope.booking.destination_geocode;
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        resultsMap.setCenter(results[0].geometry.location);
        console.log(results[0].geometry.location)
        var marker = new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location        
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }
  // initMap();
  //end map
})
.controller('SelectDriverCtrl', function($scope,$state,$ionicModal,$ionicPopup
  ,DriversModel, BookingsModel, AuthService,VehiclesModel) {  
  $scope.drivers = {};
  $scope.availableDrivers = {};
  var j=0;
  DriversModel.all()
    .success(function(response){
      $scope.drivers = response.data;
      for(var i=0; i<$scope.drivers.length; i++){
        if($scope.drivers[i].availability){
          $scope.availableDrivers[j] = $scope.drivers[i];
          var driverName = $scope.drivers[i].email.split('@');
          $scope.availableDrivers[j].username = driverName[0];
          j++;
        }
      }
    })
    $ionicModal.fromTemplateUrl('templates/customer/view_driver_modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
    }).then(function(modal) {
    $scope.modal = modal;
    });
     $scope.openModal = function(driver) {
      console.log('show modal');
      $scope.modal.show();
      VehiclesModel.getVehicleByDriver(driver.id)
        .success(function(response){
          $scope.vehicle = response.data[0];
          console.log($scope.vehicle);
          $scope.driver = driver;
        })
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
      console.log('hide modal');
    };
    $scope.booking = {};
  var customer = AuthService.getUserCookie();
  BookingsModel.getLatestBookingByCustomer(customer.id)
    .success(function(response){
      $scope.booking = response.data[0];
    })
    $scope.updateBooking = function(driver_id){
      $scope.booking.driver = driver_id;
      $scope.booking.booking_status = 'pending';
      BookingsModel.update($scope.booking.id,$scope.booking)
        .success(function(){
          console.log('Booking is updated');
          var alertPopup = $ionicPopup.alert({
            title: 'Booking Updated!',
            template: 'You have selected another driver.'
          });
          $state.go('customer.booking_pending');
        })
    }

})
.controller('CustomerBookingAcceptedCtrl', function($state,$scope
  ,$ionicPopup,Backand,BookingsModel,AuthService,Backand,CustomersModel, DriversModel) {  
  var customer = AuthService.getUserCookie();
  $scope.booking = {};
  $scope.driver = {};
  BookingsModel.getLatestBookingByCustomer(customer.id)
    .success(function(response){
      $scope.booking = response.data[0];
    }).then(function(){
      DriversModel.fetch($scope.booking.driver)
        .success(function(response){
          console.log(response);
            $scope.driver = response;
        })
    })
    $scope.book = {};
    //listen for driver to complete booking
    Backand.on('items_updated', function(){
      BookingsModel.getLatestBookingByCustomer(customer.id)
        .success(function(response){
            $scope.book = response.data[0];
            console.log($scope.book);
            if($scope.book.booking_status == 'completed'){
              //redirect to make payment
              console.log('booking completed!');
              var alertPopup = $ionicPopup.alert({
                title: 'Booking Completed!',
                template: 'Please pay'
              });
              $state.go('customer.pay');
            }
            if($scope.book.booking_status == 'paid'){
              //redirect to make payment
              console.log('Paid!');
              var alertPopup = $ionicPopup.alert({
                title: 'Payment Received!',
                template: 'Thank you.'
              });
              $state.go('customer.rate_driver');
            }
        })
    })
  })
.controller('CustomerPayCtrl', function($scope, $state, $ionicPopup
  ,$window,BookingsModel,DriversModel,AuthService,BackandService,Backand) {
  $scope.booking = {};
  var customer = AuthService.getUserCookie();
  console.log('in customer pay controller');
  Backand.on('items_updated',function(){
    BookingsModel.getLatestBookingByCustomer(customer.id)
    .success(function(response){
      $scope.booking = response.data[0];
      console.log($scope.booking);
      if($scope.booking.booking_status == 'paid'){
        var alertPopup = $ionicPopup.alert({
            title: 'Payment Confirmed!',
            template: 'Thank you.'
          });
          $state.go('customer.rate_driver');
      }
    })
  })
  //start paypal
  $scope.charge = function () {
    self.error = "";
    self.success = "";
    console.log('button clicked');
    //get the form's data
    // var form = angular.element(document.querySelector('#paypal-form'))[0];

    //Call Backand action to prepare the payment
    BookingsModel.getLatestBookingByCustomer(customer.id)
    .success(function(response){
      $scope.booking = response.data[0]
    }).then(function(){
      var paypalUrl = BackandService.makePayPalPayment($scope.booking.price)          
      .then(function (payment) {
        var paypalResponse = payment;
        // console.log(paypalResponse);
        //redirect to PayPal - for user approval of the payment
        $window.location.href = paypalResponse.data;
        $scope.booking.booking_status = 'paid_paypal';
        BookingsModel.update($scope.booking.id,$scope.booking)
          .success(function(){
            console.log('booking paid!');
          })
      })
      .catch(function (err) {
        if (err.type) {
          self.error = 'PayPal error: ' + err.message;
        } else {
          self.error = 'Other error occurred, possibly with your API' + err.message;
        }
      });
    })
    
  }
  //end paypal
})
.controller('RateDriverCtrl', function($scope, $state, $ionicPopup,$location
  ,BookingsModel,DriversModel,AuthService, ratingConfig,BackandService) {
  $scope.driver = {};
  $scope.booking = {};
  $scope.rating = {};
  $scope.rating.rate = 3;
  $scope.rating.max = 5;
  $scope.customer = AuthService.getUserCookie();
  var alertPopup = $ionicPopup.alert({
      title: 'Payment Received!',
      template: 'Thank you for paying'
    });
  if ($location.search().PayerID && $location.search().paymentId) {
        // console.log($location.search().PayerID );
        // console.log($location.search().paymentId);
        //Call Backand action to approve the payment by the facilitator
        BackandService.makePayPalApproval($location.search().PayerID, $location.search().paymentId)
          .then(function (payment) {
            // remove PayPal query string from url
            $location.url($location.path());
            self.success = 'successfully submitted payment for $' 
            + payment.data.transactions[0].amount.total;
          }
        )
    }
  $scope.getData = function(){
    BookingsModel.getLatestBookingByCustomer($scope.customer.id)
      .success(function(response){
        $scope.booking = response.data[0];
        console.log($scope.booking.driver);
        DriversModel.fetch($scope.booking.driver)
          .success(function(response){
            $scope.driver = response;
            console.log($scope.driver);
          })
      })
  }
  $scope.rateDriver = function(rating){
    $scope.booking.driver_rating = rating;
    BookingsModel.update($scope.booking.id,$scope.booking)
    .success(function(){
      console.log('Rating inserted');
      var alertPopup = $ionicPopup.alert({
        title: 'Rating inserted!',
        template: 'Thank you for using this service.'
      });
      $state.go('customer.book');
    })
  }
  $scope.getData();
})
.controller('PayPalTestCtrl', function($scope,$window,BackandService) {
  
  $scope.charge = function () {
    self.error = "";
    self.success = "";
    console.log('button clicked');
    //get the form's data
    // var form = angular.element(document.querySelector('#paypal-form'))[0];

    //Call Backand action to prepare the payment
    var paypalUrl = BackandService.makePayPalPayment(12)          
      .then(function (payment) {
        var paypalResponse = payment;
        console.log(paypalResponse);
        //redirect to PayPal - for user approval of the payment
        $window.location.href = paypalResponse.data;
      })
      .catch(function (err) {
        if (err.type) {
          self.error = 'PayPal error: ' + err.message;
        } else {
          self.error = 'Other error occurred, possibly with your API' + err.message;
        }
      });
  }
})
.controller('PayPalSuccessCtrl', function($scope,$window,$location,BackandService) {
  
})
