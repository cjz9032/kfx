		var jjUrl = location.href;
		var r = jjUrl.indexOf('#');
		if (r > -1) {
			jjUrl = jjUrl.substring(0, r + 1);
		}
		$.ajax({
			type: "GET",
			url: "jj.aspx",
			data: {
				url: jjUrl,
				wxpid: window.wxpid
			},
			dataType: "json",
			success: function(r) {
				wx.config({
					debug: false,
					appId: r.appId,
					timestamp: r.timestamp,
					nonceStr: r.nonceStr,
					signature: r.signature,
					jsApiList: [
						'checkJsApi',
						'onMenuShareTimeline',
						'onMenuShareAppMessage',
						'onMenuShareQQ',
						'onMenuShareWeibo',
						'onMenuShareQZone',
						'hideMenuItems',
						'showMenuItems',
						'hideAllNonBaseMenuItem',
						'showAllNonBaseMenuItem',
						'translateVoice',
						'startRecord',
						'stopRecord',
						'onVoiceRecordEnd',
						'playVoice',
						'onVoicePlayEnd',
						'pauseVoice',
						'stopVoice',
						'uploadVoice',
						'downloadVoice',
						'chooseImage',
						'previewImage',
						'uploadImage',
						'downloadImage',
						'getNetworkType',
						'openLocation',
						'getLocation',
						'hideOptionMenu',
						'showOptionMenu',
						'closeWindow',
						'scanQRCode',
						'chooseWXPay',
						'openProductSpecificView',
						'addCard',
						'chooseCard',
						'openCard'
					]
				});
				wx.error(function(res) {
					alert(res.errMsg);
				});
				//angular.bootstrap(document.body, ["starter"]);	
			}
		});