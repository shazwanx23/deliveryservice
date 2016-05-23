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
  $scope.uid ='';
  $scope.authenticate = function(form){
    CustomersModel.all().success(function(response){
      $scope.data = response.data;
    }).then(function(){
      //authenticate user
      for(var i=0;i<$scope.data.length;i++){
        if(form.email === $scope.data[i].email && form.password === $scope.data[i].password){
          //user authenticated
          $scope.message = "User authenticated";
          $scope.uid = $scope.data[i].id;
        }
        if(i=== $scope.data.length){
          $scope.message = "Authentication failed!";        
        }
      //success message
      };
      
    }); 
  }
  $scope.setCurrentUsername = function(mail) {
    $scope.email = mail;
  };
 
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

