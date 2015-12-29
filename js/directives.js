var shopDirectives = angular.module('starter.directives', [])


.directive('hideTabs', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attributes) {
			scope.$watch(attributes.hideTabs, function(value) {
				$rootScope.hideTabs = value;
			});

			scope.$on('$destroy', function() {
				$rootScope.hideTabs = false;
			});
		}
	};
})

.directive('fixHistory', function() {
		return {
			restrict: 'A',
			scope: {
				boolIf: "=",
				where: "@",
				params: '='
			},
			controller: function($scope, $ionicHistory, $state) {
$scope.boolIf = ($ionicHistory.currentView().index === 0);
				$scope.goRoot = function() {


					$ionicHistory.nextViewOptions({
						disableAnimate: true,
						disableBack: true,
						historyRoot: true
					});
					$scope.params = $scope.params || {};
					$state.go($scope.where, $scope.params);
				}
			},
			link: function($scope, element, attributes) {
				element.bind('click', $scope.goRoot);


			}

		};
	})
	.directive('regionSelect', function() {
		return {
			restrict: 'E',
			scope: {
				wrapRegion: "=",
				auto: "@",
				result: "=",
				initRegion: "=",
				force: "@"
			},
			controller: function($scope, Region, geo) {
				$scope.getIntKeys = function(obj) {
					return _.map(_.keys(obj), function(str) {
						return parseInt(str);
					});
				}

				$scope.Region = Region;
				if (!$scope.wrapRegion) {
					$scope.wrapRegion = {};
				}
				var wrapRegion = $scope.wrapRegion;
				if (!$scope.force) $scope.force = 'false';
				$scope.$watch('wrapRegion', function(newV, oldV) {
					//什么都没选中..
					if (!wrapRegion.province) return false;
					//ng-option help to clear under selected region 
					//1-3级全部选中
					if ($scope.force === 'false') {
						//直辖 
						if (Region.isDirect($scope.regions[wrapRegion.province])) {
							$scope.result = wrapRegion.province;
						}
						//3级
						else {
							$scope.result = wrapRegion.district;
						}
					}
					//选中什么算什么..
					else {
						$scope.result = wrapRegion.district || wrapRegion.city || wrapRegion.province;
					}

				}, true);



				Region.getRegion().then(function(data) {
					$scope.regions = data;
					if ($scope.auto) {
						geo.getIPGeo().then(function(rcity) {
							console.log(rcity);
						})
					}
					if ($scope.initRegion) {
						var parents = Region.getParents($scope.initRegion);
						wrapRegion.province = parents[5];
						wrapRegion.city = parents[7];
						wrapRegion.district = parents[9];

					}
				});
			},
			templateUrl: 'region-select.html'
		};
	})

.directive('timeFix', function() {
	return {
		restrict: 'A',
		link: function($scope, element, attributes) {
			//element.prop.('value')
		}

	};
});