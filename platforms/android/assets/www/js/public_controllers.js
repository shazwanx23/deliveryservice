angular.module('public_controllers', [])

.controller('SplashCtrl', function ($scope,$state) {
  $scope.goToCustomer = function(){
    $state.go('login');
  }
  $scope.goToDriver = function(){
    $state.go('login_driver');
  }
  $scope.goToAdmin = function(){
    $state.go('login_admin');
  }
  $scope.goToRegister = function(){
    $state.go('register');
  }
})
.controller('LoginCtrl', function ($scope,$state,CustomersModel,DriversModel,$ionicPopup, AuthService) {
  $scope.login = function(data) {
    console.log(data.email);
    AuthService.login(data.email, data.password, data.user_type).then(function(authenticated) {
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };

})
.controller('registerCtrl', function ($ionicPopup,$scope,$state,CustomersModel,DriversModel) {
  $scope.customer = {};
  $scope.register = function(vm){
    $scope.customer.email = vm.email;
    $scope.customer.password = vm.password;
    $scope.customer.phoneNum = vm.phoneNum;
    $scope.customer.active = true;
    CustomersModel.emailIsUnique($scope.customer.email)
    .success(function(response){
      console.log(response.data[0]);
      if(response.data[0]){
        var alertPopup = $ionicPopup.alert({
          title: 'Email already exist!',
          template: 'That email is already registered.'
        });
      }else{
        create($scope.customer,$scope.decision.select);
      }
    })
    
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

