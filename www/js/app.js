// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'backand', 'SimpleRESTIonic.controllers', 'SimpleRESTIonic.services','AuthService','ngCookies'])

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

      $stateProvider.state('book', {
      url: '/book',
      templateUrl: 'templates/create_booking.html',      
      controller: 'BookCtrl',
      // authenticated: true
      })

      $stateProvider.state('test_book', {
      url: '/test_book',
      templateUrl: 'templates/test_book.html',      
      controller: 'BookCtrl',
      // authenticated: true
      })

      $stateProvider.state('logged_in', {
      url: '/logged_in',
      templateUrl: 'templates/test.html',
      authenticated: true,
      // controller: 'AppCtrl',
        data: {
          authorizedRoles: [USER_ROLES.customer]
        }
      })
      $stateProvider.state('driver_test', {
      url: '/driver_test',
      templateUrl: 'templates/driver_test.html',
      authenticated: true,
      // controller: 'AppCtrl',
        data: {
          authorizedRoles: [USER_ROLES.driver]
        }
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
        $state.go('login');
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
      $state.go('logged_in', {}, {reload: true});
      
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };

})

.controller('BookCtrl', function($scope,$cookies) {

    $scope.booking = {};
    $scope.booking.pickup = "KTR";
    $scope.booking.destination = "sri putri";
    $scope.booking.timein = "11.11AM";
    $scope.booking.driver = "Ahmad";
  $scope.showdata = function(form){
    $scope.booking.pickup = form.pickup;
    $scope.booking.destination = form.destination;
    $scope.booking.timein = form.timein;
    $scope.booking.driver = form.driver;
    console.log($scope.booking);
  };

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



