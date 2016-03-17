angular.module('AuthService', [])
 
.service('AuthService', function($q, $http,$cookies, USER_ROLES, CustomersModel) {
 
  var email = '';
  var uid = '';
  var isAuthenticated = false;
  var role = '';

  function loadUserCredentials() {
    var uid = window.localStorage.getItem(email);
    if (uid) {
      useCredentials(uid);
    }
  }
 
  function storeUserCredentials(mail,id) {
    window.localStorage.setItem(mail, id);
    useCredentials(mail,id);
  }
 
  function useCredentials(mail,id) {
    email = mail;
    isAuthenticated = true;
    uid = id;
    role = USER_ROLES.customer;
 
    // if (email == 'admin') {
    //   role = USER_ROLES.admin
    // }
    // if (email == 'user') {
    //   role = USER_ROLES.public
    // }
 
  }
 
  function destroyUserCredentials() {
    uid = undefined;
    email = '';
    isAuthenticated = false;
    window.localStorage.removeItem(mail);
  }
  
  var getAuthStatus = function (){
    var status = $cookies.get('user_id');
    console.log($cookies.get('user_id'));
    if(status){
      return true;
    }else{
      return false;
    }
  }
 
  var login = function(mail, pw) {
    var data = {};
    return $q(function(resolve, reject) {
      CustomersModel.all().success(function(response){
         data = response.data;
        }).then(function(){
          for(var i=0;i< data.length;i++){
            if(mail === data[i].email && pw === data[i].password){
              //user authenticated
              storeUserCredentials(data[i].email,data[i].id);
              $cookies.put('user_id', data[i].id);
              //console.log($cookies.get('user_id'));
              resolve('Login success.');    
            }
            if(i=== data.length){
              reject('Login Failed.');
            }
          //success message
          };
        });
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
    return (authorizedRoles.indexOf(role) !== -1);
  };
  loadUserCredentials();
 
  return {
    login: login,
    getAuthStatus: getAuthStatus,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    email: function() {return email;},
    role: function() {return role;}

  };
})

// .factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
//   return {
//     responseError: function (response) {
//       $rootScope.$broadcast({
//         401: AUTH_EVENTS.notAuthenticated,
//         403: AUTH_EVENTS.notAuthorized
//       }[response.status], response);
//       return $q.reject(response);
//     }
//   };
// })

// .config(function ($httpProvider) {
//   $httpProvider.interceptors.push('AuthInterceptor');
// });