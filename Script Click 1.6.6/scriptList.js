
var scriptList = {
	ruleList: {},

	addToList: function(rule, ruleKey, list){
		for (var i = 27; i < ruleKey.length; i++){
			if (ruleKey[i]){
				return;
			}
		}

		var ruleObj = scriptList.createRuleObj(rule, ruleKey);
		var type = ruleKey[3] ? 'exempt' : 'block'
		var domains = ruleKey[11] && ruleKey[12] ? ruleObj.domains : 'none'

		if (list[type] === undefined){
			list[type] = {};
		}

		if (typeof domains === 'string'){
			if (list[type]['none'] === undefined){
				list[type]['none'] = [];
			}
			list[type]['none'].push(ruleObj);
		} else {
			if (domains === undefined){
				// console.log('Error Processing Rule: ')
				// console.log(rule);
				// console.log('')
				return;
			}

			for (var i = 0; i < domains.length; i++){
				var domain = domains[i];

				if (domain[0] === '~'){
					if (list[type]['~domain'] === undefined){
						list[type]['~domain'] = {};
					}
					if (list[type]['~domain'][domain] === undefined){
						list[type]['~domain'][domain] = [];
					}
					list[type]['~domain'][domain].push(ruleObj);
				} else {
					if (list[type][domain] === undefined){
						list[type][domain] = [];
					}
					list[type][domain].push(ruleObj);
				}
			}
		}
	},

	createRuleObj: function(aRule, ruleKey){
		var ruleObj = {};
		// ruleObj.oRule = aRule;

		if (ruleKey[3]){
			aRule = aRule.slice(2);
		}
		if (ruleKey[4] || ruleKey[5]){
			aRule = aRule.slice(2);
		}
		if (ruleKey[6] || ruleKey[7]){
			aRule = aRule.slice(1);
		}
		if (ruleKey[8]){
			aRule = aRule.substr(0, aRule.length - 1);
		}

		if (ruleKey[11]){
			var dollarList = aRule.split('$')[1].split(',');

			for (var i = 0; i < dollarList.length; i++){
				if (dollarList[i].indexOf('domain=') === 0){
					var domainStr = dollarList[i].replace('domain=', '');
					ruleObj.domains = domainStr.split('|');
					break;
				}
			}
			ruleObj.opts = dollarList;	
		}

		ruleObj.rule = aRule.split('$')[0];
		ruleObj.key = ruleKey;
		return ruleObj;
	},

	checkRules: function(scriptObj, type){
		var pageDomains = {
			domain: sessionList.list[scriptObj.tabId].domain,
			subDomain: sessionList.list[scriptObj.tabId].subDomain
		}

		// var time1 = new Date();

		for (var filterName in this.ruleList){
			if (
				whiteList.checkFilters(filterName, pageDomains.domain) || 
				whiteList.checkFilters(filterName, pageDomains.subDomain) ||
				this.ruleList[filterName] === undefined ||
				this.ruleList[filterName][type] === undefined
				)
			{
				continue;
			}

			var ruleList = this.ruleList[filterName][type]['~domain'];
			if (this.checkNotDomainList(scriptObj, ruleList, pageDomains, filterName)){
				return true;
			}

			ruleList = this.ruleList[filterName][type][pageDomains.domain];
			if (this.checkDomainList(scriptObj, ruleList, pageDomains, filterName)){
				return true;
			}

			if (pageDomains.subDomain !== pageDomains.domain){
				ruleList = this.ruleList[filterName][type][pageDomains.subDomain];
				if (this.checkDomainList(scriptObj, ruleList, pageDomains, filterName)){
					return true;
				}
			}

			// var time1 = new Date();

			ruleList = this.ruleList[filterName][type]['none']
			if (this.checkLoopList(scriptObj, ruleList, pageDomains, filterName)){
				return true;
			}
			// this.logTime(time1);
		}

		return false;		
	},

	logTime: function(time1){
		var time2 = new Date();
		// console.log(time2 - time1);

		if ((time2 - time1) > 25){
			console.log(time2 - time1);
		}
	},

	checkNotDomainList: function(scriptObj, ruleList, pageDomains, filterName){
		if (ruleList === undefined){
			return false;
		}

		for (var domain in ruleList){
			if (domain.slice(1) !== pageDomains.domain || domain.slice(1) !== pageDomains.subDomain){
				for (var i = 0; i < ruleList[domain].length; i++){
					var ruleKey = ruleList[domain][i].key;

					if (!this.checkRuleOptions(scriptObj.type, ruleKey)){
						continue;
					}
					if (this.checkRule(scriptObj.url, ruleList[domain][i], scriptObj.domain, pageDomains)) {
						this.logRuleHit(scriptObj, ruleList[domain][i], filterName);
						return true;
					}

				}
			}
		}
		return false;
	},

	checkDomainList: function(scriptObj, ruleList, pageDomains, filterName){
		if (ruleList === undefined){
			return false;
		}

		for (var i = 0; i < ruleList.length; i++){
			if (!this.checkRuleOptions(scriptObj.type, ruleList[i].key)){
				continue;
			}

			if (this.checkRule(scriptObj.url, ruleList[i], scriptObj.domain, pageDomains)) {
				this.logRuleHit(scriptObj, ruleList[i], filterName);
				return true;
			}			
		}
		return false;
	},

	checkLoopList: function(scriptObj, ruleList, pageDomains, filterName){
		for (var rule in ruleList){
			if (!this.checkRuleOptions(scriptObj.type, ruleList[rule].key)){
				continue;
			}

			if (this.checkRule(scriptObj.url, ruleList[rule], scriptObj.domain, pageDomains)) {
				// this.logRuleHit(scriptObj, ruleList[rule], filterName);
				return true;
			}
		}		
	},

	checkRuleOptions: function(type, ruleKey){
		if (type === 'script'){
			return scriptList.checkOpts(15, ruleKey);
		} else if (type === 'image'){
			return scriptList.checkOpts(17, ruleKey);
		} else if (type === 'xmlhttprequest'){
			return scriptList.checkOpts(19, ruleKey);
		} else if (type === 'stylesheet'){
			return scriptList.checkOpts(21, ruleKey);
		} else if (type === 'object'){
			return scriptList.checkOpts(23, ruleKey);
		} else if (type === 'ping'){
			return scriptList.checkOpts(25, ruleKey);
		}
		return true;
	},

	checkOpts: function(optIndex, ruleKey){
		if (ruleKey[optIndex + 1]){
			return false;
		} else if (ruleKey[optIndex]){
			return true;
		} else {
			for (var i = 15; i < 27; i = i + 2){
				if (i === optIndex){
					continue;
				} else if (ruleKey[i] && !ruleKey[i+1]) {
					return false;
				}
			}
		}
		return true;
	},

	checkRule: function(url, ruleObj, urlDomain, pageDomains){
		if (ruleObj.rule === ''){
			return false;
		}

		if (ruleObj.key[14] && 
			(urlDomain !== pageDomains.domain || 
			urlDomain !== pageDomains.subDomain))
		{
			return false;
		}

		if (ruleObj.key[13] && 
			(urlDomain === pageDomains.domain || 
			urlDomain === pageDomains.subDomain))
		{
			return false;
		}

		if (ruleObj.key[12]){
			if (this.checkNotDomain(ruleObj, pageDomains.domain) && 
				this.checkNotDomain(ruleObj, pageDomains.subDomain) &&
				(this.checkDomain(ruleObj, pageDomains.domain) || 
				this.checkDomain(ruleObj, pageDomains.subDomain)))
			{
				if (ruleObj.key[4] || ruleObj.key[5]){
					return this.checkDoubleLine(url, ruleObj);
				} else if (ruleObj.key[6] || ruleObj.key[7] || ruleObj.key[8]){
					return this.checkSingleLine(url, ruleObj);
				} else {
					return this.checkRuleBody(url, ruleObj);
				}					
			}
			return false;
		}

		if (ruleObj.key[4] || ruleObj.key[5]){
			return this.checkDoubleLine(url, ruleObj);
		} else if (ruleObj.key[6] || ruleObj.key[7] || ruleObj.key[8]){
			return this.checkSingleLine(url, ruleObj);
		} else {
			return this.checkRuleBody(url, ruleObj);
		}
	},

	checkNotDomain: function(ruleObj, pageDomain){
		if (ruleObj.domains === undefined){
			return false;
		}

		for (var i = 0; i < ruleObj.domains.length; i++){
			var domain = ruleObj.domains[i];

			if (domain[0] === '~'){
				domain = domain.slice(1);
				if (pageDomain === domain){
					return false;
				}				
			}
		}
		return true;			
	},

	checkDomain: function(ruleObj, pageDomain){
		if (ruleObj.domains === undefined){
			return false;
		}

		var checkDomain = false;

		for (var i = 0; i < ruleObj.domains.length; i++){
			var domain = ruleObj.domains[i];
			if (domain[0] !== '~'){
				checkDomain = true;
				if (pageDomain === domain){
					return true;
				}				
			}
		}
		return checkDomain === false;
	},

	checkDoubleLine: function(url, ruleObj){
		if (this.checkRuleBody(url, ruleObj)){
			var starRule = ruleObj.rule.split('*');
			var carrotRule = ruleObj.rule.split('^');
			var firstRule = carrotRule[0].length < starRule[0].length ? carrotRule[0] : starRule[0];
			var index = url.indexOf(firstRule);

			return (index === 0 || url[index - 1] === '.' || url.substr(index - 2, 2) === '//' || url.substr(index - 3, 3) === 'www');
		} else {
			return false;
		}		
	},

	checkSingleLine: function(url, ruleObj){
		if (this.checkRuleBody(url, ruleObj)){
			var starRule = ruleObj.rule.split('*');
			var carrotRule = ruleObj.rule.split('^');
			var firstRule = carrotRule[0].length < starRule[0].length ? carrotRule[0] : starRule[0];
			var lastRule = carrotRule[carrotRule.length - 1].length < 
				starRule[starRule.length - 1].length ? 
				carrotRule[carrotRule.length - 1] : starRule[starRule.length - 1];

			if (ruleObj.key[6] || ruleObj.key[7]){
				return url.indexOf(firstRule) === 0;
			} else if (ruleObj.key[8]){
				return url.indexOf(lastRule) === url.length - lastRule.length;
			}
		}

		return false;	
	},

	checkRuleBody: function(url, ruleObj){
		if (ruleObj.key[9] && ruleObj.key[10]){
			return this.checkCarrotWild(url, ruleObj.rule);
		} else if (ruleObj.key[9]){
			return this.checkCarrot(url, ruleObj.rule);
		} else if (ruleObj.key[10]){
			return this.checkWildCard(url, ruleObj.rule);
		} else {
			return url.indexOf(ruleObj.rule) !== -1;
		}		
	},

	checkCarrot: function(url, rule){
		//Only checks for one carrot
		var ruleList = rule.split('^');

		for (var i = 0; i < ruleList.length; i++){
			if (url.indexOf(ruleList[i]) === -1){
				return false;
			}
		}

		for (var j = 0; j < url.length; j++){
			if (new RegExp(/[^a-zA-Z0-9_\-.%]/g).test(url[j])){
				var newScript = url.substr(0,j) + '^' + url.substr(j + 1, url.length);
				if (newScript.indexOf(rule) !== -1){
					return true;
				}
			}
		}
		return false;
	},

	checkCarrotWild: function(url, rule){
		//Only checks for one carrot
		var ruleList = rule.split('^');

		for (var i = 0; i < ruleList.length; i++){
			if (!scriptList.checkWildCard(url, ruleList[i])){
				return false;
			}
		}

		for (var j = 0; j < url.length; j++){
			if (new RegExp(/[^a-zA-Z0-9_\-.%]/g).test(url[j])){
				var newScript = url.substr(0,j) + '^' + url.substr(j + 1, url.length);
				if (scriptList.checkWildCard(newScript, rule)){
					return true;
				}
			}
		}
		return false;
	},

	checkWildCard: function(url, rule){
		var ruleList = rule.split('*');
		for (var i = 0; i < ruleList.length; i++){
			if (url.indexOf(ruleList[i]) === -1){
				return false;
			}
		}

		rule = rule.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
		try{
			return new RegExp(rule.split("*").join(".*")).test(url);
		}catch(err){
			console.log('wildCard error');
			console.log(rule);
			console.log(' ');
		}	
		return false;
	},


	logRuleHit: function(scriptObj, ruleObj, list){
		// console.log(list);
		// console.log(scriptObj.type + ' ' + scriptObj.url);
		// console.log(ruleObj.oRule); //UnComment oRule in createRuleObj
		// console.log('')	
	}
}









