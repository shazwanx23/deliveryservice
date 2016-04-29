angular.module('public_controllers', [])

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
      
    }, function(err) {cookies
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

