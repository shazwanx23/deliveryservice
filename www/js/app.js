// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'backand', 'SimpleRESTIonic.controllers', 'SimpleRESTIonic.services','AuthService','ngCookies','ngRoute'])

.config(function (BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider, USER_ROLES) {
    // change here to your appName
    BackandProvider.setAppName('mynewapp12345');

    BackandProvider.setSignUpToken('50b1e4de-d13d-400b-b0fa-276cba78f455');

    // token is for anonymous login. see http://docs.backand.com/en/latest/apidocs/security/index.html#anonymous-access
    BackandProvider.setAnonymousToken('89b4f6ec-d75e-41b4-b7e7-58e149dbfb85');

    //ionic routers
     $urlRouterProvider.otherwise('/')

      $stateProvider.state('home', {
      url: '/register',
      templateUrl: 'templates/register_customer.html'
      })
      $stateProvider.state('splash', {
      url: '/splash',
      templateUrl: 'templates/splash.html'
      })
      //Login states
      $stateProvider.state('login', {
      url: '/',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
      })
      $stateProvider.state('login_driver', {
      url: '/login_driver',
      templateUrl: 'templates/login_driver.html',
      controller: 'LoginCtrl'
      })
      $stateProvider.state('login_admin', {
      url: '/login_admin',
      templateUrl: 'templates/login_admin.html',
      controller: 'LoginCtrl'
      })
      //Booking customer states
      $stateProvider.state('book', {
      url: '/book',
      templateUrl: 'templates/test_book.html',      
      controller: 'BookCtrl',      
      })
      $stateProvider.state('edit_book', {
      url: '/edit_book',
      templateUrl: 'templates/edit_booking.html',      
      controller: 'EditBookCtrl',      
      })
      $stateProvider.state('booking_pending', {
      url: '/booking_pending',
      templateUrl: 'templates/booking_pending.html',      
      controller: 'BookPendingCtrl'      
      })

      $stateProvider.state('logged_in', {
      url: '/logged_in',
      templateUrl: 'templates/test.html',
      //authenticated: true,
      // controller: 'AppCtrl',
        data: {
          authorizedRoles: [USER_ROLES.customer]
        }
      })

      $stateProvider.state('driver_test', {
      url: '/driver_test',
      templateUrl: 'templates/driver_test.html',
      controller: 'DriverCtrl'
      //   data: {
      //     authorizedRoles: [USER_ROLES.driver]
      //   }
      })
      $stateProvider.state('view_booking', {
      url: '/view_booking',
      templateUrl: 'templates/view_booking.html',
      controller: 'ViewBookCtrl'
      //   data: {
      //     authorizedRoles: [USER_ROLES.driver]
      //   }
      })
      $stateProvider.state('booking_accepted', {
      url: '/booking_accepted',
      templateUrl: 'templates/booking_accepted.html',
      // controller: 'ViewBookCtrl'
      //   data: {
      //     authorizedRoles: [USER_ROLES.driver]
      //   }
      })
      $stateProvider.state('booking_rejected', {
      url: '/booking_rejected',
      templateUrl: 'templates/booking_rejected.html',
      // controller: 'ViewBookCtrl'
      //   data: {
      //     authorizedRoles: [USER_ROLES.driver]
      //   }
      })
      

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.controller('registerCtrl', function ($scope,$state,CustomersModel,DriversModel) {
  $scope.customer = {};
  $scope.register = function(vm){
    
    $scope.customer.email = vm.email;
    $scope.customer.password = vm.password;
    $scope.customer.phoneNum = vm.phoneNum;
    create(vm,$scope.decision.select);
  };

  function create(object,type) {
    if(type === "customer"){
      console.log("customer");
      CustomersModel.create(object)
      .then(function (result) {
          $state.go('login');
      });
    }else if(type === "driver"){
      console.log("driver");
      DriversModel.create(object)
      .then(function (result) {
        $state.go('login_driver');
      });
    }
    
  }

})

.controller('LoginCtrl', function ($scope,$state,$cookies,CustomersModel,DriversModel,$ionicPopup, AuthService) {
  $scope.uid ='';
  $scope.authenticate = function(form){
    CustomersModel.all().success(function(response){
      $scope.data = response.data;
    }).then(function(){
      //console.log($scope.data[0].id);
      console.log($scope.data[0].email);
      console.log($scope.data[0].password);
      //authenticate user
      for(var i=0;i<$scope.data.length;i++){
        if(form.email === $scope.data[i].email && form.password === $scope.data[i].password){
          //user authenticated
          $scope.message = "User authenticated";
          $scope.uid = $scope.data[i].id;
          //$state.go('logged_in');

        }
        if(i=== $scope.data.length){
          $scope.message = "Authentication failed!";        
        }
      //success message
      };
      
    }); 
  }
  //$scope.data = {};
  $scope.setCurrentUsername = function(mail) {
    $scope.email = mail;
  };
 
  $scope.login = function(data) {
    console.log(data.email);
    AuthService.login(data.email, data.password, data.user_type).then(function(authenticated) {
      $scope.uid = $cookies.get('user_id');
      //$state.go('logged_in', {}, {reload: true});
      
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };

})

.controller('BookCtrl', function($state,$scope,$cookies,DriversModel,AuthService,BookingsModel) {  
  $scope.getDrivers = function(){
    DriversModel.all().success(function(response){
      data = response.data;
    }).then(function(){
      $scope.drivers = data;      
    })
  };
  $scope.getDrivers();
  $scope.drivers = {};
  $scope.booking = {}; 
  $scope.createBooking = function(form){
    // //for real implementation
    // if(AuthService.getAuthStatus()){
    //   //retrieve user cookie id and execute
    // }
    $cookies.put('user_id',5);
    form.booking_status = "pending";
    form.customer = $cookies.get('user_id',5);        
    BookingsModel.create(form).success(function(){
      console.log("booking successful");
      $cookies.putObject('booking_info',form);
      var a = $cookies.getObject('booking_info');
      console.log(a.pickup);
      $state.go('booking_pending');
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
       $state.go('booking_pending');

    }

    // }
  })
.controller('BookPendingCtrl', function($state,$cookies,$q,$scope,$timeout,$ionicPopup,$interval,BookingsModel) {  
  $scope.edit_booking = function(){
    $state.go('edit_book');
  }
  //test if there is database change using timeout function
  $scope.book_success = false;
  $scope.book_fail = true;
  function statusNotChanged(){   
  }
  function booking_accepted(){
   var booking = BookingsModel.fetch(1)
    if(booking.booking_status === "accepted"){
      return true;
    }else{
      return false;
    } 
  }
  function booking_rejected(){
   var booking = BookingsModel.fetch(1)
    if(booking.booking_status === "rejected"){
      return true;
    }else{
      return false;
    } 
  }
  var test2 = function(){
    //if there is change, detect whether it is accepted or rejected
    //if there isn't any change prompt user after 1 minute
    //check database every 5 seconds  
    var noChange = true;
    
    //   $interval(function(){
    //     BookingsModel.fetch(1).then(function(response){
    //       booking = response.data;
    //       if(booking.booking_status === "pending"){
    //         console.log("true");        
    //       }else{
    //         console.log("false");
    //         noChange = false;            
    //       }
    //     })
    //   },1000)  
    //   console.log("noChange: " + noChange);
    // // if(!noChange){
    // //   $interval.cancel;
    // //   console.log("noChange: " + noChange);
    // // }
    
    
  // $interval(function(){
  //  var confirmPopup = $ionicPopup.confirm({
  //    title: 'No response',
  //    template: 'No response from driver.Wait another minute for response?'
  //  });

  //  confirmPopup.then(function(res) {
  //    if(res) {
  //      console.log('Wait another minute');
  //    } else {
  //      console.log('Select another driver');
  //    }
  //  });
  // },10000)
    
      
    
  }


  test2();
  })
.controller('DriverCtrl', function($scope, $state,$cookies,BookingsModel,$routeParams,BookingsModel) {
  $scope.showBooking = function(){
    BookingsModel.all().success(function(response){
      data = response.data;
      console.log(data);
    }).then(function(){
      $scope.bookings = data;
    })
  };
  $scope.showBooking();
  // $scope.sendData = function(id){
  //   BookingsModel.setBookingId(id).success(function(){
  //     console.log("Booking id set");
  //   })
  // }
})
.controller('ViewBookCtrl', function($scope, $state,$cookies,BookingsModel,$routeParams,BookingsModel) {
  // $scope.showOneBooking = function(){    
  //   $scope.booking_id = BookingsModel.getBookingId();
  //   console.log($scope.booking_id);
  //   // BookingsModel.fetch($scope.booking_id).success(function(response){
  //   //   data = response.data;
  //   //   console.log(data);
  //   // }).then(function(){
  //   //   $scope.oneBooking = data;
  //   // })
  // }
  // $scope.showOneBooking();
  $scope.book = {};
  $scope.showOneBooking = function(){
    BookingsModel.fetch(1).success(function(response){
      data = response;
      console.log(data);
    }).then(function(){
      $scope.book = data;
    })
  }  
  $scope.showOneBooking();
  $scope.acceptBooking = function(form){
    form.booking_status = "accepted";
    BookingsModel.update(1,form).success(function(){
      console.log("booking accepted");
      $state.go('booking_accepted');
    })
  }
  $scope.rejectBooking = function(form){
    form.booking_status = "rejected";
    BookingsModel.update(1,form).success(function(){
      console.log("booking rejected");
      $state.go('booking_rejected');
    })
  }
})

.controller('AppCtrl', function($scope, $state,$cookies, $ionicPopup, AuthService, AUTH_EVENTS) {
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
})


.run(function ($state,$cookies,$rootScope, $location, AuthService) {


  // $rootScope.$on('$stateChangeStart', function (event,next, current) {
  //   if(next.authenticated){
  //     if(!AuthService.getAuthStatus()){
  //       event.preventDefault();
  //       $state.go('login');
  //     }
  //   }

  //   if(next.originalPath == '/'){
  //     console.log('Login page');
  //     if(AuthService.getAuthStatus()){
  //       $location.path(current,$$route.originalPath);
  //     }
  //   }
  // })
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
 
    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        //$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    // if (!AuthService.isAuthenticated()) {
    //   if (next.name !== 'login') {
    //     event.preventDefault();
    //     $state.go('login');
    //   }
    // }
  });
});



