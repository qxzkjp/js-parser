class TreeNode {
  constructor() {
    this.subnodes = [];
    this.parent   = null;
    this.attrib   = {};
  }

  append(newNode) {
    if (newNode.parent != null) {
      newNode.parent.remove(newNode);
    }
    newNode.parent = this;
    this.subnodes.push(newNode);
  }

  remove(subNode) {
    if (subNode.parent === this) {
      var idx = this.subnodes.indexOf(subNode);
      this.subnodes.splice(idx, 1);
      subNode.parent = null;
    }
  }

  replace(newNode) {
    var idx = this.parent.subnodes.indexOf(this);
    this.parent.subnodes.splice(idx, 1, newNode);
    if (newNode.parent != null) {
      newNode.parent.remove(newNode);
    }
    newNode.parent = this.parent;
    this.parent    = null;
  }

  at(idx) {
    return this.subnodes[idx];
  }

  count() {
    return this.subnodes.length;
  }
}

class Token {
  constructor(type, data, trueStr, skipped) {
    this.type    = type;
    this.value   = data;
    this.trueStr = trueStr;
    this.skipped = skipped;
    if (trueStr !== undefined) {
      this.length = trueStr.length;
    }
  }

  equals(token) {
    return (this.type === token.type) && (this.value === token.value);
  }
}

class TokenStream {
  constructor(str, regexpList, func) {
    if (regexpList instanceof Array) {
      this.regexpList = regexpList;
    } else {
      this.regexpList = [];
    }
    this.postProcess = func;

    this.strpos      = 0;
    this.str         = str;
    this.pos         = 0;
    this.toklist     = [];
    this.trueTokList = [];
  }

  changeString(str) {
    this.strpos      = 0;
    this.str         = str;
    this.pos         = 0;
    this.toklist     = [];
    this.trueTokList = [];
  }

  getToken() {
    var ret = this.peekToken();
    if (ret != null) {
      ++this.pos;
    }
    return ret;
  }

  peekToken() {
    if (this.pos < this.toklist.length) {
      return this.toklist[this.pos];
    } else {
      for (var idx = 0; idx < this.regexpList.length; ++idx) {
        var pttn  = this.regexpList[idx];
        var match = pttn.exec(this.str.substring(this.strpos));
        if (match != null) {
          var val     = match[0];
          var origVal = val;
          var pos     = match["index"];
          var endpos  = this.strpos + pos + val.length;
          if (pos == 0) {
            this.strpos = endpos;
            if (this.postProcess !== undefined) {
              var pair;
              if (this.postProcess instanceof TokenFilter) {
                pair = this.postProcess.apply(idx, val);
              } else {
                pair = this.postProcess(idx, val);
              }
              if (pair instanceof Array) {
                idx = pair[0];
                val = pair[1];
              } else if (pair === -1) {
                //if post-processing gives us -1,
                //we skip this token and move onto the next
                this.trueTokList.push(new Token(idx, val, origVal, true));
                return this.peekToken();
              }
            }
            this.trueTokList.push(new Token(idx, val, origVal, false));
            this.toklist.push(new Token(idx, val));
            return this.toklist.slice(-1)[0];
          }
        }
      }
    }
    return null;
  }

  rewind(val = 1) {
    if (val >= 1) {
      this.pos -= val;
    }
    if (val == 0) {
      this.pos = 0;
    }
  }

  getUpperLimit() {
    //we can't possibly have more tokens than chars in the string
    //might replace this with a tighter bound later
    return this.str.length;
  }

  savePos() {
    return this.pos;
  }

  loadPos(val) {
    if (val <= this.toklist.length) {
      this.pos = val;
    } else {
      while (this.getToken() != null && this.toklist.length < val) ;
    }
  }

  getTokenStringPos(idx) {
    var count  = 0;
    var length = 0;
    for (var token of this.trueTokList) {
      if (count == idx && token.skipped == false) {
        break;
      }
      length += token.length;
      if (token.skipped != true) {
        ++count;
      }
    }
    return length;
  }
}

var TOK_WSP = 0;
var TOK_ORD = 1;
var TOK_WRD = 2;
var TOK_NUM = 3;
var TOK_PCT = 4;

var numberMap = {
  "a"     : [TOK_NUM, 1],
  "an"    : [TOK_NUM, 1],
  "one"   : [TOK_NUM, 1],
  "two"   : [TOK_NUM, 2],
  "three" : [TOK_NUM, 3],
  "four"  : [TOK_NUM, 4],
  "five"  : [TOK_NUM, 5],
  "six"   : [TOK_NUM, 6],
  "seven" : [TOK_NUM, 7],
  "eight" : [TOK_NUM, 8],
  "nine"  : [TOK_NUM, 9],
  "ten"   : [TOK_NUM, 10],
  "eleven": [TOK_NUM, 11],
  "twelve": [TOK_NUM, 12]
};

var ordinalMap = {
  "first"   : [TOK_ORD, 1],
  "second"  : [TOK_ORD, 2],
  "third"   : [TOK_ORD, 3],
  "fourth"  : [TOK_ORD, 4],
  "fifth"   : [TOK_ORD, 5],
  "sixth"   : [TOK_ORD, 6],
  "seventh" : [TOK_ORD, 7],
  "eighth"  : [TOK_ORD, 8],
  "ninth"   : [TOK_ORD, 9],
  "tenth"   : [TOK_ORD, 10],
  "eleventh": [TOK_ORD, 11],
  "twelfth" : [TOK_ORD, 12]
};

class TokenFilter {
  constructor(excludedIndicies, listOfMaps, listOfFunctions, caseInsensitive) {
    this.excludedIndicies = excludedIndicies;
    this.listOfMaps       = listOfMaps;
    this.listOfFunctions  = listOfFunctions;
    this.caseInsensitive  = caseInsensitive;
  }

  apply(idx, val) {
    if (this.caseInsensitive) {
      val = val.toLowerCase();
    }
    if (this.excludedIndicies.indexOf(idx) > -1) {
      //skip this token
      return -1;
    }
    for (var list of this.listOfMaps) {
      if (list[val] !== undefined) {
        return list[val];
      }
    }
    if (this.listOfFunctions[idx] !== undefined) {
      return this.listOfFunctions[idx](idx, val);
    }
    if (this.caseInsensitive) {
      return [idx, val];
    } else {
      return null;
    }
  }
}

function ordinalStripper(idx, val) {
  return [idx, parseInt(/[1-9][0-9]+/.exec(val)[0])];
}


let tokenValuators      = [];
tokenValuators[TOK_ORD] = ordinalStripper;
tokenValuators[TOK_NUM] = ordinalStripper;

let standardFilter = new TokenFilter([TOK_WSP], [numberMap, ordinalMap], tokenValuators, true);

function whiteSpaceFilter(idx, val) {
  if (idx === 0) {
    return -1;
  } else {
    return null;
  }
}

let whiteSpaceRegEx  = /^[ \t\r\n]+/;
let ordinalRegEx     = /^[1-9][0-9]*[A-z]+/;
let wordRegEx        = /^[A-z]+/;
let numberRegEx      = /^[1-9][0-9]*/;
let punctuationRegEx = /^[,;:.!?/\\[\]()"'@]+/;

let standardRegEx      = [];
standardRegEx[TOK_WSP] = whiteSpaceRegEx;
standardRegEx[TOK_ORD] = ordinalRegEx;
standardRegEx[TOK_WRD] = wordRegEx;
standardRegEx[TOK_NUM] = numberRegEx;
standardRegEx[TOK_PCT] = punctuationRegEx;

let testStream = new TokenStream(
  "23rd fourth three FIVE bEnd Or  43",
  standardRegEx,
  standardFilter);

function standardStreamFactory(str) {
  return new TokenStream(
    str,
    standardRegEx,
    standardFilter);
}

class GrammarRule {
  /**
   * @param {Token[]} lhs
   * @param {Token[]} rhs
   */
  constructor(lhs, rhs) {
    if (lhs.length > 1) {
      throw new Error("Parser currently only supports context-free rules");
    }
    if (lhs.length < 1) {
      throw new Error("Grammar rule must have a left hand side");
    }
    this.lhs = lhs;
    this.rhs = rhs;

    let possibleRhs = [[]];

    for (let i = 0; i < rhs.length; ++i) {
      let withoutOption = [];
      let tokens        = [rhs[i]];
      if (rhs[i] instanceof Optional) {
        withoutOption = possibleRhs.slice(0);
        tokens        = rhs[i].tokens
      }

      for (let j = 0; j < possibleRhs.length; ++j)
        possibleRhs[j] = possibleRhs[j].concat(tokens);
      possibleRhs = possibleRhs.concat(withoutOption);
    }

    if (possibleRhs.length === 1) {
      this.rhs = rhs;
    }
    else {
      this.subRules = [];
      for (let rhs of possibleRhs)
        this.subRules.push(new GrammarRule(this.lhs, rhs));
    }

  }

  /**
   * @return Array
   */
  getSubRules() {
    if (this.subRules !== undefined) {
      return this.subRules;
    } else {
      return [this];
    }
  }
}

class Optional {
  /**
   * @param {Token[]} tokens
   */
  constructor(...tokens) {
    this.tokens = tokens;
  }
}

class GrammarToken {
  constructor(id, displayName, treeMap) {
    this.id          = id;
    this.displayName = displayName;
    if (treeMap !== undefined) {
      this.isFinal = true;
      this.treeMap = treeMap;
    } else {
      this.isFinal = false;
    }
  }

  isFinal() {
    return this.isFinal;
  }

  checkTokenString(tokStr) {
    if (!this.isFinal) {
      return null;
    } else {
      return this.treeMap.contains(tokStr);
    }
  }
}

class GrammarProperties {
  constructor(idx, attr = {}) {
    this.index = idx;
    this.attr  = cloneAttr(attr);
  }

  clone() {
    return new GrammarProperties(this.idx, this.attr);
  }
}

class TreeMap {
  constructor(nameList, att = {}, streamFactory = standardStreamFactory) {
    this.tree          = [];
    this.streamFactory = streamFactory;
    for (var idx in nameList) {
      this.addIndex(nameList[idx], new GrammarProperties(parseInt(idx), att));
    }
  }

  addIndex(name, idx) {
    var stack  = this.tree;
    var tokStr = this.streamFactory(name);
    while (tokStr.peekToken() != null) {
      var word = tokStr.getToken().value;
      if (stack[word] === undefined) {
        stack[word] = [];
      }
      stack = stack[word];
    }
    if (idx instanceof Array) {
      if (stack[""] === undefined) {
        stack[""] = idx;
      } else {
        stack[""] = stack[""].concat(idx);
      }
    } else {
      if (stack[""] === undefined) {
        stack[""] = [idx];
      } else {
        stack[""].push(idx);
      }
    }
  }

  addSynonym(name, nameInMap, att = {}) {
    var idx = this.contains(this.streamFactory(nameInMap));
    if (!(idx instanceof Array)) {
      return false;
    }
    this.addIndex(name, new GrammarProperties(idx, att));
  }

  contains(tokStr) {
    //check if a token string has a name in the list
    var stack   = [];
    var current = this.tree;
    var oldPos  = tokStr.savePos();
    while (tokStr.peekToken() != null) {
      var token = tokStr.getToken();
      if (current[token.value] !== undefined) {
        stack.push(current[token.value])
        current = current[token.value];
      } else {
        tokStr.rewind(); //un-pop previous token
        break;
      }
    }
    while (current[""] == undefined) {
      current = stack.pop();
      tokStr.rewind();
      if (stack.length == 0) {
        current = undefined;
        break;
      }
    }
    if (current != undefined) {
      return current[""];
    } else {
      return null;
    }
  }
}

var names = new TreeMap([
  "ravenous bugblatter beast of traal",
  "ravenous bugblatter beast of traal during the night time",
  "ford prefect",
  "tricia marie mcmillan",
  "zaphod beeblebrox",
  "slartibartfast"
]);
names.addSynonym("trillian", "tricia marie mcmillan");
names.addSynonym("president of the galaxy", "zaphod beeblebrox");

var thirdPersonSingularPresent = {
  "subjectNumber": 1,
  "subjectPerson": 3,
  "tense"        : "present"
};

var firstPersonSingularPresent = {
  "subjectNumber": 1,
  "subjectPerson": 1,
  "tense"        : "present"
};

var thirdPersonSingularNoun = {
  "number": 1,
  "person": 3
};

var thirdPersonPluralNoun = {
  "number": 2,
  "person": 3
};

var nounMap = new TreeMap([
  "cat",
  "dog",
  "alice",
  "bob",
  "jane",
  "john",
  "man",
  "woman"
], thirdPersonSingularNoun);

nounMap.addSynonym("men", "man", thirdPersonPluralNoun);

var verbMap = new TreeMap([
  "hit",
  "bite",
  "kick",
  "kiss"
], firstPersonSingularPresent);

verbMap.addSynonym("hits", "hit", thirdPersonSingularPresent);
verbMap.addSynonym("bites", "bite", thirdPersonSingularPresent);
verbMap.addSynonym("kicks", "kick", thirdPersonSingularPresent);
verbMap.addSynonym("kisses", "kiss", thirdPersonSingularPresent);

var determinerMap = new TreeMap([
  "the",
  "a",
  "an",
  "he",
  "she",
  "it",
  "his",
  "her",
  "its"
]);

var adjectiveMap = new TreeMap([
  "red",
  "blue",
  "hot",
  "cold",
  "big",
  "little",
  "rough",
  "smooth",
  "soft",
  "gentle"
]);

var adverbMap = new TreeMap([
  "quickly",
  "slowly",
  "roughly",
  "smoothly",
  "softly",
  "gently"
]);

numberMap = {
  "contains": function (tokStr) {
    if (tokStr.peekToken().type == TOK_NUM) {
      return [tokStr.getToken().val];
    } else {
      return null;
    }
  }
};

S     = new GrammarToken("S", "sentence");
VP    = new GrammarToken("VP", "verb phrase");
NP    = new GrammarToken("NP", "noun phrase");
DP    = new GrammarToken("DP", "determiner phrase");
V     = new GrammarToken("V", "verb", verbMap);
N     = new GrammarToken("N", "noun", nounMap);
D     = new GrammarToken("Det", "determiner", determinerMap);
Num   = new GrammarToken("Det", "determiner (number)", numberMap);
Adj   = new GrammarToken("Adj", "adjective", adjectiveMap);
Adv   = new GrammarToken("Adv", "adverb", adverbMap);
Vstar = new GrammarToken("V*", "modified verb");
//Nstar = new GrammarToken("N*","modified noun")

naturalRules = [];
naturalRules.push(new GrammarRule([S], [VP, DP]));
naturalRules.push(new GrammarRule([VP], [DP, Vstar]));
naturalRules.push(new GrammarRule([Vstar], [Adv, Vstar]));
naturalRules.push(new GrammarRule([Vstar], [V]));
naturalRules.push(new GrammarRule([NP], [Adj, NP]));
naturalRules.push(new GrammarRule([NP], [N]));
naturalRules.push(new GrammarRule([DP], [D, NP]));
naturalRules.push(new GrammarRule([DP], [Num, NP]));
naturalRules.push(new GrammarRule([DP], [D]));
naturalRules.push(new GrammarRule([DP], [NP]));

class Parser {
  constructor(tokStr, ruleList, rootToken) {
    this.stacks        = [];
    this.rules         = ruleList;
    this.rootToken     = rootToken;
    this.tokenStream   = tokStr;
    this.tree          = new TreeNode;
    this.activeNode    = null;
    this.currentLength = 0;
  }

  changeString(str) {
    this.tokenStream.changeString(str);
    this.stacks        = [];
    this.tree          = new TreeNode;
    this.activeNode    = null;
    this.currentLength = 0;
  }

  parse(token) {
    if (token === undefined) {
      token = this.rootToken;
      this.tokenStream.loadPos(0);
    }
    let ruleset   = getTokenRules(token, this.rules);
    let node      = new TreeNode();
    let oldPos    = this.tokenStream.savePos();
    let success;
    let oldLength = this.length;
    for (let rule of ruleset) {
      let newLength = oldLength + rule.rhs.length - 1;
      if (newLength > this.tokenStream.getUpperLimit()) {
        continue;
      }
      let tokenList = rule.rhs;
      success       = true;
      for (let subtoken of tokenList) {
        let tokenPos = this.tokenStream.savePos();
        let ret;
        if (subtoken.isFinal) {
          let finalValue = subtoken.checkTokenString(this.tokenStream);
          if (finalValue == null) {
            success = false;
            break;
          } else {
            ret                    = new TreeNode();
            ret.attrib["startPos"] = tokenPos;
            ret.attrib["endPos"]   = this.tokenStream.savePos();
            ret.attrib["type"]     = subtoken.id;
            ret.attrib["index"]    = finalValue;
          }
        } else {
          ret = this.parse(subtoken);
          if (ret == null) {
            success = false;
            break;
          }
        }
        node.append(ret);
      }
      if (!success) {
        this.tokenStream.loadPos(oldPos);
        // continue;
      } else {
        this.currentLength = newLength;
        break;
      }
    }
    if (!success) {
      return null;
    } else {
      node.attrib["startPos"] = oldPos;
      node.attrib["endPos"]   = this.tokenStream.savePos();
      node.attrib["type"]     = token.id;
      if (node.count() === 1) {
        node = node.at(0);
      }
      return node;
    }
  }
}

function compareRulesByRhs(first, second) {
  if (first.rhs.length > second.rhs.length) {
    return -1;
  } else if (first.rhs.length < second.rhs.length) {
    return 1
  } else {
    return 0;
  }
}

/**
 *
 * @param {Token} token
 * @param {GrammarRule[]} rules
 * @returns {Array}
 */
function getTokenRules(token, rules) {
  let ret = [];

  for (let rule of rules) {
    if (rule.lhs.length === 1 && rule.lhs[0] === token) {
      ret.push(...rule.getSubRules());
    }
  }
  ret.sort(compareRulesByRhs);
  return ret;
}

var naturalParser = new Parser(standardStreamFactory("the dog bite the man"), naturalRules, S);

function stringifyGrammarTree(tree, tokStr) {
  var openingTags =
        '<span class="grammar outer" data-type="' +
        tree.attrib["type"] +
        '"><span class="grammar inner">';
  var closingTags = '</span></span>';
  var start       = tree.attrib["startPos"];
  var end         = tree.attrib["endPos"];
  var content;
  if (tree.attrib["index"] !== undefined) {
    var strStart = tokStr.getTokenStringPos(start);
    var strEnd   = tokStr.getTokenStringPos(end);
    content      = tokStr.str.substr(strStart, strEnd - strStart);
  } else {
    content = "";
    for (var node of tree.subnodes) {
      content += stringifyGrammarTree(node, tokStr);
    }
  }
  return openingTags + content + closingTags;
}

function displayString(str) {
  naturalParser.changeString(str);
  var out = naturalParser.parse();
  if (out != null) {
    document.getElementById("parseString").innerHTML = stringifyGrammarTree(out, naturalParser.tokenStream);
  } else {
    document.getElementById("parseString").innerHTML = '<span class="parseError">could not parse string</span>';
  }
}

$(document).ready(function () {
  displayString("the big man roughly bites the little dog");
  $("#parseButton").on("click", function (evt) {
    displayString($("#parseBox").val());
  });
});

function cloneAttr(attr) {
  var ret = {};
  for (var key in attr) {
    if (attr.hasOwnProperty(key)) {
      ret[key] = attr[key];
    }
  }
  return ret;
}