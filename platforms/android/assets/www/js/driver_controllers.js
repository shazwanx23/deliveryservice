angular.module('driver_controllers', [])


.controller('DriverAppCtrl', function($scope, $state,DriversModel,AuthService) {
  $scope.driver = {};
  $scope.toggleAvailability = function(form){
    var driver = AuthService.getUserCookie();
    driver.availability = form.availability;
    console.log(driver.availability);
    DriversModel.update(driver.id,driver)
    .success(function(){
      console.log('status change success');
    });
  }
  $scope.logout = function(){
    AuthService.logout();
    $state.go('splash', {}, {reload: true});
  }
})


.controller('EditDriverProfileCtrl', function($scope, $state,$ionicPopup,AuthService,DriversModel) {
  var user = AuthService.getUserCookie();
  $scope.form = {};
  $scope.form.email = user.email;
  $scope.updateEmail = function(form){
    DriversModel.update(user.id,form)
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
      DriversModel.update(user.id,user)
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
.controller('RateCustomerCtrl', function($scope, $state, $ionicPopup,BookingsModel,CustomersModel,AuthService, ratingConfig) {
  $scope.customer = {};
  $scope.booking = {};
  $scope.rating = {};
  $scope.rating.rate = 3;
  $scope.rating.max = 5;
  $scope.driver = AuthService.getUserCookie();
  $scope.getData = function(){
    BookingsModel.getLatestBookingByDriver($scope.driver.id)
      .success(function(response){
        $scope.booking = response.data[0];
        console.log($scope.booking.driver);
        CustomersModel.fetch($scope.booking.customer)
          .success(function(response){
            $scope.customer = response;
            console.log($scope.customer);
          })
      })
  }
  $scope.rateCustomer = function(rating){
    $scope.booking.customer_rating = rating;
    BookingsModel.update($scope.booking.id,$scope.booking)
    .success(function(){
      console.log('Rating inserted');
      var alertPopup = $ionicPopup.alert({
        title: 'Rating inserted!',
        template: 'Thank you for using this service.'

      });
    })
  }
  $scope.getData();
})


.controller('DriverCtrl', function($scope,$ionicPopup, $state,$window,BookingsModel
  ,Backand,$window,BookingsModel,AuthService) {
  var driver = AuthService.getUserCookie();
  var getBookings = function(){
    BookingsModel.getBookingsByDriver(driver.id)
    .success(function(response){
      $scope.bookings = response.data;
      for(var i=0;i<$scope.bookings.length;i++){
        if($scope.bookings[i].booking_status === 'pending'){
          $scope.pendingBookings[j]  = $scope.bookings[i];
          j++;
        }        
      }
    })
  }
  getBookings();
  $scope.showBookings = true;
  $scope.showOneBooking = false;
  $scope.showBookingAccepted = false;
  $scope.showBookingRejected = false;
  $scope.bookings = {};
  $scope.book = {};
  $scope.pendingBookings = {};
  var j = 0;
  
  //listen for database update
  //if database is updated, get bookings and refresh page
  Backand.on('new_record',function(){
    getBookings();
    $window.location.reload();
  });
  Backand.on('items_updated',function(){
    getBookings();
    $window.location.reload();
  });
  
  $scope.viewOneBooking = function(booking){
    $scope.showBookings = false;
    $scope.showOneBooking = true;
    $scope.showBookingAccepted = false;
    $scope.showBookingRejected = false;
    $scope.book = booking;
    $scope.initMap();
  }
  $scope.acceptBooking = function(){
    console.log($scope.book.id);
    
    $scope.book.booking_status = 'accepted';
    $window.localStorage.setItem('booking', JSON.stringify($scope.book));
    BookingsModel.update($scope.book.id,$scope.book)
    .success(function(){
      console.log('booking accepted');            
      $state.go('driver.booking_accepted');

    })
  }
  $scope.rejectBooking = function(){
    console.log($scope.book.id);
    $scope.book.booking_status = 'rejected';
    BookingsModel.update($scope.book.id,$scope.book)
    .success(function(){
      console.log('rejected');
      $scope.showBookings = false;
      $scope.showOneBooking = false;
      $scope.showBookingAccepted = false;
      $scope.showBookingRejected = true;
      var alertPopup = $ionicPopup.alert({
        title: 'Booking Rejected',
        template: 'You have rejected this customer\'s booking'
      });
    }).then(function(){
      $scope.reset();
    })
  }
  $scope.reset = function(){
    $scope.showBookings = true;
  $scope.showOneBooking = false;
  $scope.showBookingAccepted = false;
  $scope.showBookingRejected = false;
  }
  $scope.reset();
  $scope.initMap = function() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var coordinate = $scope.book.pickup;
    var coordinate_split = coordinate.split(",");
    coordinate_split[0] = parseFloat(coordinate_split[0]);
    coordinate_split[1] = parseFloat(coordinate_split[1]);  
    var map = new google.maps.Map(document.getElementById('map3'), {
      zoom: 7,
      center: {lat: coordinate_split[0], lng: coordinate_split[1]}
    });
    var geocoder = new google.maps.Geocoder();
    geocodeAddress(geocoder, map);
    directionsDisplay.setMap(map);
    $scope.calculateAndDisplayRoute(directionsService, directionsDisplay);  
}

$scope.calculateAndDisplayRoute = function(directionsService, directionsDisplay) {
  var coordinate = $scope.book.pickup;
  var coordinate_split = coordinate.split(",");
  coordinate_split[0] = parseFloat(coordinate_split[0]);
  coordinate_split[1] = parseFloat(coordinate_split[1]);  
  directionsService.route({
    origin: {lat: coordinate_split[0], lng: coordinate_split[1]},
    destination: $scope.book.destination_geocode,
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
  console.log($scope.book.destination)
  var address = $scope.book.destination_geocode;
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

  
})
.controller('BookingAcceptedCtrl', function($scope, $state,$ionicPopup,$window,BookingsModel,$routeParams
  ,$timeout,BookingsModel) {
  $scope.booking = {};
  $scope.booking = JSON.parse($window.localStorage.getItem('booking'));

  console.log($scope.booking);

  $scope.bookingComplete = function(){
    $scope.booking.booking_status = "completed"
    BookingsModel.update($scope.booking.id,$scope.booking)
      .success(function(){
        console.log('booking completed');
        $state.go('driver.paid');
        var alertPopup = $ionicPopup.alert({
          title: 'Booking Completed',
          template: 'Wait for Customer to pay.'
        });
        
      })
  }
 $scope.initMap = function() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var coordinate = $scope.booking.pickup;
    var coordinate_split = coordinate.split(",");
    coordinate_split[0] = parseFloat(coordinate_split[0]);
    coordinate_split[1] = parseFloat(coordinate_split[1]);  
    var map = new google.maps.Map(document.getElementById('map4'), {
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
  $timeout(function(){
    $scope.initMap();
  },2000)
  
})
.controller('PaidCtrl', function($scope, $state,$ionicPopup,$window,Backand,BookingsModel){
  $scope.booking = {};
  
  $scope.booking = JSON.parse($window.localStorage.getItem('booking'));
  //listen for database change
  console.log($scope.booking);
  Backand.on('items_updated',function(){
    BookingsModel.fetch($scope.booking.id)
      .success(function(response){
        $scope.booking = response;
        if($scope.booking.booking_status == 'paid_paypal'){
          console.log('customer has paid');
          var alertPopup = $ionicPopup.alert({
            title: 'Customer Paid!',
            template: 'Customer has paid.'

          });
          $state.go('driver.driver_test');
        }
      })
  })
  $scope.bookingPaid = function(){
    $scope.booking.booking_status = "paid";
    console.log($scope.booking);
    BookingsModel.update($scope.booking.id,$scope.booking)
    .success(function(){
        if($scope.booking.booking_status === 'paid'){
          console.log('customer has paid');
          var alertPopup = $ionicPopup.alert({
            title: 'Customer Paid!',
            template: 'Customer has paid.'

          });
          $state.go('driver.driver_test');
        }
      })
  }
})
.controller('ViewLocationCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, AuthService,
 DriversModel,$ionicPopup){
  
  $ionicPlatform.ready(function() {

    $cordovaGeolocation.getCurrentPosition({
      timeout:10000,
      enableHighAccuracy:true
    }).then(function(position) {

      console.log(position);
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log('latitude: ' + position.coords.latitude);
      console.log('longitude: ' + position.coords.longitude);
      $scope.latitude = position.coords.latitude;
      $scope.longitude = position.coords.longitude;

      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
 
        var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
        });      
       
        var infoWindow = new google.maps.InfoWindow({
              content: "Here I am!"
          });
       
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open($scope.map, marker);
        });
      });

    
    }, function(error) {

            console.log(error);

    });
  })
  $scope.updateLocation = function(){
    console.log('latitude: ' + $scope.latitude);
    console.log('longitude: ' + $scope.longitude);
    var user = AuthService.getUserCookie();
    user.latitude = $scope.latitude;
    user.logitude = $scope.longitude;
    DriversModel.update(user.id,user)
      .success(function(){
          var alertPopup = $ionicPopup.alert({
          title: 'Location Update Success!',
          template: "Your new location can be seen by customers."
        });
      })
  }  
})

.controller('EditVehicleCtrl', function($scope, $cordovaGeolocation, $ionicPlatform, AuthService,
                                         DriversModel,$ionicPopup,VehiclesModel){
  $scope.showInfo = true;
  var driver = AuthService.getUserCookie();
  $scope.vehicle = {};
  VehiclesModel.getVehicleByDriver(driver.id)
    .success(function(response){
      $scope.vehicle = response.data[0];
      console.log($scope.vehicle);
      if(!$scope.vehicle){
        //if driver has no associated vehicle, a vehicle record will be created
        var vehicle = {};
        vehicle.brand = '';
        vehicle.model = '';
        vehicle.driver = driver.id;
        VehiclesModel.create(vehicle)
          .success(function(){
             console.log('vehicle created for driver');
             //call the newly created vehicle
             VehiclesModel.getVehicleByDriver(driver.id)
                .success(function(response){
              $scope.vehicle = response.data[0];
            })
          })
      }else{
        //driver already has an associated vehicle and 
        //the vehicle information is already in $scope.vehicle
      }
      
    })
  $scope.showEditVehicle = function(){
    $scope.showInfo = !$scope.showInfo;
    $scope.form = $scope.vehicle;
  }
  $scope.editVehicle = function(form){
    form.id = $scope.vehicle.id;

    console.log(form);
    VehiclesModel.update(form.id,form)
      .success(function(){
        console.log('vehicle info updated')
        $scope.vehicle.brand = form.brand;
        $scope.vehicle.model = form.model;
        $scope.vehicle.rate = form.rate;
        $scope.showEditVehicle();
      })
  }
})