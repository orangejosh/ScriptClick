
var backgroundPage = chrome.extension.getBackgroundPage();

var buttons = {
	expand: false,

	initButtons: function(){
		whiteListButton.element.addEventListener('click', function () {
			whiteListButton.toggle();
		}, false);

		expandButton.element.addEventListener('click', function (){
			expandButton.toggle();
		}, false);

		undoButton.element.addEventListener('click', function (){
			undoButton.click();
		}, false);

		imgButton.element.addEventListener('click', function (){
			imgButton.click();
		}, false);	

		var tabObj = backgroundPage.sessionList.getCurrentTabObj();
		if (tabObj.undo !== undefined && tabObj.undo.length > 0){
			undoButton.element.style.color = 'black';
		}

		var tabSubDomain = backgroundPage.sessionList.currentSubDomain
		if (backgroundPage.filtersEnabled && backgroundPage.whiteList.getIndex(tabSubDomain) >= 0)
		{
			whiteListButton.element.getElementsByTagName('img')[0].src = 'images/subtract.png';
		}

	}
}

var whiteListButton = {
	element: document.getElementById('whiteListButton'),

	toggle: function() {
		var tabDomain = backgroundPage.sessionList.currentSubDomain;
		var domainObj = {'url': tabDomain, 'filters': []};

		if (backgroundPage.whiteList.getIndex(domainObj) < 0){
			backgroundPage.whiteList.addToList(domainObj);
			this.element.getElementsByTagName('img')[0].src = 'images/subtract.png';
		} else {
			backgroundPage.whiteList.removeFromList(domainObj);
			this.element.getElementsByTagName('img')[0].src = 'images/add.png';
		}

		if (backgroundPage.filtersEnabled && backgroundPage.whiteList.getIndex(tabDomain) >= 0){
			display.displayWhiteList();
		} else {
			display.hideWhiteList();
		}
	}
}

var expandButton = {
	element: document.getElementById('expand'),

	toggle: function(){
		if (buttons.expand === true){
			buttons.expand = false;
			document.getElementById('blockList').style.width = "340px";
			var scriptButtons = document.getElementsByClassName('scriptButton');
			for (var i = 0; i < scriptButtons.length; i++){
				scriptButtons[i].getElementsByClassName('shortURL')[0].style.display = 'block';
				scriptButtons[i].getElementsByClassName('fullURL')[0].style.display = 'none';
			}
			expandButton.element.childNodes[0].src = 'images/expand.png';
		} else {
			buttons.expand = true;
			document.getElementById('blockList').style.width = "";
			var scriptButtons = document.getElementsByClassName('scriptButton');
			for (var i = 0; i < scriptButtons.length; i++){
				scriptButtons[i].getElementsByClassName('shortURL')[0].style.display = 'none';
				scriptButtons[i].getElementsByClassName('fullURL')[0].style.display = 'block';
			}
			expandButton.element.childNodes[0].src = 'images/contract.png';
		}	
	}	
}

var undoButton = {
	element: document.getElementById('undo'),

	click: function(){
		var tabObj = backgroundPage.sessionList.getCurrentTabObj();
		if (tabObj.undo === undefined || tabObj.undo.length === 0){
			document.getElementById('undo').style.color = 'lightgrey';
			return;
		}
		scriptList.undo();
	}	
}

var imgButton = {
	element: document.getElementById('imgClick'),

	click: function(){
		this.element.style.display = 'none';
		var list = backgroundPage.sessionList.list[backgroundPage.sessionList.currentTabId];
		var popupList = document.getElementById('blockList');
		var br = document.createElement('br');

		for (var i = 0; i < list.length; i++){
			if (list[i].type === 'image'){
				var button = scriptList.createScriptButton(list[i]);
				popupList.appendChild(button);
				popupList.appendChild(br);
			}
		}
	}	
}

var scriptList = {
	list: {},
	undoList: [],
	refresh: false,
	lastScriptIndex: {},

	init: function(){
		var popupList = document.getElementById('blockList');

		if (backgroundPage.scriptDisabled){
			if (document.getElementById('blockList') !== undefined){
				document.getElementById('infoBack').style.position = 'static';
				document.getElementById('expand').style.display = 'block';
			}
			
			return;
		} else if (backgroundPage.sessionList.list === undefined){
			display.displayNoScript(popupList);
			return;
		}

		this.list = backgroundPage.sessionList.getCurrentTabObj();

		if (this.list === undefined){
			display.displayNoScript(popupList);
			return;
		}
		if (this.refresh === true){
			this.setRefresh();
		}

		// var tabDomain = backgroundPage.sessionList.currentDomain;
		// if (backgroundPage.filtersEnabled && backgroundPage.whiteList.getIndex(tabDomain) >= 0){
		// 	display.displayWhiteList();
		// }

		for (var i = 0; i < this.list.length; i++){
			this.addScriptToList(this.list[i]);
		}

		var blockList = document.getElementById('blockList');
		if (blockList.hasChildNodes()){
			document.getElementById('infoBack').style.position = 'fixed';
			document.getElementById('expand').style.display = 'block';
		} else {
			display.displayNoScript(popupList);
		}
	},

	addScriptToList: function(scriptObj){
		scriptObj.active = true;
		if (scriptList.checkForDuplicate(scriptObj)){
			return;
		}

		if (scriptObj.type !== 'script'){
			document.getElementById('imgClick').style.display = 'block';
			return;
		}

		var button = this.createScriptButton(scriptObj)

		var br = document.createElement('br');
		var popupList = document.getElementById('blockList');

		var buttonList = popupList.getElementsByClassName('scriptButton');
		var added = false;
		for (var i = 0; i < buttonList.length; i++){
			var aButton = buttonList[i];
			var aButtonIndex = aButton.getAttribute('data-index')
			if (scriptObj.index < aButtonIndex){
				popupList.insertBefore(button, aButton);
				popupList.insertBefore(br, aButton);
				added = true;
				break;
			}
		}
		if (added === false){
			popupList.appendChild(button);
			popupList.appendChild(br);			
		}

		var infoBack = document.getElementById('infoBack');
		if (infoBack.style.position === 'static'){
			if (document.getElementById('blockList') !== undefined){
				infoBack.style.position = 'fixed';
				document.getElementById('expand').style.display = 'block';
			}
		}

		return button.style.color === 'red';
	},

	createScriptButton: function(scriptObj){
		var script = this.extractScript(scriptObj.url);

		var shortText = document.createElement('p');
		shortText.className = 'shortURL';
		shortText.textContent = scriptList.shortenString(script);

		var fullText = document.createElement('p');
		fullText.className = 'fullURL';
		fullText.textContent = scriptObj.url;

		var button  = document.createElement('button');
		button.className = 'scriptButton';
		button.style.width = '100%'
		button.style.color = 'black';
		button.setAttribute('data-index', scriptObj.index);

		button.addEventListener('click', function(event){
			scriptList.toggleScriptBlock(event.shiftKey, this);
		}, false);

		if (scriptList.isScriptBlocked(scriptObj.url) || backgroundPage.blockAllScriptsOn){
			button.style.color = 'red';
			scriptObj.active = true;
		}
		if (scriptObj.active === false){
			button.style.color = 'darkgray';
		}

		if (button.style.color === 'black' && scriptObj.filterType === 'block'){
			button.style.backgroundColor = '#ffb6b6';
		}

		if (button.style.color === 'black' && scriptObj.filterType === 'exempt'){
			button.style.backgroundColor = '#c0ffb6';
		}

		button.appendChild(shortText);
		button.appendChild(fullText);	
		
		return button;	
	},

	undo: function(){
		if (backgroundPage.blockAllScriptsOn){
			return;
		}

		scriptList.setRefresh();
		var syncButton = document.getElementById('sync');
		menuButtons.syncButton.element.childNodes[0].src = 'images/syncOn.png';

		var tabObj = backgroundPage.sessionList.getCurrentTabObj()
		var undoList = tabObj.undo;
		var undoObj = undoList[undoList.length - 1];
		undoList.pop();

		if (undoList.length === 0){
			document.getElementById('undo').style.color = 'lightgrey';
		}

		for (var i = 0; i < undoObj.length; i++){
			if (undoObj[i].action === 'remove'){
				undoObj[i].action = 'add'
			} else {
				undoObj[i].action = 'remove'
			}
			backgroundPage.blackList.addToBlackListQue(undoObj[i]);
			var button = scriptList.getButton(undoObj[i].url);

			if (button !== undefined && button.style.color === 'red'){
				button.style.color = 'black';
			} else if (button !== undefined){
				button.style.color = 'red';
			}
		}
	},

	toggleScriptBlock: function(shiftKey, button){
		if (backgroundPage.blockAllScriptsOn){
			return;
		}

		scriptList.setRefresh();
		var syncButton = document.getElementById('sync');
		menuButtons.syncButton.element.childNodes[0].src = 'images/syncOn.png';

		var tabObj = backgroundPage.sessionList.getCurrentTabObj();
		var undoObj = [];
		if (tabObj.undo === undefined){
			tabObj.undo = [];
		}
		tabObj.undo.push(undoObj);
		document.getElementById('undo').style.color = 'black';

		if (shiftKey){
			scriptList.blockMultiScripts(scriptList.getScriptIndex(button), undoObj);
		} else {
			scriptList.blockOneScript(button, undoObj);
			scriptList.lastScriptIndex = scriptList.getScriptIndex(button);
		}
	},

	blockOneScript: function(button, undoObj) {
		if (button.style.color === 'red'){
			button.style.color = 'black';

			var url = button.getElementsByClassName('fullURL')[0].textContent;
			var saveObj = {'action': 'remove', 'url': url.split('?')[0]};

			if (undoObj !== undefined){
				undoObj.push(saveObj);
			}

			backgroundPage.blackList.addToBlackListQue(saveObj);
		} else {
			button.style.color = 'red';

			var url = button.getElementsByClassName('fullURL')[0].textContent;
			var saveObj = {'action': 'add', 'url': url.split('?')[0]};
			
			if (undoObj !== undefined){
				undoObj.push(saveObj);
			}

			backgroundPage.blackList.addToBlackListQue(saveObj);		
		}
	},

	blockMultiScripts: function(scriptIndex, undoObj){
		var buttonList = document.getElementsByClassName('scriptButton');

		if (scriptIndex > scriptList.lastScriptIndex){
			scriptList.lastScriptIndex++;
			while (scriptList.lastScriptIndex <= scriptIndex){
				button = buttonList[scriptList.lastScriptIndex];
				scriptList.blockOneScript(button, undoObj);
				scriptList.lastScriptIndex++;
			}
		} else {
			scriptList.lastScriptIndex--;
			while (scriptList.lastScriptIndex >= scriptIndex){
				button = buttonList[scriptList.lastScriptIndex];
				scriptList.blockOneScript(button, undoObj);
				scriptList.lastScriptIndex--;
			}
		}
	},

	checkForDuplicate: function(scriptObj){
		var buttons = document.getElementsByClassName('scriptButton');
		for (var i = 0; i < buttons.length; i++){
			var buttonURL = buttons[i].getElementsByClassName('fullURL')[0].innerHTML;
			if (buttonURL === scriptObj.url){
				if (buttons[i].style.color === 'darkgray'){
					buttons[i].style.color = 'black';
					scriptObj.active = true;

					if (scriptObj.filterType === 'block'){
						buttons[i].style.backgroundColor = '#ffb6b6';
					}

					if (scriptObj.filterType === 'exempt'){
						buttons[i].style.backgroundColor = '#c0ffb6';
					}
				}
				return true;
			}
		}
		return false;
	},

	getScriptIndex: function(button){
		var url = button.getElementsByClassName('fullURL')[0];
		var blockList = document.getElementsByClassName('scriptButton');
		for (var i = 0; i < blockList.length; i++){
			var aButton = blockList[i];
			var aURL = aButton.getElementsByClassName('fullURL')[0];
			if (url === aURL){
				return i;
			}
		}
	},

	getButton: function(url){
		var buttons = document.getElementsByClassName('scriptButton');
		for (var i = 0; i < buttons.length; i++){
			var buttonURL = buttons[i].getElementsByClassName('fullURL')[0].textContent;
			buttonURL = buttonURL.split('?')[0];
			if (url === buttonURL){
				return buttons[i];
			}
		}
	},

	isScriptBlocked: function(url){
		var url = url.split('?')[0];
		var blackList = backgroundPage.blackList.list;
		for (var i = 0; i < blackList.length; i++){
			if (blackList[i] === url){
				return true;
			}
		}
		return false;
	},

	shortenString: function(str){
		if (str.length > 60){
			return str.substr(0,25) + "  ...  " + str.substr(str.length - 30, str.length);
		}
		return str;
	},

	setRefresh: function(){
		var refreshButton = document.getElementById('refresh');
		refreshButton.childNodes[0].src = 'images/refreshOn.png';
		if (scriptList.list != undefined){
			scriptList.refresh = true;
		}
	},

	extractScript: function (url){
		var newURL = '';
		var urlList = url.split('?');
		if (urlList.length > 1){
			for (var i = 0; i < urlList.length; i++){
				if (i < urlList.length - 1){
					newURL += urlList[i];
				}
			}
		} else {
			newURL = url;
		}

		var newURL2 = '';
		urlList = newURL.split('://');

		if (urlList.length > 1){
			for (var i = 0; i < urlList.length; i++){
				if (i != 0){
					newURL2 += urlList[i];
				}
			}
			return newURL2;
		} else {
			return newURL;
		}
	}
}

buttons.initButtons();
scriptList.init();



