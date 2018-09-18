

var scriptDisabled = false;
var blockAllScriptsOn = false;
var filtersEnabled = false;
var elementDisabled = false;

init();

function init() {
	chrome.storage.local.get('options', function (obj){
		if (obj.options === undefined){
			obj.options = {
				'scriptDisabled': false, 
				'blockAllScripts': false, 
				'filtersEnabled': false,
				'elementDisabled': false
			};
			chrome.storage.local.set(obj);
		}
		checkForOldVersions(obj);

		scriptDisabled = obj.options.scriptDisabled;
		blockAllScriptsOn = obj.options.blockAllScripts;
		filtersEnabled = obj.options.filtersEnabled;
		elementDisabled = obj.options.elementDisabled;

		if (scriptDisabled === false){
			loadFilters();
		}
		
		blackList.loadList();
		whiteList.loadList();
		mediaList.loadList();

		if (scriptDisabled){
			chrome.browserAction.setIcon({path: "images/scriptDisable.png"});
		} else if (blockAllScriptsOn){
			chrome.browserAction.setIcon({path: "images/scriptOn.png"});
		} else {
			chrome.browserAction.setIcon({path: "images/scriptOff.png"});
		}

		sessionList.addListeners();
	})	
}

var checkForOldVersions = function(obj){
	if (obj.options.elementDisabled === undefined){ //Version 1.6.5
		elementDisabled = false;
		obj.options.elementDisabled = false;
		chrome.storage.local.set(obj);
	}

	if (obj.options.adListEnabled !== undefined){ //Version 1.4.4
		if (obj.options.adListEnabled === true){
			obj.options.filtersEnabled = true;
			easyList.enabled = true;
		} else {
			obj.options.filtersEnabled = false;
		}
		delete obj.options.adListEnabled;
		delete obj.options.adListLastUpdate;

		chrome.storage.local.set(obj);
		chrome.storage.local.remove('adList');
	} 

	if (obj.options.fanBoyEnabled !== undefined){ //Version 1.4.0
		if (obj.options.fanBoyEnabled === true){
			obj.options.filtersEnabled = true;
			easyList.enabled = true;
		} else {
			obj.options.filtersEnabled = false;
		}

		delete obj.options.fanBoyEnabled;
		delete obj.options.fanBoyLastUpdate;

		chrome.storage.local.set(obj);
		chrome.storage.local.remove('fanBoyList');
	}
}

var setFiltersEnabled = function(enabled){
	filtersEnabled = enabled;
	chrome.storage.local.get('options', function(opt){
		opt.options.filtersEnabled = enabled;
		chrome.storage.local.set(opt);
	})
}






