// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic',
 'ionic.rating',
 'ngCordova',
 'backand', 
 'app.routes',
 'SimpleRESTIonic.controllers',
 'SimpleRESTIonic.services',
 'AuthService',
 'ngCookies',
 'ngRoute',
 'ng-fusioncharts',
 'ionic-timepicker',
'admin_controllers',
'public_controllers',
'customer_controllers',
'driver_controllers',
'booking_controllers', 
 'restangular',
 'myApp.restangular'
])
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
.config(function (ionicTimePickerProvider, BackandProvider) {
    var timePickerObj = {
      inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
      format: 12,
      step: 15,
      setLabel: 'Set',
      closeLabel: 'Close'
    };
    ionicTimePickerProvider.configTimePicker(timePickerObj);
    //make backand real-time
    BackandProvider.runSocket(true);
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
      console.log(next.data.authorizedRoles);
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        //$state.go($state.current, {}, {reload: true});
        $state.go('splash', {}, {reload: true});
        //$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }
 
    // if (!AuthService.isAuthenticated()) {
    //   if (next.name !== 'login' || next.name !== 'splash' || next.name !== 'register'
    //       || next.name !== 'login_driver' || next.name !== 'login_admin') {
    //     event.preventDefault();
    //     $state.go('splash');
    //   }
    // }
  });
})