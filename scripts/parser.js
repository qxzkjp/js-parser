class TreeNode {
	constructor(){
		this.subnodes=[];
		this.parent=null;
		this.attrib = {};
	}
	append(newNode){
		if(newNode.parent!=null){
			newNode.parent.remove(newNode);
		}
		newNode.parent=this;
		this.subnodes.push(newNode);
	}
	remove(subNode){
		if(subNode.parent==this){
			var idx = this.subnodes.indexOf(subNode);
			this.subnodes.splice(idx,1);
			subNode.parent=null;
		}
	}
	replace(newNode){
		var idx = this.parent.subnodes.indexOf(this);
		this.parent.subnodes.splice(idx,1,newNode);
		if(newNode.parent!=null){
			newNode.parent.remove(newNode);
		}
		newNode.parent=this.parent;
		this.parent=null;
	}
	at(idx){
		return this.subnode[idx];
	}
}

class Token {
	constructor(type, data){
		this.type=type;
		this.value=data;
	}
}

class TokenStream{
	constructor(str, regexpList, func){
		if(regexpList instanceof Array){
			this.regexpList = regexpList;
		}else{
			this.regexpList = [];
		}
		this.postProcess = func;
		
		this.strpos=0;
		this.str=str;
		this.pos=0;
		this.toklist=[];
	}
	getToken(){
		var ret=this.peekToken();
		if(ret!=null){
			++this.pos;
		}
		return ret;
	}
	peekToken(){
		if(this.pos<this.toklist.length){
			return this.toklist[this.pos];
		}else{
			for(var idx = 0; idx < this.regexpList.length; ++idx){
				var pttn = this.regexpList[idx];
				var match=pttn.exec(this.str.substring(this.strpos));
				if(match!=null){
					var val=match[0];
					var pos = match["index"];
					var endpos = this.strpos + pos + val.length;
					if(pos == 0){
						this.strpos = endpos;
						if(this.postProcess!==undefined){
							var pair;
							if(this.postProcess instanceof TokenFilter){
								pair = this.postProcess.apply(idx, val);
							}else{
								pair = this.postProcess(idx, val);
							}
							if(pair instanceof Array){
								idx=pair[0];
								val=pair[1];
							}else if(pair === -1){
								//if post-processing gives us -1,
								//we skip this token and move onto the next
								return this.peekToken();
							}
						}
						this.toklist.push(new Token(idx,val));
						return this.toklist.slice(-1)[0];
					}
				}
			}
		}
		return null;
	}
	rewind(val=1){
		if(val>=1){
			this.pos-=val;
		}
		if(val=0){
			this.pos=0;
		}
	}
}

var numberMap = {
	"a" : [3,1],
	"one" : [3,1],
	"two" : [3,2],
	"three" : [3,3],
	"four" : [3,4],
	"five" : [3,5],
	"six" : [3,6],
	"seven" : [3,7],
	"eight" : [3,8],
	"nine" : [3,9],
	"ten" : [3,10],
	"eleven" : [3,11],
	"twelve" : [3,12]
}

class TokenFilter{
	constructor(excludedIndicies, listOfMaps, listOfFunctions, caseInsensitive){
		this.excludedIndicies=excludedIndicies;
		this.listOfMaps=listOfMaps;
		this.listOfFunctions=listOfFunctions;
		this.caseInsensitive=caseInsensitive;
	}
	apply(idx, val){
		if(this.caseInsensitive){
			val=val.toLowerCase();
		}
		if(this.excludedIndicies.indexOf(idx)>-1){
			//skip this token
			return -1;
		}
		for(var list of this.listOfMaps){
			if(list[val]!==undefined){
				return list[val];
			}
		}
		if(this.listOfFunctions[idx]!==undefined){
			return this.listOfFunctions[idx](idx, val);
		}
		if(this.caseInsensitive){
			return [idx,val];
		}else{
			return null;
		}
	}
}

function ordinalStripper(idx, val){
	return [idx, /[1-9][0-9]+/.exec(val)[0]];
}

var standardFilter = new TokenFilter([0],[numberMap],[undefined,ordinalStripper], true);

function whiteSpaceFilter(idx, val){
	if(idx===0){
		return -1;
	}else{
		return null;
	}
}

var whiteSpaceRegEx = /^[ \t\r\n]+/;
var ordinalRegEx = /^[1-9][0-9]*[A-z]+/;
var wordRegEx = /^[A-z]+/;
var numberRegEx = /^[1-9][0-9]*/;

var testStream = new TokenStream(
	"23rd three FIVE bEnd Or  43",
	[whiteSpaceRegEx,ordinalRegEx,wordRegEx,numberRegEx],
	standardFilter);

class Parser {
	constructor(){
		this.stacks=[];
		this.tokenLists=[];
		this.rules=[];
		this.tokenStream;
		this.tree;
		this.activeNode;
	}
	parse(){
		
	}
}