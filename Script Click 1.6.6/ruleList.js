



var updateFilters = false;

function loadFilters(){
	chrome.storage.local.get('easyListOpt', function(opt){
		if (opt.easyListOpt === undefined){
			opt.easyListOpt = {'enabled': false, 'lastUpdate': 0};
			chrome.storage.local.set(opt);
		}
		if (easyList.enabled === false){
			easyList.enabled = opt.easyListOpt.enabled;
		}
		easyList.lastUpdate = opt.easyListOpt.lastUpdate;

		easyList.loadList();
	});

	chrome.storage.local.get('easyPrivacyOpt', function(opt){
		if (opt.easyPrivacyOpt === undefined){
			opt.easyPrivacyOpt = {'enabled': false, 'lastUpdate': 0};
			chrome.storage.local.set(opt);
		}
		easyPrivacy.enabled = opt.easyPrivacyOpt.enabled;
		easyPrivacy.lastUpdate = opt.easyPrivacyOpt.lastUpdate;

		easyPrivacy.loadList();
	});

	chrome.storage.local.get('fanboyTrackerOpt', function(opt){
		if (opt.fanboyTrackerOpt === undefined){
			opt.fanboyTrackerOpt = {'enabled': false, 'lastUpdate': 0};
			chrome.storage.local.set(opt);
		}
		fanboyTracker.enabled = opt.fanboyTrackerOpt.enabled;
		fanboyTracker.lastUpdate = opt.fanboyTrackerOpt.lastUpdate;

		fanboyTracker.loadList();

	});

	chrome.storage.local.get('fanboySocialOpt', function(opt){
		if (opt.fanboySocialOpt === undefined){
			opt.fanboySocialOpt = {'enabled': false, 'lastUpdate': 0};
			chrome.storage.local.set(opt);
		}
		fanboySocial.enabled = opt.fanboySocialOpt.enabled;
		fanboySocial.lastUpdate = opt.fanboySocialOpt.lastUpdate;

		fanboySocial.loadList();

	});

	chrome.storage.local.get('fanboyAnnoyOpt', function(opt){
		if (opt.fanboyAnnoyOpt === undefined){
			opt.fanboyAnnoyOpt = {'enabled': false, 'lastUpdate': 0};
			chrome.storage.local.set(opt);
		}
		fanboyAnnoy.enabled = opt.fanboyAnnoyOpt.enabled;
		fanboyAnnoy.lastUpdate = opt.fanboyAnnoyOpt.lastUpdate;

		fanboyAnnoy.loadList();

	});
}

function loadLists(){
	if (checkAllFilterList()){
		easyList.setList(true);
	} else {
		easyList.loadList();
	}

	easyPrivacy.loadList();
	fanboyTracker.loadList();
	fanboyAnnoy.loadList();
	fanboySocial.loadList();
}

var easyList = {
	///// check make sure file is valid before replacing
	xmlReq: {},
	lastUpdate: undefined,
	enabled: false,
	name: 'easyList',
	url: 'https://raw.githubusercontent.com/easylist/easylist/gh-pages/easylist.txt',
	// url: 'https://easylist.to/easylist/easylist.txt',

	loadList: function(){
		if (this.enabled && filtersEnabled){
			loadList(this);
		}
	},

	process: function(){
		if (easyList.xmlReq.readyState == 4){
			// console.log('Download EasyList');

			var aList = easyList.xmlReq.responseText.match(/[^\r\n]+/g);
			chrome.storage.local.set({'easyList': aList});

			chrome.storage.local.get('easyListOpt', function(opt){
				easyList.lastUpdate = new Date().getTime() / 1000;
				opt.easyListOpt.lastUpdate = easyList.lastUpdate;
				chrome.storage.local.set(opt);
			});

			formatRuleList(easyList.name, aList);
		}
	},

	setList: function(enabled){
		if (filtersEnabled){
			this.enabled = enabled;
		} else {
			setFiltersEnabled(true);
			this.enabled = true;
		}

		if (this.enabled === false){
			scriptList.ruleList.easyList = undefined;
			elementList.ruleList.easyList = undefined;
			if (checkAllFilterList()){
				setFiltersEnabled(false);
			}
		} else {
			this.loadList();
		}

		chrome.storage.local.get('easyListOpt', function(opt){
			opt.easyListOpt.enabled = easyList.enabled;
			chrome.storage.local.set(opt);
		})
	}
}

var easyPrivacy = {
	xmlReq: {},
	lastUpdate: undefined,
	enabled: false,
	name: 'easyPrivacy',
	url: 'https://raw.githubusercontent.com/easylist/easylist/gh-pages/easyprivacy.txt',
	// url: 'https://easylist.to/easylist/easyprivacy.txt',

	loadList: function(){
		if (this.enabled && filtersEnabled){
			loadList(this);
		}
	},

	process: function(){
		if (easyPrivacy.xmlReq.readyState == 4){
			// console.log('Download EasyPrivacy');

			var aList = easyPrivacy.xmlReq.responseText.match(/[^\r\n]+/g);
			chrome.storage.local.set({'easyPrivacy': aList});

			chrome.storage.local.get('easyPrivacyOpt', function(opt){
				easyPrivacy.lastUpdate = new Date().getTime() / 1000;
				opt.easyPrivacyOpt.lastUpdate = easyPrivacy.lastUpdate;
				chrome.storage.local.set(opt);
			});

			formatRuleList(easyPrivacy.name, aList);
		}
	},

	setList: function(enabled){
		if (filtersEnabled){
			this.enabled = enabled;
		} else {
			setFiltersEnabled(true);
			this.enabled = true
		}

		if (this.enabled === false){
			scriptList.ruleList.easyPrivacy = undefined;
			elementList.ruleList.easyPrivacy = undefined;
			if (checkAllFilterList()){
				setFiltersEnabled(false);
			}
		} else {
			this.loadList();
		}

		chrome.storage.local.get('easyPrivacyOpt', function(opt){
			opt.easyPrivacyOpt.enabled = easyPrivacy.enabled;
			chrome.storage.local.set(opt);	
		})
	}
}

var fanboySocial = {
	xmlReq: {},
	lastUpdate: undefined,
	enabled: false,
	name: 'fanboySocial',
	url: 'https://raw.githubusercontent.com/easylist/easylist/gh-pages/fanboy-social.txt',
	// url: 'https://easylist.to/easylist/fanboy-social.txt',

	loadList: function(){
		if (this.enabled && filtersEnabled){
			loadList(this);
		}
	},

	process: function(){
		if (fanboySocial.xmlReq.readyState == 4){
			// console.log('Download fanboySocial');

			var aList = fanboySocial.xmlReq.responseText.match(/[^\r\n]+/g);
			chrome.storage.local.set({'fanboySocial': aList});


			chrome.storage.local.get('fanboySocialOpt', function(opt){
				fanboySocial.lastUpdate = new Date().getTime() / 1000;
				opt.fanboySocialOpt.lastUpdate = fanboySocial.lastUpdate;
				chrome.storage.local.set(opt);
			});

			formatRuleList(fanboySocial.name, aList);
		}
	},

	setList: function(enabled){
		if (filtersEnabled){
			this.enabled = enabled;
		} else {
			setFiltersEnabled(true);
			this.enabled = true
		}

		if (this.enabled === false){
			scriptList.ruleList.fanboySocial = undefined;
			elementList.ruleList.fanboySocial = undefined;
			if (checkAllFilterList()){
				setFiltersEnabled(false);
			}
		} else {
			this.loadList();
		}

		chrome.storage.local.get('fanboySocialOpt', function(opt){
			opt.fanboySocialOpt.enabled = fanboySocial.enabled;
			chrome.storage.local.set(opt);	
		})
	}
}

var fanboyAnnoy = {
	xmlReq: {},
	lastUpdate: undefined,
	enabled: false,
	name: 'fanboyAnnoy',
	url: 'https://raw.githubusercontent.com/easylist/easylist/gh-pages/fanboy-annoyance.txt',
	// url: 'https://easylist.to/easylist/fanboy-annoyance.txt',

	loadList: function(){
		if (this.enabled && filtersEnabled){
			loadList(this);
		}
	},

	process: function(){
		if (fanboyAnnoy.xmlReq.readyState == 4){
			// console.log('Download fanboyAnnoy');

			var aList = fanboyAnnoy.xmlReq.responseText.match(/[^\r\n]+/g);
			chrome.storage.local.set({'fanboyAnnoy': aList});

			chrome.storage.local.get('fanboyAnnoyOpt', function(opt){
				fanboyAnnoy.lastUpdate = new Date().getTime() / 1000;
				opt.fanboyAnnoyOpt.lastUpdate = fanboyAnnoy.lastUpdate;
				chrome.storage.local.set(opt);
			});

			formatRuleList(fanboyAnnoy.name, aList);
		}
	},

	setList: function(enabled){
		if (filtersEnabled){
			this.enabled = enabled;
		} else {
			setFiltersEnabled(true);
			this.enabled = true
		}

		if (this.enabled === false){
			scriptList.ruleList.fanboyAnnoy = undefined;
			elementList.ruleList.fanboyAnnoy = undefined;
			if (checkAllFilterList()){
				setFiltersEnabled(false);
			}
		} else {
			this.loadList();
		}

		chrome.storage.local.get('fanboyAnnoyOpt', function(opt){
			opt.fanboyAnnoyOpt.enabled = fanboyAnnoy.enabled;
			chrome.storage.local.set(opt);	
		})
	}
}

var fanboyTracker = {
	xmlReq: {},
	lastUpdate: undefined,
	enabled: false,
	name: 'fanboyTracker',
	url: 'https://www.fanboy.co.nz/enhancedstats.txt',

	loadList: function(){
		if (this.enabled && filtersEnabled){
			loadList(this);
		}
	},

	process: function(){
		if (fanboyTracker.xmlReq.readyState == 4){
			// console.log('Download fanboyTracker');

			var aList = fanboyTracker.xmlReq.responseText.match(/[^\r\n]+/g);
			chrome.storage.local.set({'fanboyTracker': aList});

			chrome.storage.local.get('fanboyTrackerOpt', function(opt){
				fanboyTracker.lastUpdate = new Date().getTime() / 1000;
				opt.fanboyTrackerOpt.lastUpdate = fanboyTracker.lastUpdate;
				chrome.storage.local.set(opt);
			});

			formatRuleList(fanboyTracker.name, aList);
		}
	},

	setList: function(enabled){
		if (filtersEnabled){
			this.enabled = enabled;
		} else {
			setFiltersEnabled(true);
			this.enabled = true
		}

		if (this.enabled === false){
			scriptList.ruleList.fanboyTracker = undefined;
			elementList.ruleList.fanboyTracker = undefined;
			if (checkAllFilterList()){
				setFiltersEnabled(false);
			}
		} else {
			this.loadList();
		}

		chrome.storage.local.get('fanboyTrackerOpt', function(opt){
			opt.fanboyTrackerOpt.enabled = fanboyTracker.enabled;
			chrome.storage.local.set(opt);	
		})
	}
}

function loadList(filter, forceUpdate){
	chrome.storage.local.get([filter.name], function(theList){
		if (theList[filter.name] === undefined || forceUpdate === true){
			filter.lastUpdate = new Date().getTime() / 1000;
			getList(filter);
		} else {
			if (checkUpdate(filter)){
				updateFilters = true;
			}

			formatRuleList(filter.name, theList[filter.name]);
		}
	});
}

function checkUpdate(filter){
	var time = new Date().getTime() / 1000;
	if (filter.lastUpdate === undefined){
		return true;
	} else if (time - filter.lastUpdate > 60 * 60 * 24 * 4){
		return true;
	}
	return false;
}

function getList(filter){
	filter.xmlReq = new XMLHttpRequest();
	filter.xmlReq.onreadystatechange = filter.process;
	filter.xmlReq.open('GET', filter.url, true);
	filter.xmlReq.send();	
}

function checkAllFilterList(){
	return (easyList.enabled === false &&
	easyPrivacy.enabled === false &&
	fanboySocial.enabled === false &&
	fanboyAnnoy.enabled === false &&
	fanboyTracker.enabled === false)
}

var formatRuleList = function(name, list){
	if (scriptList.ruleList[name] === undefined &&
		elementList.ruleList[name] === undefined)
	{
		scriptList.ruleList[name] = {};
		elementList.ruleList[name] = {};
	} else {
		return;
	}

	for (var i = 0; i < list.length; i++){
		var rule = list[i];
		var ruleKey = createRuleKey(rule);

		if (ruleKey[0] === true){
			continue;
		} else if ((ruleKey[2] === true || ruleKey[1] === true) && elementDisabled === false){
			if (elementList.ruleList[name] === undefined){
				elementList.ruleList[name] = [];
			}

			elementList.addToList(rule, ruleKey, elementList.ruleList[name]);
		} else {
			if (scriptList.ruleList[name] === undefined){
				scriptList.ruleList[name] = [];
			}

			scriptList.addToList(rule, ruleKey, scriptList.ruleList[name]);		
		}	
	}	
}

var createRuleKey = function(rule){
	var ignore = rule.substr(0,1) === '!'
	if (ignore){
		return [true];
	}

	var elem = rule.indexOf('##') !== -1;
	var elemExcept = rule.indexOf('#@#') !== -1;

	if (elem || elemExcept){
		/* 0  */ var a = function(){return ignore};
		/* 1  */ var b = function(){return elem};
		/* 2  */ var c = function(){return elemExcept};

		return[a(), b(), c()];
	} else {
		var ruleKey = [];
		var dollarIndex = rule.indexOf('$');

		/* 0 */ ruleKey.push(ignore);
		/* 1 */ ruleKey.push(elem);
		/* 2 */ ruleKey.push(elemExcept);
		/* 3 */ ruleKey.push(rule.substr(0,2) === '@@');
		/* 4 */ ruleKey.push(rule.substr(0,2) === '||');
		/* 5 */ ruleKey.push(rule.substr(2,2) === '||');
		/* 6 */ ruleKey.push(rule.substr(0,1) === '|' && rule.substr(1,1) !== '|');
		/* 7 */ ruleKey.push(rule.substr(2,1) === '|' && rule.substr(3,1) !== '|');
		/* 8 */ ruleKey.push(rule.substr(-1,1) === '|');
		/* 9 */ ruleKey.push(rule.indexOf('^') !== -1);
		/* 10 */ ruleKey.push(rule.indexOf('*') !== -1);
		/* 11 */ ruleKey.push(dollarIndex !== -1);

		var options = [
		/* 12 */ 'domain=',
		/* 13 */ 'third-party', 
		/* 14 */ '~third-party', 
		
		/* 15 */ 'script', 
		/* 16 */ '~script', 
		/* 17 */ 'image', 
		/* 18 */ '~image', 
		/* 19 */ 'xmlhttprequest', 
		/* 20 */ '~xmlhttprequest', 
		/* 21 */ 'stylesheet', 
		/* 22 */ '~stylesheet',
		/* 23 */ 'object',
		/* 24 */ '~object',
		/* 25 */ 'ping',
		/* 26 */ '~ping'
		];

		for (var i = 0; i < options.length; i++){
			ruleKey.push(dollarIndex !== -1 && rule.indexOf(options[i]) > dollarIndex);
		}

		var futureOptions = [
		'generichide', 'genericblock', 'object-subrequest', '~object-subrequest',
		'subdocument', '~subdocument', 'popup', 'other', '~other', 'websocket', '~websocket',
		'collapse', '~collapse', 'media', 'elemhide'
		];

		for (var i = 0; i < futureOptions.length; i++){
			ruleKey.push(dollarIndex !== -1 && rule.indexOf(futureOptions[i]) > dollarIndex);
		}

		return ruleKey;
	}
}


