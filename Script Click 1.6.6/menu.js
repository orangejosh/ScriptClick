
var backgroundPage = chrome.extension.getBackgroundPage();

var menuButtons = {
	expand: false,

	initButtons: function(){
		menuButtons.disableButton.element.addEventListener('click', function (){
			menuButtons.disableButton.toggle();
		}, false);

		menuButtons.blockAllButton.element.addEventListener('click', function (){
			menuButtons.blockAllButton.toggle();
		}, false);

		menuButtons.refreshButton.element.addEventListener('click', function (){
			menuButtons.refreshButton.toggle();
		}, false);

		menuButtons.adButton.element.addEventListener('click', function (){
			menuButtons.adButton.toggle();
		}, false);

		menuButtons.mediaButton.element.addEventListener('click', function (){
			menuButtons.mediaButton.toggle();
		}, false);

		menuButtons.syncButton.element.addEventListener('click', function (){
			menuButtons.syncButton.toggle();
		}, false);


		if (backgroundPage.scriptDisabled === true){
			menuButtons.disableButton.element.childNodes[0].src = 'images/off.png';
			menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOff.png';
		}

		if (backgroundPage.blockAllScriptsOn && !backgroundPage.scriptDisabled){
			menuButtons.blockAllButton.element.childNodes[0].src = 'images/block.png';
		}

		if (backgroundPage.filtersEnabled === true && backgroundPage.scriptDisabled === false){
			menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOn.png';
		}

		if (backgroundPage.mediaList.checkList(backgroundPage.sessionList.currentSubDomain) === true 
			&& backgroundPage.scriptDisabled === false){
			menuButtons.mediaButton.element.childNodes[0].src = 'images/mediaBlock.png';
		}

		if (backgroundPage.blackList.syncReady === true){
			menuButtons.syncButton.element.childNodes[0].src = 'images/syncOn.png';
		}

		var tabSubDomain = backgroundPage.sessionList.currentSubDomain
		if (backgroundPage.filtersEnabled && backgroundPage.whiteList.getIndex(tabSubDomain) >= 0){
			display.displayWhiteList();
		}
	},

	disableButton: {
		element: document.getElementById('disable'),

		toggle: function(){
			backgroundPage.scriptDisabled = !backgroundPage.scriptDisabled;
			if (backgroundPage.scriptDisabled){
				chrome.browserAction.setIcon({path: "images/scriptDisable.png"});
				menuButtons.disableButton.element.childNodes[0].src = 'images/off.png';
				menuButtons.blockAllButton.element.childNodes[0].src = 'images/unBlock.png';
				menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOff.png';
				menuButtons.mediaButton.element.childNodes[0].src = 'images/media.png';

				backgroundPage.scriptList.ruleList = {};
				backgroundPage.elementList.ruleList = {};
			} else {
				chrome.browserAction.setIcon({path: "images/scriptOff.png"});
				menuButtons.disableButton.element.childNodes[0].src = 'images/on.png';
				if (backgroundPage.blockAllScriptsOn){
					menuButtons.blockAllButton.element.childNodes[0].src = 'images/block.png';
					chrome.browserAction.setIcon({path: "images/scriptOn.png"});
				}
				if (backgroundPage.filtersEnabled === true){
					menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOn.png';
				}
				if (backgroundPage.mediaList.checkList(backgroundPage.sessionList.currentSubDomain) === true ){
					menuButtons.mediaButton.element.childNodes[0].src = 'images/mediaBlock.png';
				}

				backgroundPage.loadFilters();
			}
			try {
				scriptList.setRefresh();
			} catch (err){
				display.setRefreshButton(true);
			}

			chrome.storage.local.get('options', function (obj){
				obj.options.scriptDisabled = backgroundPage.scriptDisabled;
				chrome.storage.local.set(obj, function(){
					if (backgroundPage.scriptDisabled){
						var blockList = document.getElementById('blockList');
						if (blockList !== undefined && blockList !== null){
							while (blockList.firstChild){
								blockList.removeChild(blockList.firstChild);
							}
						}
					}
					try{
						scriptList.init();
					} catch(err){}
				})
			})			
		}
	},

	blockAllButton: {
		element: document.getElementById('blockButton'),

		toggle: function(){
			if (backgroundPage.scriptDisabled){
				return;
			}

			try {
				scriptList.setRefresh();
			}catch(err){
				display.setRefreshButton(true);
			}

			backgroundPage.blockAllScriptsOn = !backgroundPage.blockAllScriptsOn;

			if (backgroundPage.scriptDisabled){
				menuButtons.disableButton.toggle();
			}
			if (backgroundPage.blockAllScriptsOn){
				menuButtons.blockAllButton.element.childNodes[0].src = 'images/block.png';
				chrome.browserAction.setIcon({path: "images/scriptOn.png"});
			} else {
				menuButtons.blockAllButton.element.childNodes[0].src = 'images/unBlock.png';
				chrome.browserAction.setIcon({path: "images/scriptOff.png"});
			}

			chrome.storage.local.get('options', function (obj){
				obj.options.blockAllScripts = backgroundPage.blockAllScriptsOn;
				chrome.storage.local.set(obj, function(){
					if (backgroundPage.blockAllScriptsOn){
						var scriptButtons = document.getElementsByClassName('scriptButton');
						for (var i = 0; i < scriptButtons.length; i++){
							scriptButtons[i].style.color = 'red';
						}
					} else {
						var blockList = document.getElementById('blockList');
						if (blockList !== undefined && blockList !== null){
							while (blockList.firstChild){
								blockList.removeChild(blockList.firstChild);
							}
							try{
								scriptList.init();
							} catch (err){}
						}
					}
				})
			})
		}
	},

	refreshButton: {
		element: document.getElementById('refresh'),

		toggle: function(){
			if (backgroundPage.scriptDisabled){
				if (document.getElementById('blockList') !== undefined){
					document.getElementById('infoBack').style.position = 'static'
				}
			} else {
				document.getElementById('infoBack').style.position = 'fixed'
			}

			menuButtons.refreshButton.element.childNodes[0].src = 'images/refresh.png';

			try {
				if (scriptList.list != undefined){
					scriptList.refresh = false;	
				}
			}catch(err){
				display.setRefreshButton(false);
			}

			chrome.tabs.query({active:true, currentWindow: true}, function (tabs){
				var scriptButtons = document.getElementsByClassName('scriptButton');
				for (var i = 0; i < scriptButtons.length; i++){
					if (scriptButtons[i].style.color !== 'red'){
						scriptButtons[i].style.color = 'darkgray';
						scriptButtons[i].style.backgroundColor = 'white';
					}
				}

				for (var i = 0; i < scriptList.list.length; i++){
					scriptList.list[i].active = false;
				}

				var tabSubDomain = backgroundPage.sessionList.extractSubDomain(tabs[0].url);
				if (backgroundPage.whiteList.getIndex(tabSubDomain) >= 0){
					display.displayWhiteList();
				} else {
					display.hideWhiteList();
				}

				chrome.tabs.executeScript(tabs[0].id, {code: 'window.location.reload();'});
			});
		}
	},

	adButton: {
		element: document.getElementById('fanBoy'),

		toggle: function(){
			if (backgroundPage.scriptDisabled === true){
				return;
			}

			if (backgroundPage.filtersEnabled){
				backgroundPage.setFiltersEnabled(false);
				menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOff.png';


				backgroundPage.scriptList.ruleList.easyList = undefined;
				backgroundPage.elementList.ruleList.easyList = undefined;

				backgroundPage.scriptList.ruleList.easyPrivacy = undefined;
				backgroundPage.elementList.ruleList.easyPrivacy = undefined;

				backgroundPage.scriptList.ruleList.fanboySocial = undefined;
				backgroundPage.elementList.ruleList.fanboySocial = undefined;

				backgroundPage.scriptList.ruleList.fanboyAnnoy = undefined;
				backgroundPage.elementList.ruleList.fanboyAnnoy = undefined;

				backgroundPage.scriptList.ruleList.fanboyTracker = undefined;
				backgroundPage.elementList.ruleList.fanboyTracker = undefined;

			} else {
				backgroundPage.setFiltersEnabled(true);
				menuButtons.adButton.element.childNodes[0].src = 'images/fanBoyOn.png';
				backgroundPage.loadLists();
			}
			try {
				scriptList.setRefresh();
			} catch (err) {
				display.setRefreshButton(true);
			}
		}
	},

	mediaButton: {
		element: document.getElementById('media'),

		toggle: function() {
			if (backgroundPage.scriptDisabled === true){
				return;
			}

			if (backgroundPage.mediaList.checkList(backgroundPage.sessionList.currentSubDomain) === false){
				backgroundPage.mediaList.addToList(backgroundPage.sessionList.currentSubDomain);
				menuButtons.mediaButton.element.childNodes[0].src = 'images/mediaBlock.png';
			} else {
				backgroundPage.mediaList.removeFromList(backgroundPage.sessionList.currentSubDomain);
				menuButtons.mediaButton.element.childNodes[0].src = 'images/media.png';
			}
		},
	},

	syncButton: {
		element: document.getElementById('sync'),

		toggle: function(){
			menuButtons.syncButton.element.childNodes[0].src = 'images/sync.png';
			backgroundPage.blackList.syncReady = false;
			chrome.storage.sync.get(null, function (syncData){
				var theSyncList = syncList.combineLists(syncData);
				var blackList = backgroundPage.blackList.list;
				var mediaList = backgroundPage.mediaList.list;
				var whiteList = backgroundPage.whiteList.list;

				theSyncList = syncList.checkForOldList(theSyncList);
				theSyncList = syncList.checkDeleteList(theSyncList);
				theSyncList = syncList.checkSyncList(theSyncList, blackList, mediaList, whiteList);
				syncList.checkLocalList(theSyncList, blackList, mediaList, whiteList);

				var saveLists = syncList.separateSyncLists(theSyncList);

				chrome.storage.sync.set(saveLists, function(){
					syncList.showSyncBox();
				});
			});
		}
	}
}

var syncList = {
	combineLists: function(lists){
		var syncList = [];
		if (lists === undefined){
			return syncList;
		}
		for (var i in lists){
			syncList = syncList.concat(lists[i]);
		}
		return syncList;
	},

	separateSyncLists: function(list){
		var key = '0';
		var newObj = {[key]: []};

		for (var i = list.length - 1; i >= 0; i--){
			var script = list.pop(i);
			newObj[key].push(script);

			if (!this.listWithinLimit(newObj[key])){
				newObj[key].pop(newObj[key].length - 1);
				var numKey = parseInt(key);
				numKey++;
				key = numKey.toString();
				newObj[key] = [script];
			}
		}
		return newObj;
	},

	listWithinLimit: function(list) {
		var bytes = 0;
		for (var i = 0; i < list.length; i++){
			bytes += list[i].length * 2;
		}
		return bytes < 8000;
	},

	checkForOldList: function(list){
		for (var i = 0; i < list.length; i++){
			var arrayList = list[i].split(' ');
			if (arrayList[0] !== 'blackList'
				&& arrayList[0] !== 'mediaList'
				&& arrayList[0] !== 'whiteList')
			{
				list[i] = 'blackList ' + arrayList[0];
			}
		}

		return list;
	},

	checkDeleteList: function(list) {
		var deleteList = backgroundPage.blackList.deleteList;
		for (var i = 0; i < deleteList.length; i++){
			var deleteScript = 'blackList ' + deleteList[i];
			var index = list.indexOf(deleteScript);
			if (index >= 0){
				list.splice(index, 1);
			}
		}
		var deleteList = backgroundPage.mediaList.deleteList;
		for (var i = 0; i < deleteList.length; i++){
			var deleteScript = 'mediaList ' + deleteList[i];
			var index = list.indexOf(deleteScript);
			if (index >= 0){
				list.splice(index, 1);
			}
		}
		var deleteList = backgroundPage.whiteList.deleteList;
		for (var i = 0; i < deleteList.length; i++){
			var deleteScript = 'whiteList ' + deleteList[i].url;
			for (var j = 0; j < deleteList[i].filters.length; j++){
				deleteScript = deleteScript + ' ' + deleteList[i].filters[j];
			}

			var index = list.indexOf(deleteScript);
			if (index >= 0){
				list.splice(index, 1);
			}
		}
		return list;
	},

	checkLocalList: function(syncList, blackList, mediaList, whiteList){
		for (var i = 0; i < syncList.length; i++){
			var listArray = syncList[i].split(' ');

			if (listArray[0] === 'blackList'){
				if (blackList.indexOf(listArray[1]) < 0){
					backgroundPage.blackList.list.push(listArray[1]);
				}
			} else if (listArray[0] === 'mediaList'){
				if (mediaList.indexOf(listArray[1]) < 0){
					backgroundPage.mediaList.list.push(listArray[1]);
				}
			} else if (listArray[0] === 'whiteList'){
				var inList = false;
				for (var j = 0; j < whiteList.length; j++){
					if (whiteList[j].url === listArray[1]){
						inList = true;
						break;
					}
				}
				if (inList === false){
					var whiteObj = {'url': listArray[1], 'filters': []};
					for (var j = 2; j < listArray.length; j++){
						whiteObj.filters.push(listArray[j]);
					}
					backgroundPage.whiteList.list.push(whiteObj);
				}
			} else {
				if (blackList.indexOf(listArray[0]) < 0){
					backgroundPage.blackList.list.push(listArray[0]);
				}
			}
		}
		chrome.storage.local.set({'blackList': backgroundPage.blackList.list});
		chrome.storage.local.set({'mediaList': backgroundPage.mediaList.list});
		chrome.storage.local.set({'whiteList': backgroundPage.whiteList.list});
	},

	checkSyncList: function(syncList, blackList, mediaList, whiteList){
		for (var i = 0; i < blackList.length; i++){
			var localScript = 'blackList ' + blackList[i];
			if (syncList.indexOf(localScript) < 0){
				syncList.push(localScript);
			}
		}
		for (var i = 0; i < mediaList.length; i++){
			var localScript = 'mediaList ' + mediaList[i];
			if (syncList.indexOf(localScript) < 0){
				syncList.push(localScript);
			}
		}
		for (var i = 0; i < whiteList.length; i++){
			var localScript = 'whiteList ' + whiteList[i].url;
			for (var j = 0; j < whiteList[i].filters.length; j++){
				localScript = localScript + ' ' + whiteList[i].filters[j]
			}

			if (syncList.indexOf(localScript) < 0){
				syncList.push(localScript);
			}
		}
		return syncList;
	},


	showSyncBox: function(){
		var box = document.getElementById('syncBox');
		box.style.display = 'block';
		setTimeout(this.hideSyncBox, 1000);	
	},

	hideSyncBox: function(){
		var box = document.getElementById('syncBox');
		box.style.display = 'none';
	}	
}


var display = {

	displayWhiteList: function(){
		var whiteListDisplay = document.getElementById('whiteListDisplay');
		whiteListDisplay.style.display = 'block';
	},

	hideWhiteList: function(){
		var whiteListDisplay = document.getElementById('whiteListDisplay');
		whiteListDisplay.style.display = 'none';		
	},

	displayNoScript: function(popupList){
		popupList.style.top = '25px';
		var noScriptText = document.createElement('p');
		noScriptText.textContent = 'No scripts? Try refreshing the page.'
		noScriptText.className = 'noScripts';
		popupList.appendChild(noScriptText);	
	},

	setRefreshButton: function(on){
		var refreshButton = document.getElementById('refresh');
		if (on === true){
			refreshButton.childNodes[0].src = 'images/refreshOn.png';
		} else {
			refreshButton.childNodes[0].src = 'images/refresh.png';
		}
	},
}

menuButtons.initButtons();





