

var mediaList = {
	list: [],
	deleteList: [],

	loadList: function(){
		chrome.storage.local.get('mediaList', function(theList){
			if (theList.mediaList != undefined){
				mediaList.list = theList.mediaList;
			}
		})
	},

	addToList: function(subDomain) {
		var index = this.list.indexOf(subDomain);

		if (index < 0){
			this.list.push(subDomain);
			chrome.storage.local.set({'mediaList': this.list});
		}
		var deleteIndex = this.deleteList.indexOf(subDomain);
		if (deleteIndex >= 0){
			this.deleteList.splice(deleteIndex, 1);
		}
	},

	removeFromList: function(subDomain) {
		var index = this.list.indexOf(subDomain);

		if (index >= 0){
			this.list.splice(index, 1);
			this.deleteList.push(subDomain);
			chrome.storage.local.set({'mediaList': this.list});
		}
	},

	checkList: function(subDomain) {
		return this.list.indexOf(subDomain) >= 0;
	}
}