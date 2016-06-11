angular.module('AuthService', [])
 
.service('AuthService', function($state,$q, $http,$window,$ionicPopup,USER_ROLES, CustomersModel,DriversModel,AdminsModel) {

  var user_type = '';
  var email = '';
  var uid = '';
  var isAuthenticated = false;
  var role = '';
  var user = {};

  function loadUserCredentials() {
    var uid = window.localStorage.getItem(email);
    if (uid) {
      useCredentials(uid);
    }
  }
 
  function storeUserCredentials(mail,id,type) {
    window.localStorage.setItem(mail, id);
    useCredentials(mail,id,type);
  }
 
  function useCredentials(mail,id,type) {
    email = mail;
    isAuthenticated = true;
    uid = id;
    console.log(type);
    if(type === "customer"){
      console.log("type: " +(type === "customer"));
      role = USER_ROLES.customer;
      $state.go('customer.book');
    }else if(type === "driver"){
      role = USER_ROLES.driver;
      $state.go('driver.driver_test');
    }else if(type === "admin"){
      role = USER_ROLES.admin;
      $state.go('admin.view_statistics');
    }
  }
 
  function destroyUserCredentials() {
    
     user_type = '';
     email = '';
     uid = '';
     isAuthenticated = false;
     role = '';
     user = '';
    console.log("logged out");
  }
  
  var getAuthStatus = function (){
    var status = JSON.parse($window.localStorage.getItem('user'));
    if(status){
      return true;
    }else{
      return false;
    }
  }
  var getUserCookie = function (){
    var user_cookie = JSON.parse($window.localStorage.getItem('user'));
    if(user_cookie){
      return user_cookie;
    } 
  }
 
  var login = function(mail, pw,type) {
    var data = {};
    user_type = type;
    console.log(type);
    var userService = CustomersModel;
    return $q(function(resolve, reject) {
      if(type === "customer") {
        userService = CustomersModel;
      }else if(type === "driver") {
        userService = DriversModel;
      }else if(type === "admin") {
        userService = AdminsModel;
        console.log(type);
      }      
      userService.emailIsUnique(mail)
      .success(function(response){
        var record = response.data[0];
        if(response.data[0]){
          console.log(response.data[0]);
          var data = response.data[0];
          if(mail === data.email && pw === data.password && data.active){
            $window.localStorage.setItem('user', JSON.stringify(data));
            storeUserCredentials(data.email,data.id,user_type);              
          }else{
            var alertPopup = $ionicPopup.alert({
              title: 'Password do not match!',
              template: 'Your passwords do not match or there is a problem with your account.'
            }); 
          }
        }else{
           var alertPopup = $ionicPopup.alert({
            title: 'No records found!',
            template: 'No record with that email address was found.'
          });
        }
      })
    });
  };
 
  var logout = function() {
    destroyUserCredentials();
  };
 
  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    console.log(authorizedRoles.indexOf(role));
    // return (authorizedRoles.indexOf(role) !== -1);
     return 1;
  };
  loadUserCredentials();
 
  return {
    login: login,
    getAuthStatus: getAuthStatus,
    logout: logout,
    isAuthorized: isAuthorized,
    getUserCookie: getUserCookie,
    isAuthenticated: function() {return isAuthenticated;},
    email: function() {return email;},
    role: function() {return role;}

  };
})

.service('BackandService', function($http,Backand) {
  function makePayPalPayment(amount,booking_id){
    return $http({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/action/bookings/' + booking_id,
      params: {
        name: 'PayPalPayment',
        parameters: {
          amount: amount,
          process:"payment"
        }
      }
    });
  }
  function makePayPalApproval(payerId, paymentId,booking_id){
   return $http({
      method: 'GET',
      url: Backand.getApiUrl() + '/1/objects/action/bookings/' + booking_id,
      params: {
        name: 'PayPalPayment',
        parameters: {
          payerId: payerId,
          paymentId: paymentId,
          process:"approval"
        }
      }
    });
  }
  return {

    makePayPalPayment:  makePayPalPayment,
    makePayPalApproval: makePayPalApproval

  };
})