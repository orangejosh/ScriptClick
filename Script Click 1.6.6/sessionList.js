

var sessionList = {
	list: {},
	currentDomain: undefined,
	currentSubDomain: undefined,
	currentTabId: undefined,
	currentURL: undefined,

	addListeners: function(){
		chrome.tabs.onActivated.addListener(function (activeInfo) {
			sessionList.setCurrentTab();

			if (sessionList.list[activeInfo.tabId] === undefined){
				sessionList.list[activeInfo.tabId] = [];
			}
		});

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			sessionList.checkCurrentTab(tabId);
			sessionList.cleanSessionList();
		});

		chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
			delete sessionList.list[tabId];
		})

		chrome.webRequest.onBeforeSendHeaders.addListener(
			sessionList.setSessionData,
			{urls: ['<all_urls>'], types: ['main_frame']},
			["requestHeaders","blocking"]
		);

		chrome.webRequest.onHeadersReceived.addListener(
			sessionList.processMedia,
			{urls: ['<all_urls>'], types: ['main_frame', 'sub_frame']},
			["responseHeaders", "blocking"]
		);

		chrome.webRequest.onBeforeRequest.addListener(
			sessionList.processScript,
			{urls: ['<all_urls>'], types: ['script', 'image', 'stylesheet', 'xmlhttprequest', 'ping', 'object']},
			['blocking']
		);
	},

	cleanSessionList: function(){
		chrome.tabs.query({}, function (tabs){
			for (var tabId in sessionList.list){
				var inTabs = false;
				for (var i = 0; i < tabs.length; i++){
					if (tabId === tabs[i].id.toString()){
						inTabs = true;
					}
				}
				if (inTabs === false){
					delete sessionList.list[tabId];
				}
			}
		})
	},

	getCurrentTabObj: function(){
		return sessionList.list[sessionList.currentTabId];
	},

	checkCurrentTab: function(tabId){
		chrome.tabs.query({active:true, currentWindow: true}, function (tabs){
			if (tabs[0] !== undefined && tabId === tabs[0].id){
				sessionList.currentDomain = sessionList.extractDomain(tabs[0].url);
				sessionList.currentSubDomain = sessionList.extractSubDomain(tabs[0].url);
				sessionList.currentTabId = tabs[0].id;
				sessionList.currentURL = tabs[0].url;
			}
		});
	},

	setCurrentTab: function(){
		chrome.tabs.query({active:true, currentWindow: true}, function (tabs){
			sessionList.currentDomain = sessionList.extractDomain(tabs[0].url);
			sessionList.currentSubDomain = sessionList.extractSubDomain(tabs[0].url);
			sessionList.currentTabId = tabs[0].id;
			sessionList.currentURL = tabs[0].url;
		});
	},

	setSessionData: function(details){
		if (sessionList.list[details.tabId] === undefined || 
			sessionList.list[details.tabId].url !== details.url
			){
			sessionList.list[details.tabId] = [];
			sessionList.list[details.tabId].domain = sessionList.extractDomain(details.url);
			sessionList.list[details.tabId].subDomain = sessionList.extractSubDomain(details.url);
			sessionList.list[details.tabId].url = details.url;
		}
	},

	processMedia: function(details){
		if (scriptDisabled){
			return;
		}
		var tabURL = sessionList.extractSubDomain(sessionList.list[details.tabId].url);
		if (mediaList.checkList(tabURL)){
			var headers = details.responseHeaders;
			headers.push({'name': "Content-Security-Policy", 'value': "media-src 'none'"});
			return {"responseHeaders": headers};
		}
	},

	processScript: function(details){
		if (details.tabId === -1){
			return;
		}

		var listObj = sessionList.createListObj(details);

		if (scriptDisabled === true){
			return;
		}  else if (blockAllScriptsOn === true){
			sessionList.recordScript(listObj);
			sessionList.sendToPopUp(listObj);
			return {cancel: true};
		} else {
			sessionList.recordScript(listObj);
			if (sessionList.blockListedScripts(listObj)){
				return {cancel: true};
			}			
		}
	},

	createListObj: function(details){
		return {
			'url': details.url,
			'shortURL': details.url.split('?')[0],
			'type': details.type,
			'tabId': details.tabId,
			'domain': sessionList.extractDomain(details.url),
			'filterType': ''
		}
	},

	recordScript: function(listObj){
		if (sessionList.list[listObj.tabId] === undefined){
			sessionList.list[listObj.tabId] = [];
		}

		if (!sessionList.isDuplicate(listObj.shortURL, sessionList.list[listObj.tabId])) {
			if (listObj.type === 'script'){
				listObj.index = sessionList.list[listObj.tabId].length;
			}

			sessionList.list[listObj.tabId].push(listObj);
		}
	},

	blockListedScripts: function (listObj){
		var time1 = new Date();

		var url = listObj.url.split('?')[0];

		for (var i = 0; i < blackList.list.length; i++){
			if (blackList.list[i] === url || sessionList.checkOldScripts(url, blackList.list, i)){
				sessionList.sendToPopUp(listObj);
				return true;
			}
		}

		if (filtersEnabled){
			if (scriptList.checkRules(listObj, 'exempt')){
				listObj.filterType = 'exempt';
				sessionList.sendToPopUp(listObj);

				return false;
			} else if (scriptList.checkRules(listObj, 'block')){
				listObj.filterType = 'block';
				sessionList.sendToPopUp(listObj);

				return true;			
			}
		}
		sessionList.sendToPopUp(listObj);
		return false;
	},

	checkOldScripts: function(url, list, index){
		urlList = url.split('://');
		var newURL = url;

		if (urlList.length > 1){
			newURL = '';
			for (var i = 0; i < urlList.length; i++){
				if (i != 0){
					newURL += urlList[i];
				}
			}
		}
		if (newURL === list[index]){
			blackList.list[index] = url;
			chrome.storage.local.set({'blackList': blackList.list});
			return true;
		} else {
			return false;
		}
	},

	sendToPopUp: function(listObj){
		if (listObj.tabId !== sessionList.currentTabId){
			return;
		}

		var scriptObj = sessionList.getObjFromList(listObj);
		var views = chrome.extension.getViews({type: "popup"});
		if (views.length > 0){

			for (var i = 0; i < views.length; i++){	
				try {
					views[i].scriptList.addScriptToList(scriptObj);
				} catch(err){};
			}
		}		
	},

	getObjFromList: function(listObj){
		for (var i = 0; i < sessionList.list[listObj.tabId].length; i++){
			if (sessionList.list[listObj.tabId][i].url === listObj.url){
				return sessionList.list[listObj.tabId][i];
			}
		}
		return listObj;
	},

	extractScript: function(url){
		var newURL = url.split('?')[0];

		//Some sites keep loading the same script over and over with [number] on end.
		//This keeps them from clogging up sessionList.list;
		var pattern = new RegExp(/\[\d+\]/g);
		var match;
		while((match = pattern.exec(newURL)) !== null){
			if (match.index === (newURL.length - match[match.length - 1].length)){
				return newURL.substring(0, match.index);
			}		
		}
		return newURL;
	},

	extractSubDomain: function(url){
		try {
		    var domain = url.split('/')[2];
		    if (domain === undefined){
		    	return url;
		    }
		    if (domain.slice(0,3) === 'www'){
		    	domain = domain.slice(4);
		    }

		    return domain;
		} catch (error){
			console.log('error: ' + url);
		}
		return url;
	},

	extractDomain: function (url) {
	    var domain = this.extractSubDomain(url);

		var list = domain.split('.');
		domain = list[list.length - 2]+ '.' + list[list.length - 1];
	    return domain;
	},

	isDuplicate: function (url, list){
		if (list === undefined){
			return;
		}
		for (var i = 0; i < list.length; i++){
			if (list[i].shortURL === url){
				return true;
			}
		}
		return false;
	}
}