angular.module('app.routes', [])

.config(function (BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider,USER_ROLES) {
	BackandProvider.setAppName('mynewapp12345');
    BackandProvider.setSignUpToken('50b1e4de-d13d-400b-b0fa-276cba78f455');
    // token is for anonymous login. see http://docs.backand.com/en/latest/apidocs/security/index.html#anonymous-access
    BackandProvider.setAnonymousToken('89b4f6ec-d75e-41b4-b7e7-58e149dbfb85');
    //ionic routers
     $urlRouterProvider.otherwise('/')
    //start public states
    $stateProvider.state('register', {
      url: '/register',
      templateUrl: 'templates/public/register_customer.html'
      })
      .state('splash', {
      url: '/',
      templateUrl: 'templates/public/splash.html',
      controller: 'SplashCtrl'
      })
      //Login states
      .state('login', {
      url: '/login',
      templateUrl: 'templates/public/login.html',
      controller: 'LoginCtrl'
      })
      .state('login_driver', {
      url: '/login_driver',
      templateUrl: 'templates/public/login_driver.html',
      controller: 'LoginCtrl'
      })
      .state('login_admin', {
      url: '/login_admin',
      templateUrl: 'templates/public/login_admin.html',
      controller: 'LoginCtrl'
      })
    //end public states 
//**************************************************************************
      // start customer states
      $stateProvider
        .state('customer', {
          url: "/customer",
          abstract: true,
          templateUrl: "templates/customer/menu.html",
          controller: 'AppCtrl'
        })
      .state('customer.customerMenu', {
          url: "/customerMenu",
          data: {
          authorizedRoles: [USER_ROLES.customer]
          },
          views: {
            'customerContent' :{
              templateUrl: "templates/customer/test_book.html",
              controller: 'BookCtrl'
            }
          }
        })
      .state('customer.book', {
        url: '/book',
        data: {
          authorizedRoles: [USER_ROLES.customer]
          },
        views: {
            'customerContent' :{
          templateUrl: 'templates/customer/test_book.html',      
          controller: 'BookCtrl'      
          }     
        }  
      })
      $stateProvider.state('customer.booking_pending', {
      url: '/booking_pending',
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/booking_pending.html',      
          controller: 'BookPendingCtrl'      
          }     
        }
      })
      .state('customer.edit_book', {
      url: '/edit_book',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/edit_booking.html',      
          controller: 'EditBookCtrl',      
          }     
        }
      })
      .state('customer.edit_profile', {
      url: '/edit_profile',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/edit_profile.html',      
          controller: 'EditCustomerProfileCtrl',      
          }     
        }
      })

      .state('customer.select_driver', {
      url: '/select_driver',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/select_driver.html',      
          controller: 'SelectDriverCtrl',      
          }     
        }
      })
      .state('customer.booking_accepted', {
      url: '/booking_accepted',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/booking_accepted.html',      
          controller: 'CustomerBookingAcceptedCtrl',      
          }     
        }
      })
      .state('customer.pay', {
      url: '/pay',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/pay.html',      
          controller: 'CustomerPayCtrl',      
          }     
        }
      })
      .state('customer.paypal_test', {
      url: '/paypal_test',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/paypal_test.html',      
          controller: 'PayPalTestCtrl',      
          }     
        }
      })
      .state('customer.payment_success', {
      url: '/payment_success',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/payment_success.html',      
          controller: 'PayPalSuccessCtrl',      
          }     
        }
      })
      .state('customer.payment_fail', {
      url: '/payment_fail',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/payment_fail.html',      
          // controller: 'CustomerPayCtrl',      
          }     
        }
      })
      .state('customer.rate_driver', {
      url: '/rate_driver',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/rate_driver.html',      
          controller: 'RateDriverCtrl',      
          }     
        }
      })
      .state('customer.map_debug', {
      url: '/map_debug',      
      data: {
          authorizedRoles: [USER_ROLES.customer]
          },
      views: {
            'customerContent' :{
          templateUrl: 'templates/customer/map_debug.html',      
          controller: 'MapDebugCtrl',      
          }     
        }
      })
      //end customer states
//**************************************************************************
      //start driver states
      .state('driver', {
          url: "/driver",
          abstract: true,
          templateUrl: "templates/driver/driverMenu.html",
          controller: 'DriverAppCtrl',
          redirectTo: '/#/driver/driverMenu',
          data: {
          authorizedRoles: [USER_ROLES.driver]
          },
        })
      .state('driver.driverMenu', {
          url: "/driverMenu",
          data: {
          authorizedRoles: [USER_ROLES.driver]
          },
          views: {
            'driverContent' :{
              templateUrl: "templates/driver/driverHome.html",
              controller: 'PlaylistsCtrl'
            }
          }
        })     
        .state('driver.edit_profile', {
          url: "/edit_profile",
          data: {
          authorizedRoles: [USER_ROLES.driver]
          },
          views: {
            'driverContent' :{
              templateUrl: "templates/driver/edit_profile.html",
              controller: 'EditDriverProfileCtrl'
            }
          }
        })       
      .state('driver.view_booking', {
      url: '/view_booking',
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/view_booking.html',
              controller: 'ViewBookCtrl'
            }
          },
      data: {
        authorizedRoles: [USER_ROLES.driver]
      }
      })
      .state('driver.booking_accepted', {
      url: '/booking_accepted',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/booking_accepted.html',
              controller: 'BookingAcceptedCtrl'
            }
          }
      })
      .state('driver.booking_rejected', {
        url: '/booking_rejected',
        templateUrl: 'templates/driver/booking_rejected.html',
        data: {
            authorizedRoles: [USER_ROLES.driver]
        }
      })      
      .state('driver.driver_test', {
      url: '/driver_test',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/driver_test.html',
              controller: 'DriverCtrl'
            }
          }
        
      })
      .state('driver.paid', {
      url: '/paid',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/paid.html',
              controller: 'PaidCtrl'
            }
          }
        
      })
      .state('driver.view_location', {
      url: '/view_location',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/view_location.html',
              controller: 'ViewLocationCtrl'
            }
          }
      })
      .state('driver.edit_vehicle', {
      url: '/edit_vehicle',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/edit_vehicle.html',
              controller: 'EditVehicleCtrl'
            }
          }
      })
      .state('driver.rate_customer', {
      url: '/rate_customer',
      data: {
          authorizedRoles: [USER_ROLES.driver]
          },
      views: {
            'driverContent' :{
              templateUrl: 'templates/driver/rate_customer.html',
              controller: 'RateCustomerCtrl'
            }
          }
        
      })
      //end driver states
//**************************************************************************
      //start admin states
      .state('admin', {
          url: "/admin",
          abstract: true,
          templateUrl: "templates/admin/adminMenu.html",
          controller: 'AdminAppCtrl',
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          redirectTo: '/#/admin/adminMenu'
        })
      .state('admin.adminMenu', {
          url: "/adminMenu",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/adminHome.html",
              //controller: 'PlaylistsCtrl'
            }
          }
        })
      .state('admin.edit_profile', {
          url: "/edit_profile",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/edit_profile.html",
              controller: 'EditAdminProfileCtrl'
            }
          }
        })
      .state('admin.broadcast_messages', {
          url: "/broadcast_messages",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/broadcast_messages.html",
              controller: 'BroadcastMessagesCtrl'
            }
          }
        })
      .state('admin.ban_user', {
          url: "/ban_user",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/ban_user.html",
              controller: 'BanUserCtrl'
            }
          }
        })
      .state('admin.view_statistics', {
          url: "/view_statistics",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/view_statistics.html",
              controller: 'ViewStatisticsCtrl'
            }
          }
        })
      .state('admin.pay_driver', {
          url: "/pay_driver",
          data: {
          authorizedRoles: [USER_ROLES.admin]
          },
          views: {
            'adminContent' :{
              templateUrl: "templates/admin/pay_driver.html",
              controller: 'PayDriverCtrl'
            }
          }
        })
      //end admin states
      //Booking customer states
})
.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
 
.constant('USER_ROLES', {
  admin: 'admin_role',
  driver: 'driver_role',
  customer: 'customer_role'
});
