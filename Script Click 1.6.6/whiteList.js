

var whiteList = {
	list: [],
	deleteList: [],

	loadList: function(){
		chrome.storage.local.get('whiteList', function(theList){
			if (theList.whiteList != undefined){
				whiteList.list = theList.whiteList;
			}
			whiteList.checkForOldList();
		})
	},

	checkForOldList: function(){
		for (var i = 0; i < this.list.length; i++){
			var obj = this.list[i];
			if (obj.url === undefined){
				obj = {'url': obj, 'filters': []}
			}
			this.list[i] = obj;
		}
		chrome.storage.local.set({'whiteList': this.list});
	},

	getIndex: function(domainObj){
		var url = domainObj.url === undefined ? domainObj : domainObj.url;

		for (var i = 0; i < this.list.length; i++){
			if (url === this.list[i].url){
				return i;
			}
		}
		return -1;		
	},

	getObj: function(domainObj){
		if (domainObj === undefined){
			return;
		}
		var url = domainObj.url === undefined ? domainObj : domainObj.url;

		for (var i = 0; i < this.list.length; i++){
			if (url === this.list[i].url){
				return this.list[i];
			}
		}
		return;
	},

	addToList: function(domainObj){
		var listIndex = this.getIndex(domainObj);
		if (listIndex < 0){
			this.list.push(domainObj);
			chrome.storage.local.set({'whiteList': this.list});
		} else {
			this.list[listIndex] = domainObj;
			chrome.storage.local.set({'whiteList': this.list});
		}

		for (var i = 0; i < this.deleteList.length; i++){
			if (this.deleteList[i].url === domainObj.url){
				this.deleteList.splice(i, 1);
				break;
			}
		}
	},

	removeFromList: function(domain){
		var listIndex = whiteList.getIndex(domain);
		if (listIndex >= 0){
			whiteList.list.splice(listIndex, 1);
			this.deleteList.push(domain);
		}
		chrome.storage.local.set({'whiteList': this.list});
	},

	checkFilters: function(name, domain){
		var whiteListObj = whiteList.getObj(domain);

		if (whiteListObj !== undefined && whiteListObj.filters.length === 0){
			return true;
		}

		if (name === 'fanboySocial'){
			var annoyFilter = false;
			if (whiteListObj !== undefined && whiteListObj.filters !== undefined){
				for (var i = 0; i < whiteListObj.filters.length; i++){
					if (whiteListObj.filters[i] === 'fanboySocial'){
						return true;
					}
					if (whiteListObj.filters[i] === 'fanboyAnnoy'){
						annoyFilter = true;
					}
				}
			}
			if (fanboyAnnoy.enabled === true && annoyFilter === false){
				return true;
			} else if (fanboyAnnoy.enabled === true){
				return false;
			}
		} else if (whiteListObj !== undefined && whiteListObj.filters !== undefined) {
			for (var i = 0; i < whiteListObj.filters.length; i++){
				if (whiteListObj.filters[i] === name){
					return true;
				}
			}			
		}
		return false;
	}
}