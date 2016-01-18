angular.module('starter.services', [])

//Profile
.service('Profile', function($http, $q, principal, MODULE_CODE_CONFIG) {
	var $this = this;
	this.isInfo = function() {
		var info = $this.info;
		return info && info.Pic2 && info.Pic3;
		//return false;
	};
	this.isWating = function() {
		return $this.info.State === 2;
	};
	this._getInfo = function() {
		$this.info = principal.getID();
		window.info = $this.info;
	};
	this.edit = function(detail, score) {
		var dfd = $q.defer();
		$http({
				method: 'GET',
				url: "/handler/Action.ashx?act=WXOpenEdit",
				params: detail
			})
			.then(function(result) {
				$this.info.State = 2;
				//_setData([orderDetail]);
				dfd.resolve();

			});
		return dfd.promise;
	};
	this.getTags = function() {
		return $http({
				method: 'GET',
				url: "/tag.aspx",
			})
			.then(function(result) {
				var groupsByModuleCode = _.groupBy(result.data, function(tag) {
					return tag.ModuleCode;
				});
				_.each($this.moduleCode, function(module, i) {
					$this.tags[module.tag] = groupsByModuleCode[module.code];
				});

			});
	};

	this.putTags = function() {
		var r = [];
		_.each(tags, function(tagss) {
			_.each(tagss, function(tag) {
				if (tag.$$isChecked === true)
					r.push(tag.TagID);
			});
		});
		return $http({
				method: 'GET',
				url: "/handler/weixin.ashx?act=EditInfo",
				params: {
					tag: r
				}
			})
			.then(function(result) {
				console.log(result);
			});

	};

	this.moduleCode = MODULE_CODE_CONFIG.data;
	this.tags = {};
	this.dailySendTags = [{
		name: "3次以内",
		tid: 0
	}, {
		name: "5次以内",
		tid: 1
	}, {
		name: "10次以内",
		tid: 2
	}];
	this.dailyRecvTags = [{
		name: "3条以内",
		tid: 0
	}, {
		name: "5条以内",
		tid: 1
	}, {
		name: "10条以内",
		tid: 2
	}];




})

.service('Taker', function($q, $timeout, $http, Order, bitOP, Profile) {
	var $this = this;
	this.phase = {};
	this.data = [];

	function TakerData(initObj) {
		_.map(initObj, function(val, key) {
			this[key] = val;
		}, this);
	};
	TakerData.prototype = {
		isDeal: function() {
			return this.State === 1;
		},
		isAccept: function() {
			return this.State === 1;
		},
		isUpload: function() {
			return this.State === 4;
		},
		isIMGAccept: function() {
			return this.State === 8;
		},
		isIMGReject: function() {
			return this.State === 16;
		},
		isComplete: function() {
			return this.State === 32;
		},
		isText: function() {
			return this.isDeal() ? "请上传截图" :
				this.isUpload() ? '审核中' :
				this.isIMGAccept() ? '审核通过' :
				this.isIMGReject() ? '审核不通过' :
				this.isComplete() ? '结算完成' : '未知'
		},
		setIMGAccept: function() {
			this.State = 8;
			this.order.OrderNum += 1;
			// this.order.OrderAmount+= user.get this.UserID;
		},
		setIMGReject: function() {
			this.State = 8;
		}
	};


	function _bindOrder(taker) {
		var dfd = $q.defer();
		Order.get(taker.TaskID).then(function(order) {
			taker.order = order;
			dfd.resolve();
		}, function() {
			console.log('无taskid');
		});
		return dfd.promise;
	}

	function _setData(items) {
		var promises = [];
		_.each(items, function(item, index, list) {
			if (!!_.findWhere($this.data, {
					TOID: item.TOID
				})) {
				return false;
			} else {
				item.AttachFiles ? typeof item.AttachFiles === 'string' ? item.AttachFiles = item.AttachFiles.split(',') : 0 : 0;
				var dfd = $q.defer();
				promises.push(dfd.promise);
				_bindOrder(item).then(function() {
					var item2 = new TakerData(item);
					$this.data.push(item2);
					dfd.resolve();
				});
			}
		});

		return $q.all(promises);
	}
	this.get = function(ID) {
		var dfd = $q.defer();
		var r = _.findWhere($this.data, {
			TOID: ID
		});
		if (r) dfd.resolve(r)

		else {
			$this.query({
				TOID: ID
			}, true).then(function(items) {
				var r = _.findWhere($this.data, {
					TOID: ID
				});
				if (r) dfd.resolve(r)
			});
		}
		return dfd.promise;
	};
	this.queryMine = function() {
		return this.query({
			UserID: Profile.info.UserID
		});
	};
	this.queryByTask = function(TaskID) {
		return this.query({
			TaskID: TaskID,
			State: 4
		}, true);
	};
	this.query = function(params, force) {
		var dfd = $q.defer();
		if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
			$this.phase.query = dfd.promise;
			dfd.reject();
		} else {
			$this.phase.query = dfd.promise;
			$http({
					method: 'GET',
					url: "/aspx/TOList.aspx",
					params: params
				})
				.then(function(response) {
					var r = response.data;
					_setData(r).then(function() {
						dfd.resolve();
					});
				});

		}

		return dfd.promise;
	};


	function _dealNInfo(order, accept) {
		var dfd = $q.defer();
		if (Profile.isInfo()) {
			if (order.TypeID === Order.typeIDcode.rich && Profile.isWating()) {
				alert('估价中,请耐心等待');
			} else {
				_deal(order, accept).then(function(TOID) {
					dfd.resolve(TOID);
				}, function(r) {
					dfd.reject(r);
				});
			}
		} else {
			dfd.reject();
		}
		return dfd.promise;
	}

	function _deal(order, accept) {
		var newTask = {};
		//fake request
		var dfd = $q.defer();
		if (false) {
			dfd.reject();
		} else {
			if (false && (Profile.info.Rate5 > (order.Budget - order.JoinAmount))) {
				alert('任务预算不足--');
				dfd.reject();
			} else {
				$http({
						method: 'GET',
						url: "/handler/Task.ashx?act=NewTaskOrder",
						params: {
							TaskID: order.TaskID
						}
					})
					.then(function(result) {
						var r = result.data;
						if (r.status === '0') {
							newTask.TOID = r.code * 1;
							newTask.TaskID = order.TaskID;
							newTask.UserID = Profile.info.UserID;
							newTask.SUserID = order.SUserID;
							newTask.State = 1;
							_setData([newTask]).then(function() {
								dfd.resolve(newTask.TOID);
							});
						} else {
							alert(r.msg);
							dfd.reject(r);
						}

					});
			}




		}


		return dfd.promise;
	};

	this.accept = function(order) {
		return _dealNInfo(order, true);
	};

	this.reject = function(order) {
		return _dealNInfo(order, false);
	};

	this.saveProgress = function(ID, src) {
		var dfd = $q.defer();
		$this.get(ID).then(function(taker) {
			$http({
					method: 'GET',
					url: "/handler/Task.ashx?act=UploadTaskOrder",
					params: {
						TOID: ID,
						AttachFiles: [src]
					}
				})
				.then(function(result) {
					var r = result.data;
					if (r.status === '0') {
						taker.AttachFiles = [src];
						taker.State = 4;
						dfd.resolve();
					} else {
						alert(r.msg);
						dfd.reject();
					}
				});
		});




		return dfd.promise;

	};

})


.service('Order', function($q, $timeout, $http, scores, Profile, STATE_CONFIG, Region) {
	var $this = this;
	this.phase = {};
	this.data = [];
	this.typeIDcode = {
		rich: 100001,
		poor: 100002
	};

	function OrderData(initObj) {
		_.map(initObj, function(val, key) {
			this[key] = val;
		}, this);
		//alias
		this.pay = this.setNormal;
	};
	this.stateCode = STATE_CONFIG.data.Order;
	OrderData.prototype = {
		isNormal: function() {
			return this.State === $this.stateCode.Normal.No;
		},
		isUnpaid: function() {
			return this.State === $this.stateCode.Unpaid.No;
		},
		isStopped: function() {
			return this.State === $this.stateCode.Stopped.No;
		},
		isCompeleted: function() {
			return this.State === $this.stateCode.Compeleted.No;
		},
		setNormal: function() {
			var order = this;
			var dfd = $q.defer();
			$http({
					method: 'GET',
					url: "/handler/Task.ashx?act=PayTask",
					params: {
						TaskID: order.TaskID
					}
				})
				.then(function(response) {
					var r = response.data;
					if (r.status === '0') {
						order.State = $this.stateCode.Normal.No;
						Profile.info.Score -= order.Budget;
						//console.log($this.data);
						dfd.resolve();
					} else {
						alert(r.msg);
						dfd.reject();
					}

				});
			return dfd.promise;
		},
		setUnpaid: function() {
			this.State = $this.stateCode.Unpaid.No;
			return this;
		},
		setStopped: function() {
			this.State = $this.stateCode.Stopped.No;
			return this;
		},
		setCompeleted: function() {
			this.State = $this.stateCode.Compeleted.No;
			return this;
		}
	};

	function _setData(items) {
		_.each(items, function(item, index, list) {
			if (!!_.findWhere($this.data, {
					TaskID: item.TaskID
				})) {
				return false;
			} else {
				//fix files , isMine ,Tags
				item.AttachFiles ? typeof item.AttachFiles === 'string' ? item.AttachFiles = item.AttachFiles.split(',') : 0 : 0;
				item.isMine = $this.isMine(item.SUserID);
				item.Tags = JSON.parse(item.Tags);
				//add isTags
				Profile.info.District ? item.isTags = Region.isRuling(Profile.info.District, item.Tags.District) : 0; 
				var item2 = new OrderData(item);
				$this.data.push(item2);
			}
		});

		return this.data;
	}
	this.publish = function(orderDetail, score) {
		var dfd = $q.defer();
		$http({
				method: 'GET',
				url: "/handler/Task.ashx?act=NewTask",
				params: orderDetail
			})
			.then(function(response) {
				var r = response.data;
				if (r.status === '0') {
					orderDetail.TaskID = r.code * 1;
					orderDetail.SUserID = Profile.info.UserID;
					orderDetail.State = $this.stateCode.Unpaid.No;
					_setData([orderDetail]);
					console.log($this.data);
					dfd.resolve();
				} else {
					alert(r.msg);
					dfd.reject();
				}

			});
		return dfd.promise;
	};
	this.isMine = function(userID) {
		return userID === Profile.info.UserID;
	};
	this.get = function(ID) {
		var dfd = $q.defer();
		var r = _.findWhere($this.data, {
			TaskID: ID
		});
		if (r) dfd.resolve(r)

		else {
			$this.query({
				TaskID: ID
			}, true).then(function(items) {
				var r = _.findWhere($this.data, {
					TaskID: ID
				});
				if (r) {
					dfd.resolve(r)
				} else {
					dfd.reject();
				}
			});
		}
		return dfd.promise;
	};
	this.queryAll = function() {
		var promises = [],
			others = {
				State: 0,
				others: 1,
				
			},
			// District: Profile.info.District
			mine = {
				self: 'true'
			};
			//if(Profile.info.District) promises.push(this.query(others, true));
		
		promises.push(this.query(mine, true));
		return $q.all(promises);
	}
	this.query = function(params, force) {
		var dfd = $q.defer();
		if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
			$this.phase.query = dfd.promise;
			dfd.reject();
		} else {

			$this.phase.query = dfd.promise;
			$http({
					method: 'GET',
					url: "/aspx/orderList.aspx",
					params: params
				})
				.then(function(result) {
					var r = result.data;
					dfd.resolve(_setData(r));
				});

		}

		return dfd.promise;
	};
	this.acceptIMG = function(taker) {
		var dfd = $q.defer();
		$http({
				method: 'GET',
				url: "/handler/Task.ashx?act=PassTaskOrder",
				params: {
					TOID: taker.TOID
				}
			})
			.then(function(result) {
				var r = result.data;
				console.log(r);
				if (r.status === '0') {
					console.log(taker);
					console.log(taker.State);
					taker.setIMGAccept();
					console.log(taker.State);
				} else {
					alert(r.msg);
					dfd.reject(r);
				}

			});
		return dfd.promise;
	};
	this.rejectIMG = function(taker) {
		var dfd = $q.defer();
		$http({
				method: 'GET',
				url: "/handler/Task.ashx?act=RejectMicture",
				params: {
					TOID: taker.TOID
				}
			})
			.then(function(result) {
				var r = result.data;
				if (r.status === '0') {
					taker.setIMGReject;
				} else {
					alert(r.msg);
					dfd.reject(r);
				}

			});
		return dfd.promise;
	};





})








.service('scores', function($q, $timeout, $http) {
	var $this = this;


	function Score(initObj) {

		_.map(initObj, function(val, key) {
			this[key] = val;
		}, this);
	};
	Score.prototype = {
		consume: function(num) {
			var tmp = this.Point - num * this.ExRate;
			if (tmp >= 0) {
				this.Point = tmp;
				return function rollback() {
					this.Point += num * this.ExRate;
				};
			} else {
				return false;
			}

		},
		produce: function(num) {
			this.Point += num * this.ExRate;
			return true;

		},

	};

	this.score1 = new Score({
		Title: "余额",
		$$Icon: "￥",
		ExRate: 1,
		Point: 0
	});
	this.score2 = new Score({
		Title: "积分",
		$$Icon: "$",
		ExRate: 10,
		Point: 0
	});

})

.service('PayAccount', function($q, $timeout, $http, $filter, Profile, PAYWAYNO_CONFIG) {
		var $this = this;
		this.data = [];
		this.payWayNoCode = PAYWAYNO_CONFIG;

		function _setData(items) {
			if (items.length) {
				_.each(items, function(item, index, list) {
					$this.data.push(item);
				});
			}
			return $this.data;
		}

		this.get = function(ID) {
			var dfd = $q.defer();
			var r = _.findWhere($this.data, {
				PAID: ID
			});
			if (r) dfd.resolve(r)

			else {
				dfd.reject(r)
			}
			return dfd.promise;
		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			var params2 = $filter('setSD')(params);
			$http({
					method: 'GET',
					url: "/aspx/payAccount.aspx",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					dfd.resolve(_setData(r.data));
				});


			return dfd.promise;
		};
		this.getAll = function(params, force) {
			return this.query(params, force).then(function() {
				var r = _.find($this.data, function(ac) {
					return ac.PayWayNo == $this.payWayNoCode.Wx;
				});
				if ((!r) && window.wx) {
					$this.newWX();
				}
			});
		};
		this.newWX = function() {
			var account = {}
			account.CardNo = Profile.info.FakeID;
			account.Outeruser = Profile.info.FakeID;
			account.PayWayNo = $this.payWayNoCode.Wx;
			account.Bank = "微信支付";
			account.Title = Profile.info.NickName || Profile.info.LastName || 'FLNull';
			account.FullName = Profile.info.NickName || Profile.info.LastName || 'FLNull';
			$this.editCard(account).then(function() {
				console.log('自动新增微信payaccount');
				console.log($this.data);
			});
		}
		this.editCard = function(account) {
			var dfd = $q.defer();

			var fixID = account.PAID,
				accountSuffix = $filter('setTableSuffix')(account, 'payAccount'),
				params2 = accountSuffix;
			params2.UserID = Profile.info.UserID;
			if (fixID) {
				params2.PAID = fixID
			}
			$http.post("/handler/customer.ashx?act=PayAccountEdit", params2)
				.then(function(result) {
					var r = result.data;
					if (r.status === '0') {
						if (account.PAID) {

						} else {
							$this._PAIDFix().then(function(id) {
								account.UserID = Profile.info.UserID;
								account.PAID = id;
								dfd.resolve(_setData([account]));
							});
						}
					} else {
						alert(r.msg);
						dfd.reject();
					}

				});
			return dfd.promise;
		};
		this._PAIDFix = function() {
			var params2 = $filter('setSD')({});
			var dfd = $q.defer();
			$http({
					method: 'GET',
					url: "/aspx/payAccount.aspx",
					params: params2
				})
				.then(function(result) {
					var r = result.data;
					dfd.resolve(r.data[0].PAID);
				});
			return dfd.promise;
		};
		this.withdrawWx = function(id, amount) {
			var ac = _.find($this.data, function(ac) {
				return ac.PayWayNo == $this.payWayNoCode.Wx;
			});
			return $this.withdraw(ac.PAID, amount);
		};
		this.withdraw = function(id, amount) {
			var dfd = $q.defer();
			//var back = Profile.consume(amount, 'Deposit');
			//	if (back) {
			var param = $filter('setTableSuffix')({
				PAID: id,
				safepwd: Profile.info.Cipher2,
				amount: amount
			}, 'withdraw');
			var params2 = $filter('setSD')(param);

			$http.post("/handler/customer.ashx?act=Withdraw", params2)
				.then(function(result) {
					var r = result.data;
					if (r.status === '0') {
						Profile.info.Score -= amount;
						dfd.resolve();
					} else {
						//back
						//back();  
						alert(r.msg);

						dfd.reject();
					}
				});
			//		} else {
			//			alert('金额不足');
			//			dfd.reject();
			//		}

			return dfd.promise;
		};

	})
	.service('PayRecord', function($q, $timeout, $http, $filter, principal, Profile) {

		var $this = this,
			PageNum = {};
		this.phase = {};
		this.data = [];
		this.IsLast = {};


		function _setData(items) {
			if (items.length) {
				_.each(items, function(item, index, list) {
					$this.data.push(item);
				});
			}
			return $this.data;
		}

		this.get = function(ID) {
			var dfd = $q.defer();
			var r = _.findWhere($this.data, {
				PayID: ID
			});
			if (r) dfd.resolve(r)

			else {
				dfd.reject(r)
			}
			return dfd.promise;
		};
		this.nextPage = function(paramsCe) {


			var keyName = $filter('getKeyName')(paramsCe),
				paramsCe = _.clone(paramsCe),
				next_page = PageNum[keyName] ? ++PageNum[keyName] : PageNum[keyName] = 1,
				params = _.extendOwn(paramsCe, {
					page: next_page
				});

			return $this.query(params).then(function() {}, function() {
				$this.IsLast[keyName] = true;
				PageNum[keyName] -= 1;
			})

		};
		this.query = function(params, force) {
			var dfd = $q.defer();
			if ((!force) && $this.phase.query && $this.phase.query.state === 0) {
				dfd.reject();
			} else {
				$this.phase.query = dfd.promise;
				params.SUserID = Profile.info.UserID;
				params.CUserID = Profile.info.SUserID;

				$http({
					method: 'GET',
					url: "/aspx/PayRecord.aspx",
					params: params
				})

				.then(function(result) {
					var r = result.data;
					if (r.data.length) {
						dfd.resolve(_setData(r.data));
					} else {
						dfd.reject(r);
					}
				});

			}

			return dfd.promise;
		};




	})

.service('Login2Initial', function($q, $timeout, scores, Profile, Order, Taker, Profile, Region, PayAccount) {
		this.init = function(data) {
			var secondP = [];
			//info 
			Profile._getInfo();
			secondP.push(Order.queryAll());
			secondP.push(Profile.getTags());
			secondP.push(Region.getRegion());
			secondP.push(PayAccount.getAll({}));
			return $q.all(secondP).then(function() {
				taker = Taker.queryMine();
			});
		};


	})
	.factory("tabsCtrlInitialData", function($q, authorization) {

		return function() {

			var authorizeFirst, secondP = [];

			authorizeFirst = authorization.authorize();
			return $q.all([authorizeFirst]).then(function(results) {
				return {
					authorize: results
				};
			});
		}
	})
	.factory("profileCtrlInitialData", function($q) {

		return function() {
			return 1;
		}
	});