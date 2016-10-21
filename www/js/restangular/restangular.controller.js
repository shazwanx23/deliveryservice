angular.module('myApp.restangular')
.controller('RestController',['$scope', 'Restangular',
				      function($scope,Restangular){
	$scope.bookings = '';	

	var books = Restangular.allUrl('one','https://api.backand.com\:443/1/objects');	
	books.all("bookings")
	.getList({ pageSize: 20, pageNumber: 1 })
	.then(function (bookings) {
		$scope.bookings = bookings[0];
	});			

	//klau x pakai restangular
	// $http.get('https://api.backand.com:443/1/objects/bookings?pageSize=20&pageNumber=1')
	// .success(function(response){
	// 	$scope.booking = response.data;
	// 	console.log($scope.booking[0]);
	// })

	//klau x pakai restangular x leh wat cmni
	// var newBooking = {
	// 	name: "booking",
	// 	property: "punya",
	// 	id: "object"
	// };
	// books.post(newBooking);


}]);