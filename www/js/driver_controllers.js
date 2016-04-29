angular.module('driver_controllers', [])


.controller('DriverAppCtrl', function($scope, $state,$cookies,DriversModel,AuthService) {
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


.controller('DriverCtrl', function($scope, $state,$cookies,BookingsModel,$routeParams,BookingsModel) {
  $scope.showBookings = true;
  $scope.showOneBooking = false;
  $scope.showBookingAccepted = false;
  $scope.showBookingRejected = false;
  $scope.bookings = {};
  $scope.book = {};
  BookingsModel.all().success(function(response){
    $scope.bookings = response.data;  
  })
  $scope.viewOneBooking = function(booking_id){
    $scope.showBookings = false;
    $scope.showOneBooking = true;
    $scope.showBookingAccepted = false;
    $scope.showBookingRejected = false;
    BookingsModel.fetch(booking_id)
    .success(function(response){
      $scope.book = response;
      console.log($scope.book);
    })
  }
  $scope.acceptBooking = function(){
    console.log($scope.book.id);
    $scope.book.booking_status = 'accepted';
    BookingsModel.update($scope.book.id,$scope.book)
    .success(function(){
      console.log('booking accepted');
      $scope.showBookings = false;
      $scope.showOneBooking = false;
      $scope.showBookingAccepted = true;
      $scope.showBookingRejected = false;
    })
  }
  $scope.rejectBooking = function(){
    console.log($scope.book.id);
    $scope.book.booking_status = 'rejected';
    BookingsModel.update($scope.book.id,$scope.book)
    .success(function(){
      console.log('booking accepted');
      $scope.showBookings = false;
      $scope.showOneBooking = false;
      $scope.showBookingAccepted = false;
      $scope.showBookingRejected = true;
    })
  }
  $scope.reset = function(){
    $scope.showBookings = true;
  $scope.showOneBooking = false;
  $scope.showBookingAccepted = false;
  $scope.showBookingRejected = false;
  }
  $scope.reset();


  
})
.controller('ViewBookCtrl', function($scope, $state,$cookies,BookingsModel,$routeParams,BookingsModel) {
  
  $scope.bookings = {};
  BookingsModel.all()
  .success(function(response){
    $scope.bookings = response.data;
  })
  $scope.doSomething = function(){
    console.log('do doSomething');
  }

  $scope.book = {};
  $scope.showOneBooking = function(){
    BookingsModel.fetch(21).success(function(response){
      data = response;
      console.log(data);
    }).then(function(){
      $scope.book = data;
    })
  }  
  $scope.showOneBooking();
  $scope.acceptBooking = function(form){
    form.booking_status = "accepted";
    BookingsModel.update(21,form).success(function(){
      console.log("booking accepted");
      $state.go('driver.booking_accepted');
    })
  }
  $scope.rejectBooking = function(form){
    form.booking_status = "rejected";
    BookingsModel.update(21,form).success(function(){
      console.log("booking rejected");
      $state.go('driver.booking_rejected');
    })
  }
})



