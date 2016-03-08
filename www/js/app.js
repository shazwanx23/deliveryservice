// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'backand', 'SimpleRESTIonic.controllers', 'SimpleRESTIonic.services'])

.config(function (BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider) {
    // change here to your appName
    BackandProvider.setAppName('mynewapp12345');

    BackandProvider.setSignUpToken('50b1e4de-d13d-400b-b0fa-276cba78f455');

    // token is for anonymous login. see http://docs.backand.com/en/latest/apidocs/security/index.html#anonymous-access
    BackandProvider.setAnonymousToken('89b4f6ec-d75e-41b4-b7e7-58e149dbfb85');

    //ionic routers
     $urlRouterProvider.otherwise('/')

      $stateProvider.state('home', {
      url: '/',
      templateUrl: 'templates/register_customer.html'
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


.controller('registerCtrl', function ($scope,CustomersModel,DriversModel) {
  $scope.customer = {};
  //$scope.customers =
  //[
  //  {email: "customer@email.com", password: "password", phoneNum: "0131234567"},
  //  {email: "customer1@email.com", password: "password", phoneNum: "0131234568"},
  //  {email: "customer2@email.com", password: "password", phoneNum: "0131234569"},
  //];

  $scope.register = function(vm){
    //$scope.customers.push($scope.vm);
    $scope.customer.email = vm.email;
    $scope.customer.password = vm.password;
    $scope.customer.phoneNum = vm.phoneNum;
    //$scope.vm = null;
    create(vm,$scope.decision.select);

  };

  function create(object,type) {
    if(type === "customer"){
      console.log("customer");
      CustomersModel.create(object)
      .then(function (result) {
          //cancelCreate();
          //getAll();
      });
    }else if(type === "driver"){
      console.log("driver");
      DriversModel.create(object)
      .then(function (result) {
          //cancelCreate();
          //getAll();
      });
    }
    
  }

})
