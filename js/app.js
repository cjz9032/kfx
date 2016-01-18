// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
		'ionic', 'starter.controllers', 'starter.services', 'starter.directives', 'common.services', 'starter.tpl'
	], function($provide) {
		$provide.factory('myHttpInterceptor', function($q) {
			return {
				// optional method
				'request': function(config) {
					// do something on success
					return config;
				},

				// optional method
				'requestError': function(rejection) {
					// do something on error
					console.log('requestError');
					console.log(rejection);
					rejection.config ? document.write(JSON.stringify(rejection.config.params) + rejection.data)
					:document.write(JSON.stringify(rejection));
					return $q.reject(rejection);
				},



				// optional method
				'response': function(response) {
					// do something on success
					return response;
				},

				// optional method
				'responseError': function(rejection) {
					// do something on error 

					if (rejection.status !== 0) {
						console.log('responseError');
						console.log(rejection);
					rejection.config ? document.write(JSON.stringify(rejection.config.params) + rejection.data)
					:document.write(JSON.stringify(rejection));
						alert('远程服务器错误,请稍候再试试......' + rejection.status);
						return $q.reject(rejection);
					} else {
						return rejection;
					}



				}
			};
		});
	})
	.filter('range', [

		function() {
			return function(len) {
				return _.range(1, len + 1);
			};
		}
	])
	.controller('StepPanelController', ['currentStep', 'trainnings', 'trainningInstance', 'trainnings',
		function(currentStep, trainnings, trainningInstance, trainnings) {
			var vm = this;
			vm.currentStep = currentStep;
			vm.trainningInstance = trainningInstance;
			vm.trainnings = trainnings;
			vm.texts = ['Write your own sort blog.', 'All trainnings done!'];
			return vm;
		}
	])
	.constant('STATE_CONFIG', {
		data: {
			Order: {
				Normal: {
					No: 1,
					Name: '进行中'
				},
				Unpaid: {
					No: 2,
					Name: '未付款'
				},
				Stopped: {
					No: 4,
					Name: '已停止'
				},
				Compeleted: {
					No: 8,
					Name: '已完成'
				},
				fixArr: [{
					No: 1,
					Name: '进行中'
				}, {
					No: 2,
					Name: '未付款'
				}, {
					No: 4,
					Name: '已停止'
				}, {
					No: 8,
					Name: '已完成'
				}]
			}
		}
	})
	.constant('MODULE_CODE_CONFIG', {
		data: {
			live: {
				tag: "live",
				name: "生活标签",
				code: 100001,
				max: 3
			},
			recreation: {
				tag: "recreation",
				name: "娱乐标签",
				code: 100002,
				max: 3
			},
			indst: {
				tag: "indst",
				name: "行业标签",
				code: 100003,
				max: 3
			},
			job: {
				tag: "job",
				name: "职业标签",
				code: 100004,
				max: 3
			}
		}
	})
	.constant('PAYWAYNO_CONFIG', {
		Wx: 50025,
		Ali: 50012,
		PayWayNos: [{
			FullName: "支付宝支付",
			PayWayNo: 50012
		}, {
			FullName: "微信支付",
			PayWayNo: 50025
		}]
	})
	.constant('BASEURL_CONFIG', 'http://kfx.la')
	.constant('trainningCourses', {
		courses: [{
			title: 'Step 1:',
			templateUrl: 'trainning-content.html',
			controller: 'StepPanelController',
			controllerAs: 'stepPanel',
			placement: 'right',
			position: '#text'
		}, {
			stepClass: 'last-step',
			backdropClass: 'last-backdrop',
			templateUrl: 'trainning-content-done.html',
			controller: 'StepPanelController',
			controllerAs: 'stepPanel',
			position: ['$window', 'stepPanel',
				function($window, stepPanel) {
					console.log(stepPanel);
					var win = angular.element($window);
					console.log(win.width());
					console.log(stepPanel.width());
					return {
						top: (win.height() - stepPanel.height()) / 2,
						left: (win.width() - stepPanel.width()) / 2
					}
				}
			]
		}]
	})


.run(function($rootScope, $http) {

	$rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
		// track the state the user wants to go to; authorization service needs this
		$rootScope.toState = toState;
		$rootScope.toStateParams = toStateParams;
		
		var hideList = [],
		hideList2 = ['tab.orderList'];
		
		document.title=toState.t||'快分享';  
				if (_.contains(hideList2, toState.name)) {
			$rootScope.hideNavs = true;
		} else {
			$rootScope.hideNavs = false;
		}
//		if (_.contains(hideList, toState.name)) {
//			$rootScope.hideTabs = true;
//		} else {
//			$rootScope.hideTabs = false;
//		}
		// if the principal is resolved, do an authorization check immediately. otherwise,
		// it'll be done when the state it resolved. 
		//if (principal.isIdentityResolved()) authorization.authorize();
		//		var authViews=['tab.orderList','tab.orderView','tab.takerList','tab.takerView'];
		//		if (_.contains(authViews, toState)){
		//			console.log('need to get oauth(profile)');
		//			if(!Profile.isInfo()){
		//				$state.go('tab.account');
		//			}
		//		} 
	});



})



.config(function($sceDelegateProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider, $compileProvider) {

	$sceDelegateProvider.resourceUrlWhitelist(['self', 'http://kfx.la/**', 'http://each.sinaapp.com/**']);
	//unsafe
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|wxlocalresource|wxLocalResource|ftp|weixin|mailto|tel|file|sms):/);
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|wxlocalresource|wxLocalResource|file|weixin|chrome-extension):|data:image\//);
	$ionicConfigProvider.platform.ios.tabs.style('standard');
	$ionicConfigProvider.platform.ios.tabs.position('bottom');
	$ionicConfigProvider.platform.android.tabs.style('standard');
	$ionicConfigProvider.platform.android.tabs.position('bottom');

	$ionicConfigProvider.platform.ios.navBar.alignTitle('center');
	$ionicConfigProvider.platform.android.navBar.alignTitle('center');

	$ionicConfigProvider.platform.ios.backButton.previousTitleText(' ').icon('ion-ios-arrow-thin-left');
	$ionicConfigProvider.platform.android.backButton.previousTitleText(' ').icon('ion-android-arrow-back');

	$ionicConfigProvider.platform.ios.views.transition('none');
	$ionicConfigProvider.platform.android.views.transition('none');
	// Learn more here: https://github.com/angular-ui/ui-routerv 
	$ionicConfigProvider.backButton.previousTitleText(false);
	$ionicConfigProvider.views.maxCache(7);
	$ionicConfigProvider.views.forwardCache(true);
	$stateProvider

		.state('tab', {
		url: '/tab',
		abstract: true,
		resolve: {
			initialData: function(tabsCtrlInitialData) {
				return tabsCtrlInitialData();
			}
		},
		templateUrl: 'tabs.html',
		controller: 'TabsCtrl'
	})




	.state('tab.order', {
			url: '^/order',
			views: {
				'tab-order': {
					templateUrl: 'tab-order.html',
					controller: 'OrderCtrl'
				}
			}
		})
		.state('tab.orderList', {
			url: '^/orderList/:TypeID/',
			views: {
				'tab-order': {
					templateUrl: 'tab-order-list.html',
					controller: 'OrderListCtrl'
				}
			},
			t:'任务大厅'
		})
		.state('tab.takerList', {
			url: '^/takerList/:TypeID/',
			views: {
				'tab-account': {
					templateUrl: 'tab-taker-list.html',
					controller: 'TakerListCtrl'
				}
			}
		})

	.state('tab.orderView', {
			cache: false,
			url: '^/orderView/:TaskID',
			views: {
				'tab-order': {
					templateUrl: 'tab-order-view.html',
					controller: 'OrderViewCtrl'
				}
			}
		})
		.state('tab.takerView', {
			cache: false,
			url: '^/takerView/:TOID',
			views: {
				'tab-account': {
					templateUrl: 'tab-taker-view.html',
					controller: 'TakerViewCtrl'
				}
			}
		})

	.state('tab.orderListMine', {
			url: '^/orderListMine/:state',
			views: {
				'tab-account': {
					templateUrl: 'tab-order-list-mine.html',
					controller: 'OrderListMineCtrl'
				}
			}
		})
		.state('tab.orderViewMine', {
			cache: false,
			url: '^/orderViewMine/:TaskID',
			views: {
				'tab-account': {
					templateUrl: 'tab-order-view-mine.html',
					controller: 'OrderViewMineCtrl'
				}
			}
		})
		.state('tab.publish', {
			url: '^/order/publish',
			views: {
				'tab-account': {
					templateUrl: 'tab-publish.html',
					controller: 'PublishCtrl'
				}
			}
		})

	.state('tab.invitation', {
		url: '^/invitation',
		views: {
			'tab-invitation': {
				templateUrl: 'tab-invitation.html',
				controller: 'InvitationCtrl'
			}
		}
	})



	.state('tab.account', {
			url: '^/account',
			views: {
				'tab-account': {
					templateUrl: 'tab-account.html',
					controller: 'AccountCtrl'
				}
			},
			t:'个人中心'
		})
		.state('tab.help', {
			url: '^/help',
			views: {
				'tab-account': {
					templateUrl: 'tab-help.html',
					controller: 'HelpCtrl'
				}
			}
		})
		//		.state('tab.login', {
		//			url: '^/account/login',
		//			views: {
		//				'tab-account': {
		//					templateUrl: 'tab-login.html',
		//					controller: 'LoginCtrl'
		//				}
		//			}
		//		})
		.state('tab.profile', {
			url: '^/account/profile',
			resolve: {
				initialData2: function(profileCtrlInitialData) {
					return profileCtrlInitialData();
				}
			},
			views: {
				'tab-account': {
					templateUrl: 'tab-profile.html',
					controller: 'ProfileCtrl'
				}
			}
		})

	.state('tab.cashWD', {
			url: '^/account/cashWD',
			views: {
				'tab-account': {
					templateUrl: 'tab-cashWD.html',
					controller: 'CashWDCtrl'
				}
			}
		})
		.state('tab.withdrawList', {
			url: '^/withdrawList',
			views: {
				'tab-account': {
					templateUrl: 'tab-withdraw-list.html',
					controller: 'WithdrawListCtrl'
				}
			}
		})
		//		.state('tab.restricted', {
		//  url: '/restricted',
		//  data: {
		//    roles: ['Admin']
		//  },
		//  views: {
		//    'content@': {
		//      templateUrl: 'restricted.html'
		//    }
		//  }
		//})


	$urlRouterProvider.otherwise('/account');

	$httpProvider.interceptors.push('myHttpInterceptor');
	$httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

	// Override $http service's default transformRequest
	$httpProvider.defaults.transformRequest = [

		function(data) {
			/**
			 * The workhorse; converts an object to x-www-form-urlencoded serialization.
			 * @param {Object} obj
			 * @return {String}
			 */
			var param = function(obj) {
				var query = '';
				var name, value, fullSubName, subName, subValue, innerObj, i;

				for (name in obj) {
					value = obj[name];

					if (value instanceof Array) {
						for (i = 0; i < value.length; ++i) {
							subValue = value[i];
							fullSubName = name + '[' + i + ']';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						}
					} else if (value instanceof Object) {
						for (subName in value) {
							subValue = value[subName];
							fullSubName = name + '[' + subName + ']';
							innerObj = {};
							innerObj[fullSubName] = subValue;
							query += param(innerObj) + '&';
						}
					} else if (value !== undefined && value !== null) {
						query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
					}
				}

				return query.length ? query.substr(0, query.length - 1) : query;
			};

			return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
		}
	];


});