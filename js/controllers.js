angular.module('starter.controllers', [])



.controller('TabsCtrl', function($scope, $timeout, $filter, Order, Taker, Profile, $ionicBackdrop, $ionicModal, $ionicPopup,
	QR, WX, scores, PayAccount, PayRecord, ImageSelect, bitOP, Region, $state, BASEURL_CONFIG) {
	$scope.QR = QR;
	$scope.Taker = Taker;
	$scope.Order = Order;
	$scope.Profile = Profile;
	$scope.scores = scores;
	$scope.PayAccount = PayAccount;
	$scope.PayRecord = PayRecord;
	//3rd
	$scope.bitOP = bitOP;
	$scope.WX = WX;
	$scope.Math = window.Math;
	$scope.$ionicBackdrop = $ionicBackdrop;
	$scope.$ionicModal = $ionicModal;
	$scope.$filter = $filter;
	$scope.ImageSelect = ImageSelect;
	$scope.Region = Region;
	$scope.parseInt = window.parseInt;
	$scope.$state = $state;
	//$scope.choose=window.choose;
	$scope.getArr = _.range;
	$scope.getPics = ImageSelect.getPics;
	$scope.baseUrl = BASEURL_CONFIG;
	$scope.initCommonModal = function(theScope) {
		theScope.$ionicModal.fromTemplateUrl('my-modal.html', {
			scope: theScope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			theScope.modal = modal;
		});
		theScope.openModal = function(url, title) {
			theScope.modal.url = url;
			theScope.modal.title = title;
			theScope.modal.show();
		};
		theScope.closeModal = function() {
			theScope.modal.hide();
			$timeout(function() {
				theScope.modal.url = "";
			}, 600);
		};
		// clean it up and avoid memory leaks
		theScope.$on('$destroy', function() {
			theScope.modal.remove();
		});

	};
	$scope.shareBackdrop = function() {
		$ionicBackdrop._element.append('<img style=" right: 0;top: 0;position: absolute; max-width: 280px;"    src="image/2000.png">');
		$ionicBackdrop.retain();
	};
	$scope.showInfo = function() {
		var confirmPopup = $ionicPopup.confirm({
			title: '资料不足',
			template: '先补全资料才能接任务',
			buttons: [{
				text: '取消'
			}, {
				text: '确认',
				type: 'button-positive',
				onTap: function(e) {
					return true;
				}
			}]
		});
		confirmPopup.then(function(res) {
			if (res) {
				$state.go('tab.profile');
			} else {
				console.log('You are not sure');
			}
		});
	};
	var ccb = function() {
		$ionicBackdrop._element.html('');
		$ionicBackdrop.release();
	};
	$ionicBackdrop._element.bind('click', function() {
		ccb();
	});
	$scope.bigIMG = function(src) {
		$ionicBackdrop._element.append('<img  style="max-height:95vh;width:100%;margin: auto;top: 0; left: 0; bottom: 0; right: 0; position: absolute;   "    src="' + src + '">');
		$ionicBackdrop.retain();
	};
})



.controller('OrderCtrl', function($scope) {
		$scope.initCommonModal($scope);




	})
	.controller('TakerListCtrl', function($scope, $stateParams) {
		$scope.params = $stateParams;
		// $scope.item = $scope.vm.cartDir.get(Number($stateParams.ProductID));

		$scope.myComp = function(taker, i) {
			return taker.order.TypeID.toString() === $stateParams.TypeID;
		};
	})
	.controller('OrderListCtrl', function($scope, $stateParams) {
		$scope.params = $stateParams;
		// $scope.item = $scope.vm.cartDir.get(Number($stateParams.ProductID));

		//		$scope.myComp = function(order, i) {
		//			return !$scope.Order.isMine(order.UserID);
		//		};
	})
	.controller('OrderListMineCtrl', function($scope, $stateParams) {
		$scope.params = $stateParams;
	})



.controller('OrderViewCtrl', function($scope, $stateParams, $q, $state, $ionicHistory, $timeout) {
	$scope.params = $stateParams;
	$scope.dealWithGo = function(order, bool) {
		if (!$scope.Profile.isInfo()) {
			$scope.showInfo();
			return false;
		}

		$scope.Taker.accept(order).then(function(TOID) {
			$ionicHistory.nextViewOptions({
				disableAnimate: true,
				disableBack: true
			});
			$state.go('tab.account');
			$timeout(function() {
				$state.go('tab.takerView', {
					TOID: TOID
				});
			}, 0);

		}, function(r) {
			if (r.status == '601115') {
				$state.go('tab.account');
				$timeout(function() {
					$state.go('tab.takerView', {
						TOID: r.code * 1
					});
				}, 0);
			}
		});
	};
	$scope.Order.get($stateParams.TaskID * 1).then(function(order) {
		$scope.order = order;
	});
	$scope.formData = {};

})

.controller('OrderViewMineCtrl', function($scope, $stateParams, $q, $state) {
	$scope.params = $stateParams;

	$scope.Order.get($stateParams.TaskID * 1).then(function(order) {
		$scope.order = order;
		if (order.isNormal() && order.TypeID === $scope.Order.typeIDcode.rich) {
			$scope.Taker.queryByTask(order.TaskID);
		}
	});

	$scope.pay = function(order) {
		order.pay().then(function() {
			alert('付款成功,任务已发布');
			//$scope.Taker.queryByTask(order.TaskID);
		});
	};

})


.controller('TakerViewCtrl', function($scope, $stateParams, IO) {
	$scope.params = $stateParams;

	$scope.Taker.get($stateParams.TOID * 1).then(function(taker) {
		$scope.taker = taker;
		if (taker.order.TypeID === $scope.Order.typeIDcode.poor) {
			$scope.WX.share({
				link: $scope.baseUrl + '/shareLink.aspx?TOID=' + taker.TOID,
				title: taker.order.Intro,
				imgUrl: taker.order.TitlePic
			});
		}
	});
	$scope.formData = {};

	$scope.saveProgress = function(TOID, lid) {
		IO.LIDsToUri([lid]).then(function(uris) {
			$scope.Taker.saveProgress(TOID, uris[0]).then(function() {
				alert('图片已上传,请等待审核');
			});
		});


	}

})



.controller('InvitationCtrl', function($scope) {

	$scope.initCommonModal($scope);
	$scope.invitedByScan = function() {
		$scope.QR.scan().then(function(r) {
			alert('你的好盆友是 : ' + r);
		});
	};

})



.controller('AccountCtrl', function($scope, $ionicActionSheet, principal, oauth, $state, trainningCourses) {
		$scope.principal = principal;
		$scope.oauth = oauth;


		$scope.initCommonModal($scope);

	})
	.controller('HelpCtrl', function($scope, $ionicActionSheet, principal, oauth, $state, trainningCourses) {

		$scope.initCommonModal($scope);

	})
	.controller('ProfileCtrl', function($scope, IO, $q, $timeout) {
		$scope.formData = {};
		var profileDetail = $scope.profileDetail = {};

		$scope.formData.submit = function() {
			window.clearEmptyKeys(profileDetail);
			var LIDs = [];
			if (this.$$circleSrcsTemp[0]) {
				LIDs.push(this.$$circleSrcsTemp[0]);
			}
			if (this.$$friendSrcsTemp[0]) {
				LIDs.push(this.$$friendSrcsTemp[0]);
			}

			if (LIDs.length > 0) {
				IO.LIDsToUri(LIDs).then(function(uris) {
					profileDetail.pic2 = uris[0] || profileDetail.pic2;
					profileDetail.pic3 = uris[1] || profileDetail.pic3;
					//update 
					$scope.Profile.edit(profileDetail).then(function() {
						alert("编辑成功");
						window.location.reload();
						$scope.$state.go('tab.account', {});
						//some keys edited sysn to info
						_.extendOwn($scope.Profile.info, profileDetail);
					});
				});
			} else {
				//update 
				$scope.Profile.edit(profileDetail).then(function() {
					alert("编辑成功");
					window.location.reload();
					$scope.$state.go('tab.account', {});
					//some keys edited sysn to info
					_.extendOwn($scope.Profile.info, profileDetail);
				});
			}

		};
		$scope.checkCount = function(arr, item, max) {
			if (item.$$isChecked === false) return; //cancel 
			var sum = 0;
			_.each(arr, function(item, i) {
				if (item.$$isChecked === true) {
					sum += 1;
				}
			});
			if (sum > max) {
				item.$$isChecked = false;
			}

		};


		$scope.initCommonModal($scope);





	})

.controller('CashWDCtrl', function($scope, $stateParams, $q, $ionicPopup) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;

		$scope.buttonD = false;
		$scope.withdraw = function() {
			var dfd = $q.defer();
			if (false && !$scope.Profile.isBS()) {
				$scope.showInfo();
				dfd.resolve();

			} else {
				$scope.buttonD = true;
				$scope.PayAccount.withdrawWx.apply(this, arguments).then(function() {
					alert('申请已提交，我们会尽快安排打款');
					$scope.buttonD = false;
					//window.location.reload();
				}, function() {
					$scope.buttonD = false;
				});
			}


			return dfd.promise;
		};


	})
	.controller('WithdrawListCtrl', function($scope, $stateParams) {
		$scope.initCommonModal($scope);
		$scope.params = $stateParams;



		$scope.loadMore = function(paramsCe) {
			$scope.keyName = $scope.$filter('getKeyName')($scope.params);
			if ($scope.PayRecord.IsLast[$scope.keyName]) return false;
			$scope.PayRecord.nextPage($scope.params)
				.then(function() {

				})
				.finally(function() {
					$scope.$broadcast("scroll.infiniteScrollComplete");
				});
		};


	})
	.controller('PublishCtrl', function($scope, IO, Time) {
		$scope.vm = {};
		$scope.vm.begin0 = new Date();
		$scope.vm.begin1 = new Date(1970, 0, 0, 0);
		$scope.vm.end0 = new Date();
		$scope.vm.end1 = new Date(1970, 0, 0, 0);
		var orderDetail = $scope.orderDetail = {
			Tags: {},
			//JoinNum: 20,
			Price: 1.00
		};
		$scope.initCommonModal($scope);
		$scope.formData = {};
		$scope.formData.submit = function() {
			if (orderDetail.TypeID === $scope.Order.typeIDcode.rich) {
				IO.LIDsToUri(this.$$srcsTemp).then(function(uris) {
					console.log(uris);
					orderDetail.BeginTime = Time.buildDate($scope.vm.begin0, $scope.vm.begin1);
					orderDetail.EndTime = Time.buildDate($scope.vm.end0, $scope.vm.end1);
					orderDetail.AttachFiles = uris;
					orderDetail.Tags.District = $scope.vm.regionResult;


					$scope.Order.publish(orderDetail, 'score2').then(function() {
						alert('付款后可发布');
						$scope.$state.go('tab.orderListMine', {
							state: 2
						});
					});
				});
			} else {
				IO.LIDsToUri(this.$$titleSrcsTemp).then(function(uris) {
					orderDetail.BeginTime = Time.buildDate($scope.vm.begin0, $scope.vm.begin1);
					orderDetail.EndTime = Time.buildDate($scope.vm.end0, $scope.vm.end1);
					orderDetail.Tags.District = $scope.vm.regionResult;
                    orderDetail.TitlePic=uris[0];

					$scope.Order.publish(orderDetail, 'score2').then(function() {
						alert('付款后可发布');
						$scope.$state.go('tab.orderListMine', {
							state: 2
						});

					});
				});
			}


		};



	})
	.controller('LoginCtrl', function($scope, $state, $ionicHistory) {
		//	$ionicHistory.nextViewOptions({
		//disableAnimate: true,
		//disableBack: true
		//});
		//
		//
		//
		//$scope.login=function(i){
		//	oauth.login(i).then(function(r){
		//		console.log(r);
		//		$state.go('tab.account');
		//	});
		//}

	});