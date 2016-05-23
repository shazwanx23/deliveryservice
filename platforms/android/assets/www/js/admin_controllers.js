angular.module('admin_controllers', [])

.controller('AdminAppCtrl', function($scope, $state,$cookies,DriversModel,AuthService) {
    $scope.logout = function(){
    AuthService.logout();
    $state.go('splash', {}, {reload: true});
  }
})

.controller('EditAdminProfileCtrl', function($scope, $state,$ionicPopup,AuthService,AdminsModel) {
  var user = AuthService.getUserCookie();
  $scope.form = {};
  $scope.form.email = user.email;
  $scope.updateEmail = function(form){
    AdminsModel.update(user.id,form)
    .success(function(){
      console.log('email update success');
    });
  }
  $scope.updatePassword = function(passwordForm) {
    var error = false;
    var errorMessage = '';
    console.log(user.password);
    if(passwordForm.password !== user.password){
      error = true;
      errorMessage = 'Current Password does not match';
    }
    if(passwordForm.newPassword !== passwordForm.newPasswordAgain){
      error = true;
      errorMessage += '<br />New Password field does not match Password Again field';
    }
    if(error) {
      var alertPopup = $ionicPopup.alert({
        title: 'Password update failed!',
        template: errorMessage

      });
    };
    if(!error){
      user.password = passwordForm.newPassword;
      AdminsModel.update(user.id,user)
      .success(function(){
        var alertPopup = $ionicPopup.alert({
        title: 'Password update successful',
        template: errorMessage
        });
        passwordForm = {};
      });
    }
  }
})

.controller('BroadcastMessagesCtrl', function($scope,$ionicPopup,$http,$interval,CustomerMessagesModel,DriverMessagesModel,AuthService,CustomersModel,DriversModel, BulkService) {
  var token = '';
  $http({
  method: 'POST',
  url: 'https://api.backand.com/1/bulk',
  crossOrigin : true,
  headers: {
    "Authorization": 'Bearer 89b4f6ec-d75e-41b4-b7e7-58e149dbfb85', 
    "AppName": "mynewapp12345"
    }
  })
  // $http({
  //    method: 'POST',
  //    url: 'https://api.backand.com/token/',
  // })
    .success(function(response){
      token = response;
      console.log(response);
    }).error(function(error){
      console.log(error.Message);
    })
  // $scope.driverIndex = 0;
  // $scope.messages = {};
  // $scope.messages.data = {};
  // $scope.json_encoded_message = new Array();
  // $scope.json_encoded_message.Headers = {};
  // $scope.json_encoded_message.Headers.Authorization = '';
  // $scope.json_encoded_message.Headers.AppName = '';
  // $scope.json_request = {};
  // $scope.request = new Array();
  // $scope.sendMessage = function(message,recipients){
  //   var admin = AuthService.getUserCookie();
  //   message.admin = admin.id;
  //   $scope.customers = {};
  //   $scope.drivers = {};    
  //   var alertPopup = $ionicPopup.alert({
  //   title: ' Message sent',
  //   template: 'Message sent successfully'
  //   });
  //   var messageToCustomer = function(){
  //     CustomersModel.all()
  //       .success(function(response){
  //         $scope.customers = response.data;
  //       })
  //       .then(function(){
  //         //loop to create multiple messages
  //         for(var i=0; i<$scope.customers.length; i++){
  //           var messages = {};
  //           messages.data = {};
  //           messages.Headers = {};
  //           messages.method = "POST";
  //           messages.url = "https://api.backand.com/1/objects/customer_messages";
  //           // messages.Headers.Authorization = "Bearer 89b4f6ec-d75e-41b4-b7e7-58e149dbfb85";
  //           // messages.Headers.AppName = "mynewapp12345";
  //           messages.data.title = message.title;
  //           messages.data.content = message.content;
  //           console.log($scope.customers[i].id);
  //           var customer_id = $scope.customers[i].id;
  //           messages.data.customer = customer_id;
  //           messages.data.admin = message.admin;
  //           $scope.json_encoded_message[i] = messages;
  //         }
  //       }).then(function(){
  //         console.log($scope.json_encoded_message);

  //         $scope.json_encoded_message.Headers.Authorization = "Bearer 89b4f6ec-d75e-41b4-b7e7-58e149dbfb85";
  //         $scope.json_encoded_message.Headers.AppName = "mynewapp12345";
  //         $scope.json_request = JSON.stringify($scope.json_encoded_message);
  //         console.log($scope.json_request);
          
  //         CustomerMessagesModel.createBulk($scope.json_encoded_message)
  //           .success(function(){
  //             console.log("message in bulk successful");
  //           }).error(function(data){
  //             console.log(data);
  //           })

  //       })
  //   }
  //   if(recipients === 'customer'){
  //     //send message to customer
  //     messageToCustomer(message);
  //     console.log('sent to customers');
  //   }else if(recipients === 'driver'){
  //     //send message to driver
  //     // messageToDriver(message);
  //   }else if(recipients === 'both'){
  //     //send message to customer and drivers
  //     messageToCustomer(message);
  //     // messageToDriver(message);
  //   }

  // }
  // $scope.testSend = function(){
    // $http({
    //         method: 'POST',
    //         url: 'https://api.backand.com/1/bulk',
    //         // Headers:{
    //         //   "Authorization": 'Bearer 89b4f6ec-d75e-41b4-b7e7-58e149dbfb85', 
    //         //   "AppName": 'mynewapp12345'
    //         //   },
    //         data:[
    //           {
    //             "method": "POST",
    //             "url": "https://api.backand.com/1/objects/customer_messages",
    //             "data": {
    //               "title": "title1",
    //                "content" :"content1"
    //               }
    //           },
    //           {
    //             "method": "POST",
    //             "url": "https://api.backand.com/1/objects/customer_messages",
    //             "data": {
    //               "title": "title2",
    //                "content": "content2"
    //               }
    //           }
    //         ]
    //       }).success(function(){
    //         console.log('message sent successful');
    //       }).error(function(data){
    //         console.log(data);
    //       })
  
  // }

})
.controller('BanUserCtrl', function($scope, $state,DriversModel,CustomersModel,AuthService) {
  $scope.showCustomer = true;
  $scope.toggleShow = function(){
    var show = $scope.showCustomer;
    $scope.showCustomer = !$scope.showCustomer;
    return show;
  }
  $scope.customers = {};
  $scope.drivers = {};
  $scope.list = function(){
    CustomersModel.all()
      .success(function(response){
        $scope.customers = response.data;
        console.log($scope.customers[0].active);
      })
    DriversModel.all()
      .success(function(response){
        $scope.drivers = response.data;
      })
  }
  $scope.toggleDriverActive = function(driver){
    DriversModel.update(driver.id,driver)
      .success(function(){
        console.log('change activation success');
      })
  }
  $scope.toggleCustomerActive = function(customer){
    CustomersModel.update(customer.id,customer)
      .success(function(){
        console.log('change activation success');
      })
  }
  $scope.list();
})
.controller('ViewStatisticsCtrl', function($scope, $state,$cookies,DriversModel,AuthService,CustomersModel,
                                            BookingsModel) {
  $scope.customers = {};
  $scope.drivers = {};
    $scope.dataSource = {};
  CustomersModel.all()
    .success(function(response){
      $scope.customers = response.data;
      console.log($scope.customers.length);
    })
    .then(function(){
      DriversModel.all()
      .success(function(response){
        $scope.drivers = response.data;
        console.log($scope.drivers.length);
      })
      .then(function(){
        $scope.dataSource = {
          "chart": {
            "caption": "Registered Users",
            "captionFontSize": "30",
            // more chart properties - explained later
          },
          "data": [{
              "label": "Drivers",
              "value": $scope.drivers.length
            }, 
            {
              "label": "Customers",
              "value":  $scope.customers.length
            }//more chart data
          ]
        };
      })
    })
  $scope.pieSource = {};
  $scope.delivery = {};
  $scope.compeleted = 0;
  $scope.cancelled = 0;
  $scope.rejected = 0;
  $scope.pending = 0;
  BookingsModel.all()
  .success(function(response){
    $scope.booking = response.data
  }).then(function(){
    // console.log($scope.booking[0].booking_status);
    for(var i=0;i<$scope.booking.length;i++){
      if($scope.booking[i].booking_status === 'completed'){
        $scope.completed +=1;

      }
      if($scope.booking[i].booking_status === 'cancelled'){
        $scope.cancelled +=1;
      }
      if($scope.booking[i].booking_status === 'rejected'){
        $scope.rejected +=1;
      }
      if($scope.booking[i].booking_status == 'pending'){
        $scope.pending +=1;
      }
    }
    console.log($scope.completed);
    console.log($scope.cancelled);
    console.log($scope.rejected);
    console.log($scope.pending);
  })
  .then(function(){
    $scope.pieSource = {
    "chart": {
        "caption": "Deliveries",        
        "paletteColors": "#0075c2,#1aaf5d,#f2c500,#f45b00,#8e0000",
        "bgColor": "#ffffff",
        "showBorder": "0",
        "use3DLighting": "0",
        "showShadow": "0",
        "enableSmartLabels": "0",
        "startingAngle": "0",
        "showPercentValues": "1",
        "showPercentInTooltip": "0",
        "decimals": "1",
        "captionFontSize": "14",
        "subcaptionFontSize": "14",
        "subcaptionFontBold": "0",
        "toolTipColor": "#ffffff",
        "toolTipBorderThickness": "0",
        "toolTipBgColor": "#000000",
        "toolTipBgAlpha": "80",
        "toolTipBorderRadius": "2",
        "toolTipPadding": "5",
        "showHoverEffect": "1",
        "showLegend": "1",
        "legendBgColor": "#ffffff",
        "legendBorderAlpha": "0",
        "legendShadow": "0",
        "legendItemFontSize": "10",
        "legendItemFontColor": "#666666",
        "useDataPlotColorForLabels": "1"
    },
    "data": [
        {
            "label": "Completed",
            "value":  $scope.completed
        },
        {
            "label": "Cancelled",
            "value":  $scope.cancelled
        },
        {
            "label": "Rejected",
            "value": $scope.rejeted
        },
        {
            "label": "Pending",
            "value": $scope.pending
        }
    ]
  }  
  })
})
.controller('PayDriverCtrl', function($window, $scope, $state,$cookies,DriversModel,AuthService,
  CustomersModel,BookingsModel) {
  $scope.drivers = {};
  $scope.bookingByDriver = {};
  $scope.paypalPaidBooking = {};
  $scope.earning = 0;
  $scope.showDrivers = true;
  $scope.completedBookings = 0;
  $scope.reset = function(){
    $scope.showDrivers = true;
  }
  $scope.getDrivers = function(){
    DriversModel.all()
    .success(function(response){
      $scope.drivers = response.data;
    })  
  }
  $scope.getDrivers();
  $scope.viewEarnings = function(driver_id){
    $scope.showDrivers = !$scope.showDrivers;
    BookingsModel.getBookingsByDriver(driver_id)
      .success(function(response){
        $scope.bookingByDriver = response.data;
      })
      .then(function(){
        var j= 0;
        for(var i=0; i<$scope.bookingByDriver.length; i++){
          if($scope.bookingByDriver[i].booking_status == 'paid_paypal'){
            $scope.paypalPaidBooking[j] = $scope.bookingByDriver[i];
            j++;
            $scope.completedBookings++;            
            $scope.earning += parseFloat($scope.bookingByDriver[i].price);
          }
        }
        console.log($scope.paypalPaidBooking);
      })
  }
  $scope.payDriver = function(booking){
    
    booking.booking_status = 'driver_paid';
    BookingsModel.update(booking.id,booking)
    .success(function(){
      $scope.reset();
      $scope.getDrivers();
      $window.location.reload();
    }).error(function(message){
      console.log(message);
    })
  }
})