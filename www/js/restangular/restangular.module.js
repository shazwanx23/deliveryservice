angular.module('myApp.restangular', ['restangular'])
.config(['$stateProvider','RestangularProvider' , function($stateProvider,RestangularProvider){
	$stateProvider.state('/rest', {
		url: '/rest',
		templateUrl: 'js/restangular/rest.html',
		controller: 'RestController'
	})

	//restangular
  // add a response intereceptor
  RestangularProvider.setResponseExtractor(function(response, operation) {
        return response.data;
    });



}]);