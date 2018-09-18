

var blackList = {
	blackListQue: [],
	list: [],
	deleteList: [],
	syncReady: false,

	loadList: function() {
		chrome.storage.local.get('blackList', function (list){
			if (list.blackList != undefined) {
				blackList.list = list.blackList;
			}
			sessionList.addListeners();
		})
	},

	addToBlackListQue: function(saveObj){
		blackList.blackListQue.push(saveObj);
		if (blackList.blackListQue.length === 1){
			if (saveObj.action === 'add'){
				blackList.addScriptToBlackList(saveObj.url);
			} else {
				blackList.removeScriptFromBlackList(saveObj.url);
			}
			chrome.storage.local.set({'blackList': blackList.list}, function(){
				blackList.checkBlackListQue();
			})
		}
	},

	checkBlackListQue: function(){
		blackList.blackListQue.splice(0, 1);
		if (blackList.blackListQue.length > 0){
			var saveObj = blackList.blackListQue[0];
			if (saveObj.action === 'add'){
				blackList.addScriptToBlackList(saveObj.url);
			} else {
				blackList.removeScriptFromBlackList(saveObj.url);
			}
			blackList.checkBlackListQue();
		} else {
			chrome.storage.local.set({'blackList': blackList.list});
		}
	},

	addScriptToBlackList: function(url){
		if (!blackList.scriptInBlackList(url)){
			blackList.list.push(url);
			blackList.syncReady = true;
			
			for (var i = 0; i < blackList.deleteList.length; i++){
				if (url === blackList.deleteList[i]){
					blackList.deleteList.splice(i, 1);
					break;
				}
			}
		}
	},

	removeScriptFromBlackList: function(url){
		blackList.syncReady = true;
		for (var i = 0; i < blackList.list.length; i++){
			if (blackList.list[i] === url){
				blackList.deleteList.push(url);
				blackList.list.splice(i, 1);
				break;
			}
		}
	},

	scriptInBlackList: function(url){
		for (var k = 0; k < blackList.list.length; k++){
			if (blackList.list[k] === url){
				return true;
			}
		}
		return false;
	}
}