angular.module('booking_controllers', [])

.controller('MapDebugCtrl', function($state,$scope,$ionicPopup,$cordovaGeolocation,
  $timeout,$window, $ionicPlatform) {
	$scope.initialize = function(){
      $ionicPlatform.ready(function() {
        $cordovaGeolocation.getCurrentPosition({
        timeout:10000,
        enableHighAccuracy:true
          }).then(function(position) {
            var latLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);      
            $scope.latitude = position.coords.latitude;
            $scope.longitude = position.coords.longitude;
            var mapOptions = {
              center: latLng,
              zoom: 11,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            $scope.map = new google.maps.Map(document.getElementById("map10"), mapOptions);
            google.maps.event.addListenerOnce($scope.map, 'idle', function(){
       
              var marker = new google.maps.Marker({
                  map: $scope.map,
                  animation: google.maps.Animation.DROP,
                  position: latLng
              }); 
              var infoWindow = new google.maps.InfoWindow({
                    content: "Here I am!"
                });
            });
          }, function(error) {
              console.log(error);
          });
        })
  }
  $scope.initialize();
})
