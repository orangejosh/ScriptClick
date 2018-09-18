
var backgroundPage = chrome.extension.getBackgroundPage();

function resetFilters(){
	easyListBox.reset();
	easyPrivacyBox.reset();
	fanboySocialBox.reset();
	fanboyAnnoyBox.reset();
	fanboyTrackerBox.reset();
	display.setRefreshButton(true);
}

var easyListBox = {
	checkBox: document.getElementById('easyList'),
	link: document.getElementById('easyListLink'),

	load: function(){
		if (backgroundPage.easyList.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.easyList.setList(!backgroundPage.easyList.enabled);
			resetFilters();
		})

		this.link.addEventListener('click', function (){
			window.open('https://easylist.to/easylist/easylist.txt');
		})
	},

	reset: function(){
		if (backgroundPage.easyList.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
			backgroundPage.easyList.loadList();
		}		
	}
}

var easyPrivacyBox = {
	checkBox: document.getElementById('easyPrivacy'),
	link: document.getElementById('easyPrivacyLink'),

	load: function(){
		if (backgroundPage.easyPrivacy.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.easyPrivacy.setList(!backgroundPage.easyPrivacy.enabled);
			resetFilters();
		})

		this.link.addEventListener('click', function (){
			window.open('https://easylist.to/easylist/easyprivacy.txt');
		})
	},

	reset: function(){
		if (backgroundPage.easyPrivacy.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
			backgroundPage.easyPrivacy.loadList();
		}		
	}
}

var fanboySocialBox = {
	checkBox: document.getElementById('fanboySocial'),
	link: document.getElementById('fanboySocialLink'),

	load: function(){
		if (backgroundPage.fanboySocial.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.fanboySocial.setList(!backgroundPage.fanboySocial.enabled);
			resetFilters();
		})

		this.link.addEventListener('click', function (){
			window.open('https://easylist.to/easylist/fanboy-social.txt');
		})
	},

	reset: function(){
		if (backgroundPage.fanboySocial.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
			backgroundPage.fanboySocial.loadList();
		}		
	}
}

var fanboyAnnoyBox = {
	checkBox: document.getElementById('fanboyAnnoy'),
	link: document.getElementById('fanboyAnnoyLink'),

	load: function(){
		if (backgroundPage.fanboyAnnoy.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.fanboyAnnoy.setList(!backgroundPage.fanboyAnnoy.enabled);
			resetFilters();
		})

		this.link.addEventListener('click', function (){
			window.open('https://easylist.to/easylist/fanboy-annoyance.txt');
		})
	},

	reset: function(){
		if (backgroundPage.fanboyAnnoy.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
			backgroundPage.fanboyAnnoy.loadList();
		}
	}
}

var fanboyTrackerBox = {
	checkBox: document.getElementById('fanboyTracker'),
	link: document.getElementById('fanboyTrackerLink'),

	load: function(){
		if (backgroundPage.fanboyTracker.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.fanboyTracker.setList(!backgroundPage.fanboyTracker.enabled);
			resetFilters();
		})

		this.link.addEventListener('click', function (){
			window.open('https://www.fanboy.co.nz/enhancedstats.txt');
		})
	},

	reset: function(){
		if (backgroundPage.fanboyTracker.enabled && backgroundPage.filtersEnabled){
			this.checkBox.checked = true;
			backgroundPage.fanboyTracker.loadList();
		}		
	}
}

var elementDisableBox = {
	checkBox: document.getElementById('elementDisable'),

	load: function(){
		if (backgroundPage.elementDisabled){
			this.checkBox.checked = true;
		}

		this.checkBox.addEventListener('click', function(){
			backgroundPage.elementList.setDisable();
		})
	}
}

var updateButton = {
	button: document.getElementById('update'),

	load: function(){
		if (backgroundPage.updateFilters === true){
			this.button.disabled = false;
		}

		this.button.addEventListener('click', function(){
			backgroundPage.loadList(backgroundPage.easyList, true);
			backgroundPage.loadList(backgroundPage.easyPrivacy, true);
			backgroundPage.loadList(backgroundPage.fanboySocial, true);
			backgroundPage.loadList(backgroundPage.fanboyAnnoy, true);
			backgroundPage.loadList(backgroundPage.fanboyTracker, true);
			backgroundPage.updateFilters = false;
			updateButton.button.disabled = true;
			display.setRefreshButton(true);
		})
	}
}

var whiteList = {
	addButton: document.getElementById('addButton'),
	advButton: document.getElementById('advButton'),
	whiteFilters: document.getElementById('whiteFilters'),
	whiteEasy: document.getElementById('whiteEasy'),
	whitePrivacy: document.getElementById('whitePrivacy'),
	whiteFanSocial: document.getElementById('whiteFanSocial'),
	whiteFanAnnoy: document.getElementById('whiteFanAnnoy'),
	whiteFanTracker: document.getElementById('whiteFanTracker'),
	// addInfo: document.getElementById('addButtonInfo'),
	

	load: function(){
		chrome.tabs.query({active:true, currentWindow: true}, function (tabs){
			var tabDomain = backgroundPage.sessionList.list[tabs[0].id].subDomain;
			document.getElementById('currentDomain').innerHTML = tabDomain;

			whiteList.addButton.addEventListener('click', function(){
				whiteList.toggleDomain(tabDomain);
			}, false);

			whiteEasy.addEventListener('click', function(){
				whiteList.reSaveDomain(tabDomain);
			});

			whitePrivacy.addEventListener('click', function(){
				whiteList.reSaveDomain(tabDomain);
			});

			whiteFanSocial.addEventListener('click', function(){
				whiteList.reSaveDomain(tabDomain);
			});

			whiteFanAnnoy.addEventListener('click', function(){
				whiteList.reSaveDomain(tabDomain);
			});

			whiteFanTracker.addEventListener('click', function(){
				whiteList.reSaveDomain(tabDomain);
			});

			whiteList.advButton.addEventListener('click', function(){
				if (whiteFilters.style.display !== 'block'){
					whiteFilters.style.display = 'block';
				} else {
					whiteFilters.style.display = 'none';
				}
			})

			whiteList.loadDomain(tabDomain);
		})
	},

	toggleDomain: function(tabDomain){
		if (tabDomain === undefined){
			return;
		}

		var domainObj = this.createDomainObj(tabDomain);

		if (backgroundPage.whiteList.getIndex(domainObj) < 0){
			whiteList.addButton.getElementsByTagName('img')[0].src = 'images/subtract.png';
			document.getElementById('addButtonLabel').innerHTML = 'Remove';
			backgroundPage.whiteList.addToList(domainObj);
		} else {
			whiteList.addButton.getElementsByTagName('img')[0].src = 'images/add.png';
			document.getElementById('addButtonLabel').innerHTML = 'Add';
			whiteFilters.style.display = 'none';
			this.clearChecks();
			backgroundPage.whiteList.removeFromList(domainObj);
		}

		// var tabDomain = backgroundPage.sessionList.currentDomain;
		if (backgroundPage.filtersEnabled && backgroundPage.whiteList.getIndex(tabDomain) >= 0){
			display.displayWhiteList();
		} else {
			display.hideWhiteList();
		}
		display.setRefreshButton(true);
	},

	createDomainObj: function(tabDomain){
		var domainObj = {'url': tabDomain, 'filters': []};

		if (whiteFilters.style.display !== 'block'){
			return domainObj;
		}

		if (whiteEasy.checked){
			domainObj.filters.push('easyList');
		}
		if (whitePrivacy.checked){
			domainObj.filters.push('easyPrivacy');
		}
		if (whiteFanSocial.checked){
			domainObj.filters.push('fanboySocial');
		}
		if (whiteFanAnnoy.checked){
			domainObj.filters.push('fanboyAnnoy');
		}
		if (whiteFanTracker.checked){
			domainObj.filters.push('fanboyTracker');
		}
		return domainObj;
	},

	loadDomain: function(tabDomain){
		var domainObj = backgroundPage.whiteList.getObj(tabDomain);

		if (domainObj !== undefined){
			whiteList.addButton.getElementsByTagName('img')[0].src = 'images/subtract.png';
			document.getElementById('addButtonLabel').innerHTML = 'Remove';

			if (domainObj.filters.length > 0){
				whiteFilters.style.display = 'block';

				for (var i = 0; i < domainObj.filters.length; i++){
					var filter = domainObj.filters[i];
					if (filter === 'easyList'){
						this.whiteEasy.checked = true;
					} else if (filter === 'easyPrivacy'){
						this.whitePrivacy.checked = true;
					} else if (filter === 'fanboySocial'){
						this.whiteFanSocial.checked = true;
					} else if (filter === 'fanboyAnnoy'){
						this.whiteFanAnnoy.checked = true;
					} else if (filter === 'fanboyTracker'){
						this.whiteFanTracker.checked = true;
					}
				}
			}
		}
	},

	reSaveDomain: function(domain){
		var domainObj = backgroundPage.whiteList.getObj(domain);

		if (domainObj !== undefined){
			var domainObj = this.createDomainObj(domain);
			backgroundPage.whiteList.addToList(domainObj);
		}
		display.setRefreshButton(true);
	},

	clearChecks: function(){
		whiteEasy.checked = false;
		whitePrivacy.checked = false;
		whiteFanSocial.checked = false;
		whiteFanAnnoy.checked = false;
		whiteFanTracker.checked = false;		
	}
}

var blackList = {
	blackList: backgroundPage.blackList.list,
	lastScriptIndex: undefined,

	load: function(){
		var popList = document.getElementById('blackList');
		for (var i = 0; i < this.blackList.length; i++){
			this.addBlackList(this.blackList[i], popList);
		}
	},

	addBlackList: function(url, popList){
		var shortText = document.createElement('p');
		shortText.className = 'url';
		shortText.textContent = url;

		var button  = document.createElement('button');
		button.className = 'scriptButton';
		button.style.color = 'red';

		button.addEventListener('click', function(event){
			blackList.toggleScriptBlock(event.shiftKey, this);
		}, false);

		button.appendChild(shortText);
		var br = document.createElement('br');

		popList.appendChild(button);
		popList.appendChild(br);
	},

	toggleScriptBlock: function(shiftKey, button){
		if (shiftKey){
			this.blockMultiScripts(blackList.getScriptIndex(button));
		} else {
			this.blockOneScript(button);
			this.lastScriptIndex = blackList.getScriptIndex(button);
		}
	},

	blockOneScript: function(button) {
		if (button.style.color === 'red'){
			button.style.color = 'black';
			var url = button.getElementsByClassName('url')[0].textContent;
			var saveObj = {'action': 'remove', 'url': url};
			backgroundPage.blackList.addToBlackListQue(saveObj);
		} else {
			button.style.color = 'red';
			var url = button.getElementsByClassName('url')[0].textContent;
			var saveObj = {'action': 'add', 'url': url};
			backgroundPage.blackList.addToBlackListQue(saveObj);		
		}
	},

	blockMultiScripts: function(scriptIndex){
		var buttonList = document.getElementsByClassName('scriptButton');

		if (scriptIndex > this.lastScriptIndex){
			this.lastScriptIndex++;
			while (this.lastScriptIndex <= scriptIndex){
				button = buttonList[this.lastScriptIndex];
				this.blockOneScript(button);
				this.lastScriptIndex++;
			}
		} else {
			this.lastScriptIndex--;
			while (this.lastScriptIndex >= scriptIndex){
				button = buttonList[this.lastScriptIndex];
				this.blockOneScript(button);
				this.lastScriptIndex--;
			}
		}
	},

	getScriptIndex: function(button){
		var url = button.getElementsByClassName('url')[0];
		var blockList = document.getElementsByClassName('scriptButton');
		for (var i = 0; i < blockList.length; i++){
			var aButton = blockList[i];
			var aURL = aButton.getElementsByClassName('url')[0];
			if (url === aURL){
				return i;
			}
		}
	}
}

easyListBox.load();
easyPrivacyBox.load();
fanboySocialBox.load();
fanboyAnnoyBox.load();
fanboyTrackerBox.load();
elementDisableBox.load();
updateButton.load();
whiteList.load();
blackList.load();



