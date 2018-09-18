

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if (msg.hideElements !== undefined){
			if (scriptDisabled === false && filtersEnabled === true && elementDisabled === false){
				port.postMessage({hideElements: true});
			}
		} else {
			if (!elementList.checkRules(msg.tabElement, '#@#')){
				if (elementList.checkRules(msg.tabElement, '##')){
					port.postMessage({block: msg.tabElement});
				}
			}
		}
	});
});

var elementList = {
	ruleList: {},

	setDisable: function(){
		if (elementDisabled){
			elementDisabled = false;
			chrome.storage.local.get('options', function(data){
				data.options.elementDisabled = false;
				chrome.storage.local.set(data);
				elementList.reloadAllLists();
			})
		} else {
			elementDisabled = true;
			chrome.storage.local.get('options', function(data){
				data.options.elementDisabled = true;
				chrome.storage.local.set(data);
				elementList.ruleList = {};
			})
		}
	},

	reloadAllLists: function(){
		chrome.storage.local.get('easyListOpt', function(data){
			if (data.easyListOpt.enabled === true){
				chrome.storage.local.get('easyList', function(list){
					elementList.reloadElementList('easyList', list.easyList);
				});
			}
		});

		chrome.storage.local.get('easyPrivacyOpt', function(data){
			if (data.easyPrivacyOpt.enabled === true){
				chrome.storage.local.get('easyPrivacy', function(list){
					elementList.reloadElementList('easyPrivacy', list.easyPrivacy);
				});
			}
		});

		chrome.storage.local.get('fanboyAnnoyOpt', function(data){
			if (data.fanboyAnnoyOpt.enabled === true){
				chrome.storage.local.get('fanboyAnnoy', function(list){
					elementList.reloadElementList('fanboyAnnoy', list.fanboyAnnoy);
				});
			}
		});

		chrome.storage.local.get('fanboySocialOpt', function(data){
			if (data.fanboySocialOpt.enabled === true){
				chrome.storage.local.get('fanboySocial', function(list){
					elementList.reloadElementList('fanboySocial', list.fanboySocial);
				});
			}
		});

		chrome.storage.local.get('fanboyTrackerOpt', function(data){
			if (data.fanboyTrackerOpt.enabled === true){
				chrome.storage.local.get('fanboyTracker', function(list){
					elementList.reloadElementList('fanboyTracker', list.fanboyTracker);
				});
			}
		});
	},

	reloadElementList: function(name, list){
		if (elementList.ruleList[name] === undefined){
			elementList.ruleList[name] = {};
		}

		for (var i = 0; i < list.length; i++){
			var rule = list[i];
			var ruleKey = createRuleKey(rule);

			if (ruleKey[0] === true){
				continue;
			} else if (ruleKey[2] === true || ruleKey[1] === true){
				elementList.addToList(rule, ruleKey, elementList.ruleList[name]);
			}	
		}	
	},

	addToList: function(rule, ruleKey, list){
		var type = ruleKey[2] === true ? '#@#' : '##';
		var domainObj = rule.split(type);

		if (rule.indexOf('^') !== -1 ||
			rule.indexOf('$') !== -1 ||
			rule.indexOf('*') !== -1 ||
			rule.indexOf('<') !== -1 ||
			rule.indexOf('>') !== -1 ||
			rule.indexOf('+') !== -1 ||
			rule.indexOf('][') !== -1 ||
			domainObj[0].length > 0
			)
		{
			if (list['loopList'] === undefined){
				list['loopList'] = {};
			}
			if (list['loopList'][type] === undefined){
				list['loopList'][type] = {};
			}

			if (domainObj[0].length === 0){
				if (list['loopList'][type]['none'] === undefined){
					list['loopList'][type]['none'] = [];
				}

				var ruleObj = this.createRuleObj(domainObj[1], list['loopList'][type]['none'], rule);

				if (ruleObj !== undefined){
					list['loopList'][type]['none'].push(ruleObj);
				}
			} else {
				domainList = domainObj[0].split(',');
				for (var i = 0; i < domainList.length; i++){
					if (list['loopList'][type][domainList[i]] === undefined){
						list['loopList'][type][domainList[i]] = [];
					}
					var ruleObj = this.createRuleObj(domainObj[1], list['loopList'][type][domainList[i]], rule);

					if (ruleObj !== undefined){
						list['loopList'][type][domainList[i]].push(ruleObj);
					}
				}
			}
		} else {
			if (list['checkList'] === undefined){
				list['checkList'] = [];
			}

			list['checkList'].push(rule);
			// list['checkList'][rule] = '';
		}
	},

	createRuleObj: function(element, list, rule){
		var elemObj = {rule: rule};

		if (element.indexOf('>') === -1 &&
			element.indexOf('<') === -1 &&
			element.indexOf('+') === -1
			)
		{
			var origElem = element;
			while (element.length > 0){
				var elemLength = element.length;

				var firstSpace = element.indexOf(' ');
				var firstBracket = element.indexOf('[');
				var firstBreak;

				if (firstSpace !== -1 && firstBracket !== -1){
					firstBreak = firstSpace < firstBracket ? firstSpace : firstBracket;
				} else if (firstSpace !== -1){
					firstBreak = firstSpace;
				} else {
					firstBreak = firstBracket;
				}
				
				if (element[0] === '#') {
					elemObj.id = element.substr(1, firstBreak - 1);
					element = element.slice(firstBreak);

					if (elemLength === element.length){
						// this.logError(origElem);
						break;
					}
				} else if (element[0] === '.'){
					elemObj.class = element.substr(1, firstBreak - 1);
					element = element.slice(firstBreak);
					if (elemLength === element.length){
						// this.logError(origElem);
						break;
					}
				} else if (firstBracket !== 0) {
					elemObj.node = element.substr(0, firstBracket);
					element = element.slice(firstBracket);
					if (elemLength === element.length){
						// this.logError(origElem);
						break;
					}
				} else {
					var nextBracket = element.indexOf(']');
					var attStr = element.substr(1, nextBracket - 1);
					if (elemObj.atts === undefined){
						elemObj.atts = [];
					}
					var attObj = attStr.split('=');

					if (attObj.length > 2){
						var newValue = '';
						for (var i = 1; i < attObj.length; i++){
							newValue += attObj[i];
						}
						attObj = [attObj[0], newValue];
					}

					if (attObj[1] !== undefined && attObj[1][0] === '"' && attObj[1].slice(-1) === '"'){
						attObj[1] = attObj[1].substr(1, attObj[1].length - 2);
					}

					var att = {key: attObj[0], value: attObj[1]};

					elemObj.atts.push(att);
					element = element.slice(nextBracket + 1);
					if (elemLength === element.length){
						// this.logError(origElem);
						break;
					}
				}
			}
			// console.log(elemObj);
			return elemObj;
		} else {
			// css Selectors Coming soon
			return;
		}

	},

	logError: function(elem){
		console.log('Process Error');
		console.log(elem);
		console.log('');	
	},

	checkRules: function(element, type){
		for (var listName in this.ruleList){
			if (
				whiteList.checkFilters(listName, element.domain) ||
				whiteList.checkFilters(listName, element.subDomain) ||
				this.ruleList[listName] === undefined
				)
			{
				continue;
			}

			if (this.checkSimpleIdCheck(type, element, listName)){
				return true;
			} else if (this.checkSimpleClassCheck(type, element, listName)){
				return true;
			} else if (this.checkElementCheck(type, element, listName)){
				return true;
			} else if (this.checkMultiAtt(type, element, listName)){
				return true;
			}
		}

		return false;
	},

	checkSimpleIdCheck: function(type, element, listName){
		if (element.id !== undefined){
			if (this.ruleList[listName]['checkList'] === undefined){
				return false;
			}

			var str = type + '#' + element.id;

			if (this.ruleList[listName]['checkList'].indexOf(str) !== -1){
				// this.logAtt(str, element);
				return true;
			}
		}
		return false;
	},

	checkSimpleClassCheck: function(type, element, listName){
		if (element.class !== undefined){
			if (this.ruleList[listName]['checkList'] === undefined){
				return false;
			}

			var classList = element.class.split(' ');

			for (var i = 0; i < classList.length; i++){
				var aClass = classList[i];

				var str = type + '.' + aClass;
				if (this.ruleList[listName]['checkList'].indexOf(str) !== -1){
					// this.logAtt(str, element);
					return true;	
				}
			}
		}
		return false;
	},

	checkElementCheck: function(type, element, listName){
		if (this.ruleList[listName]['checkList'] === undefined){
			return false;
		}

		var attList = this.getAttList(element);
		var checkList = [];
		var upperNode = element.nodeName.toUpperCase();
		var lowerNode = element.nodeName.toLowerCase();

		for (var i = 0; i < attList.length; i++){
			var str;
			if (element.id !== undefined){
				checkList.push(type + '#' + element.id + ' ' + upperNode + attList[i]);
				checkList.push(type + '#' + element.id + ' ' + lowerNode + attList[i]);
				checkList.push(type + '#' + element.id + attList[i]);
			}

			if (element.class !== undefined){
				var classList = element.class.split(' ');

				for (var j = 0; j < classList.length; j++){
					var aClass = classList[j];
					checkList.push(type + '.' + aClass + ' ' + upperNode + attList[i]);
					checkList.push(type + '.' + aClass + ' ' + lowerNode + attList[i]);
					checkList.push(type + '.' + aClass + attList[i]);
				}
			}
			checkList.push(type + upperNode + attList[i]);
			checkList.push(type + lowerNode + attList[i]);
			checkList.push(type + attList[i]);
		}

		for (var i = 0; i < checkList.length; i++){
			if (this.ruleList[listName]['checkList'].indexOf(checkList[i])){
				// this.logAtt(checkList[i], element);
				return true;
			}
		}
		return false;
	},

	getAttList: function(element){
		var attList = [];
		for (var i = 0; i < element.attList.length; i++){
			var att = element.attList[i];
			var attStr = '[' + att.attName + '=' + '"' + att.value + '"' + ']';
			attList.push(attStr);
		}
		return attList;
	},

	checkMultiAtt: function(type, element, listName){
		if (this.ruleList[listName]['loopList'] === undefined){
			return false;
		}

		var ruleList = this.ruleList[listName]['loopList'][type][element.domain];
		if (ruleList !== undefined){
			if (this.checkRulesInList(element, ruleList)){
				return true;
			}
		}
		ruleList = this.ruleList[listName]['loopList'][type][element.subDomain];
		if (ruleList !== undefined){
			if (this.checkRulesInList(element, ruleList)){
				return true;
			}
		}

		ruleList = this.ruleList[listName]['loopList'][type]['none'];
		if (ruleList === undefined){
			return false;
		}

		if (this.checkRulesInList(element, ruleList)){
			return true;
		}


		return false;
	},

	checkRulesInList: function(element, ruleList){
		for (var i = 0; i < ruleList.length; i++){
			var ruleObj = ruleList[i];
			if (this.checkId(element, ruleObj) &&
				this.checkClass(element, ruleObj) &&
				this.checkNode(element, ruleObj) &&
				this.checkAtts(element, ruleObj)
				)
			{
				return true;
			}
		}
		return false;
	},

	checkId: function(element, ruleObj){
		if (ruleObj.id !== undefined && ruleObj.id !== element.id){
			return false;
		}
		return true;
	},

	checkClass: function(element, ruleObj){
		if (ruleObj.class !== undefined){
			var inClass = false;
			if (element.class !== undefined){
				var classList = element.class.split(' ');

				for (var j = 0; j < classList.length; j++){
					var elemClass = classList[j];
					if (ruleObj.class === elemClass){
						inClass = true;
					}
				}					
			}
			if (inClass === false){
				return false;
			}
		}
		return true;
	},

	checkNode: function(element, ruleObj){
		if (ruleObj.node !== undefined){
			var upperNode = ruleObj.node.toUpperCase();
			var lowerNode = ruleObj.node.toLowerCase();

			if (upperNode === element.nodeName || 
				lowerNode === element.nodeName || 
				ruleObj.node === element.nodeName)
			{
				return true;
			} else {
				return false;
			}
		}
		return true;
	},

	checkAtts: function (element, ruleObj){
		if (ruleObj.atts === undefined){
			return false;
		}

		for (var j = 0;  j < ruleObj.atts.length; j++){
			var ruleAtt = ruleObj.atts[j];
			var key = ruleAtt.key;
			var param;

			if (key.slice(-1) === '^'){
				key = key.substr(0, key.length - 1);
				param = '^';
			} else if (key.slice(-1) === '$'){
				key = key.substr(0, key.length - 1);
				param = '$';
			} else if (key.slice(-1) === '*'){
				key = key.substr(0, key.length - 1);
				param = '*';
			}

			var inList = false;
			for (var k = 0; k < element.attList.length; k++){
				var att = element.attList[k];
				if (key === att.attName){
					if (param === '^'){
						if (ruleAtt.value === att.value.substr(0,ruleAtt.value.length)){
							inList = true;
						}
					} else if (param === '$'){
						if (ruleAtt.value === att.value.substr(att.value.length - ruleAtt.value.length, ruleAtt.value.length)){
							inList = true;
						}
					} else if (param === '*'){
						if (att.value.indexOf(ruleAtt.value) !== -1){
							inList = true;
						}
					} else {
						if (att.value === ruleAtt.value){
							inList = true;
						}
					}
				}
			}
			if (inList === false){
				return false;
			}
		}
		// this.logAtt(ruleObj, element);
		return true;
	},

	logAtt: function(str, element){
		// console.log(str);
		// console.log(element);
		// console.log('');
	}

}




