angular.module('customer_controllers', [])

// Start AppCtrl
.controller('AppCtrl', function($scope, $state,$cookies, $ionicPopup, AuthService, AUTH_EVENTS,AuthService) {
  $scope.uid = $cookies.get('user_id');;  
 
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

.controller('BookCtrl', function($state,$scope,$cookies,DriversModel,AuthService,BookingsModel,ionicTimePicker) {  
  //start timepicker
    var ipObj1 = {
    callback: function (val) {      //Mandatory
      if (typeof (val) === 'undefined') {
        console.log('Time not selected');
      } else {
        var selectedTime = new Date(val * 1000);
        console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
      }
    },
    inputTime: 52200,   //Optional hours converted to number of seconds
    format: 12,         //Optional
    step: 15,           //Optional
    setLabel: 'Set2'    //Optional
  };

  ionicTimePicker.openTimePicker(ipObj1);
  //end timepicker
  $scope.availableDrivers = {};
  $scope.getDrivers = function(){
    DriversModel.all().success(function(response){
      data = response.data;
    }).then(function(){
      $scope.drivers = data;      
    }).then(function(){
      $scope.getAvailableDrivers();
      console.log($scope.availableDrivers);
    })
  };
  $scope.getAvailableDrivers = function(){
    var j = 0;
    for(var i=0;i<$scope.drivers.length;i++){
      if($scope.drivers[i].availability){
        $scope.availableDrivers[j] = $scope.drivers[i]
        j++;
      }
    }
  }
  $scope.getDrivers();
  $scope.drivers = {};
  $scope.booking = {}; 
  $scope.createBooking = function(form){
    form.booking_status = "pending";
    var user = AuthService.getUserCookie();        
    console.log(user.id);
    form.customer = user.id;
    BookingsModel.create(form).success(function(){
      console.log("booking successful");
      $cookies.putObject('booking_info',form);
      var a = $cookies.getObject('booking_info');
      console.log(a.pickup);
      $state.go('customer.booking_pending');
    })
  }
})


.controller('EditBookCtrl', function($state,$ionicPopup,$cookies,$scope,BookingsModel,DriversModel) {  
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
    $scope.getDrivers();
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
       $cookies.putObject('booking_info',form);
        })
       $state.go('customer.booking_pending');

    }

    // }
})

.controller('BookPendingCtrl', function($state,$cookies,$q,$scope,$timeout,$ionicPopup,$interval,BookingsModel,AuthService) {  
  $scope.BookingIsPending = false;
  $scope.edit_booking = function(){
    var customer = AuthService.getUserCookie();
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
  //Check booking status for driver's response every 5 seconds
  //prompt user after one minute
  $scope.checkBookingStatus = function(){
    $scope.i = 0;
    $scope.booking = {};
    $scope.booking_status = 'pending';
    $scope.status_changed = false;
    var doPopup = function(){
      $ionicPopup.alert({
        title: 'Driver Accepted!',
        template: 'Driver is on the way!'
      }); 
    }

    
    var startCheckStatus = $interval(function(){
       console.log($scope.i);
       $scope.i++;
      var customer = AuthService.getUserCookie();
      BookingsModel.getLatestBookingByCustomer(customer.id)
      .success(function(response){
        $scope.booking = response.data[0];
         console.log($scope.booking.booking_status);    
         console.log($scope.booking.id);    
        if($scope.booking.booking_status === 'accepted'){
          // $interval.cancel(startCheckStatus);
          $scope.status_changed = true;
          if($scope.status_changed){
            doPopup();
          }
          
        }else if($scope.booking.booking_status === 'rejected'){
          $scope.status_changed = true;
          $ionicPopup.alert({
            title: 'Driver rejected',
            template: 'The driver you selected has rejected. Please select another driver.'
          }); 
          $state.go('customer.edit_book');
        }
      })
    },1000,5)
    .then(function(){
      console.log('sekarang i = ' + $scope.i);
      console.log('retry atau select another');
      console.log($scope.booking.booking_status);    
      //retry booking 

      //select another driver
        
    })
    
  }

  $scope.checkBookingStatus();
})

.controller('RateDriverCtrl', function($scope, $state, $ionicPopup,BookingsModel,DriversModel,AuthService, ratingConfig) {
  $scope.driver = {};
  $scope.booking = {};
  $scope.rating = {};
  $scope.rating.rate = 3;
  $scope.rating.max = 5;
  $scope.customer = AuthService.getUserCookie();
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
    })
  }
  $scope.getData();
})