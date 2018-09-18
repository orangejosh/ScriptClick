

var port = chrome.runtime.connect({name: 'element'});

port.onMessage.addListener(function(msg) {
	if (msg.hideElements === true){
		domList.checkElements();
	} else {
		hideElement(msg.block);
	}
});

document.addEventListener("DOMContentLoaded", function(event) {
	domList.list = [];
	pageList.list = [];

	port.postMessage({hideElements: false});

 	// domList.checkElements();
}, false);

var domList = {
	list: [],

	checkElements: function() {
		// var count = 0;
		var elements = document.getElementsByTagName('*');

		for (var i = 0; i < elements.length; i++){
			var elem = elements[i];
			this.list.push(elem);

			if (elem.nodeName === 'HEAD' ||
				elem.nodeName === 'META' ||
				elem.nodeName === 'SCRIPT' ||
				elem.nodeName === 'STYLE' ||
				elem.attributes.length === 0){
				continue;
			}

			var elemObj = {elemIndex: i};
			pageList.list.push(elemObj);

			elemObj.domain = extractDomain(document.domain);
			elemObj.subDomain = extractSubDomain(document.domain);
			elemObj.nodeName = elem.nodeName;
			elemObj.attList = [];

			for (var j = 0; j < elem.attributes.length; j++){
				if (elem.attributes[j].name === 'class'){
					elemObj.class = elem.attributes[j].value;
				} else if (elem.attributes[j].name === 'id'){
					elemObj.id = elem.attributes[j].value;
				} else {
					var att = {attName: elem.attributes[j].name, value: elem.attributes[j].value};
					elemObj.attList.push(att);
				}
			}

			if (!pageList.inList(elemObj)){
				// console.log(elemObj);
				// count++;
				port.postMessage({tabElement: elemObj});
			}
		}
		// console.log(elements.length)
		// console.log(count);
		// console.log(pageList.list);
	}
}

function extractSubDomain(url){
    var domain = url.split('/')[2];
    if (domain === undefined){
    	return url;
    }
    if (domain.slice(0,3) === 'www'){
    	domain = domain.slice(4);
    }

    return domain;
}

function extractDomain(url) {
    var domain = this.extractSubDomain(url);

	var list = domain.split('.');
	domain = list[list.length - 2]+ '.' + list[list.length - 1];
    return domain;
}

var pageList = {
	list: [],

	inList: function(elemObj){
		Loop1:
		for (var i = 0; i < this.list.length - 1; i++){
			var aObj = this.list[i];
			if (elemObj.nodeName === aObj.nodeName && 
				elemObj.class === aObj.class && 
				elemObj.id === aObj.id && 
				elemObj.attList.length === aObj.attList.length) 
			{
				for (var j = 0; j < elemObj.attList.length; j++){
					var attSame = false;
					for (var k = 0; k < aObj.attList.length; k++){
						if (elemObj.attList[j].attName === aObj.attList[k].attName &&
							elemObj.attList[j].value === aObj.attList[k].value){
							attSame = true;
						}
					}
					if (attSame === false){
						continue Loop1;
					}
				}
				if (elemObj.clones === undefined){
					elemObj.clones = [];
				}
				elemObj.clones.push(aObj.elemIndex);

				if (aObj.clones === undefined){
					aObj.clones = [];
				}
				aObj.clones.push(elemObj.elemIndex);
			}
		}
		return elemObj.clones !== undefined;
	}
}

var hideElement = function(elem){
	domList.list[elem.elemIndex].style.display = 'none';

	// console.log('hideElement');
	// console.log(domList.list[elem.elemIndex]);

	if (elem.clones !== undefined){
		for (var i = 0; i < elem.clones.length; i++){
			//Don't think this works
			domList.list[elem.clones[i]].style.display = 'none'
		}
	}
}



