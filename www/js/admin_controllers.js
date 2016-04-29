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

.controller('BroadcastMessagesCtrl', function($scope,$ionicPopup,CustomerMessagesModel,DriverMessagesModel,AuthService,CustomersModel,DriversModel) {

  $scope.sendMessage = function(message,recipients){
    var admin = AuthService.getUserCookie();
    // console.log(admin.id);
    // console.log(recipients);
    // console.log(message.title);
    // console.log(message.content);
    $scope.customers = {};
    $scope.drivers = {};
    message.admin = admin.id;
    var alertPopup = $ionicPopup.alert({
    title: ' Message sent',
    template: 'Message sent successfully'
    });
  var messageToCustomer = function(message){
    $scope.i=0;
    CustomersModel.all()
    .success(function(response){
      $scope.customers = response.data;
      console.log($scope.customers.length);
    }).then(function(){
      message.customer = $scope.customers[0].id;
      for($scope.i=0;$scope.i<$scope.customers.length;$scope.i++){
        console.log($scope.customers[$scope.i].id);
        console.log(message);
        CustomerMessagesModel.create(message)
        .success(function(){
          console.log('created message to customer')
          message.customer = $scope.customers[$scope.i].id;
        });
      }  
    })
  }
  var messageToDriver = function(message){
    DriversModel.all()
    .success(function(response){
      $scope.drivers = response.data;
      console.log($scope.drivers.length);
    }).then(function(){
      for(var i=0;i<$scope.drivers.length;i++){
        message.driver = $scope.drivers[i].id;
        console.log($scope.drivers[i].id);
        CustomerMessagesModel.create(message)
        .success(function(){
          console.log('created message to driver')
        });
      }  
    })
  }

    if(recipients === 'customer'){
      //send message to customer
      messageToCustomer(message);
      console.log('sent to customers');
    }else if(recipients === 'driver'){
      //send message to driver
      messageToDriver(message);
    }else if(recipients === 'both'){
      //send message to customer and drivers
      messageToCustomer(message);
      messageToDriver(message);
    }
  }
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
.controller('ViewStatisticsCtrl', function($scope, $state,$cookies,DriversModel,AuthService,CustomersModel,BookingsModel) {
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
        // "subCaption": "Last year",
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
            "value":  10
            // $scope.completed
        },
        {
            "label": "Cancelled",
            "value":  5
            // $scope.cancelled
        },
        {
            "label": "Rejected",
            "value": 5
            // $scope.rejeted
        },
        {
            "label": "Pending",
            "value": 5
            // $scope.pending
        }
    ]
  }  
  })
})