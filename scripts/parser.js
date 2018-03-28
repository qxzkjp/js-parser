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
		if(this.pos<this.toklist.length){
			return tokList[pos++];//value incremented after it is passed along
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
							var pair = this.postProcess(val);
							if(pair!=null){
								idx=pair[0];
								val=pair[1];
							}
						}
						this.toklist.push(new Token(idx,val));
						++this.pos;
						return this.toklist.slice(-1)[0];
					}
				}
			}
		}
		return null;
	}
}

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