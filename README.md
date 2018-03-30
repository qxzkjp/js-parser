# js-parser

A generic tokeniser and parser-generator for JavaScript

The tokeniser is finished, and the parser makes a basic tree.

## How to use

### Parser

```
new Parser(tokenStream,ruleSet,initialToken)
```

creates a parser object, which generates a syntax tree from a token stream. get 
the tree by running
```
parser.parse()
```.

#### parameters
```tokenStream```: an instance of the ```TokenStream``` class (see below).  
```ruleSet```: an array of ```GrammarRule``` objects  
```initialToken```: a ```GrammarToken``` object which is the left-hand side of 
at least one of the rules in ```ruleSet```

### other methods

```changeString(str)```: reset the parser and change the string underlying the 
token string. Takes a plain text string which is passed to the underlying token 
string.

```naturalParser``` is provided as an example of a parser.

## GrammarRule

A representation of a grammar rule, in the form ```LHS=>RHS```. A new grammar 
rule is constructed by calling ```new GrammarRule(lhs,rhs)```, where lhs and 
rhs are both arrays of ```GrammarToken``` objects.

```naturalRules``` is provided as an example of how to set up a list of 
```GrammarRule```s.

## GrammarToken

A ```GrammarToken``` object represents an abstract grammatical token, such as a 
verb, noun, or verb phrase. ```GrammarToken```s are either non-final, meaning 
they can appear on the left-hand side of a ```GrammarRule```, or final. Final 
tokens have a set of representations associated to them in the form of a 
```TreeMap```.

A token is constructed by calling ```new GrammarToken(id, displayName, treeMap)```.

### parameters

```id```: a short name for the token, like VP for a verb phrase, or Adj for an 
adjective.  
```displayName```: a longer, descriptive name for the token.  
```treeMap```: a ```TreeMap``` object representing all of the possible 
realisations of the token.

## TreeMap

A ```TreeMap``` object stores a list of (possibly multi-word) names, and checks 
a token string for the longest name at its current position.

Create with ```new TreeMap(names)```, where names is just and array of plain 
text names.

```determinerMap```, ```verbMap```, ```nounMap```, ```adjectiveMap``` and 
```adverbMap``` are provided as examples of tree maps.

### Other methods

```contains(tokStr)``` checks the token string for a name contained in the tree map.

## TokenStream

A ```TokenStream``` object takes a plain text string, and splits it into tokens 
in a user-defined way.

Create with ```new TokenStream(string, regExList, tokenFilter)```.

### parameters

```string```: the underlying plain text string.  
```regExList```: an array of regexes representing the different token 
categories. These are checked in sequence, starting from 0, and the first one 
to match grabs the characters and turns them into a token with numeric type 
equal to the regex's index in the array.  
```tokenFilter```: an optional TokenFilter object to apply pre-processing to 
the tokens.

```standardTokenStreamFactory(str)``` is provided as a quick way to create a 
```TokenStream``` from a plain string. It uses the default regexes and token 
filter. This token stream will ignore white space, and create tokens for 
ordinals, words, numbers and punctuation. The variables ```TOK_WSP```, 
```TOK_ORD```, ```TOK_WRD```, ```TOK_NUM``` and ```TOK_PCT``` are provided as 
global variables to aid human readability.

### Other methods

```changeString(str)```: resets the stream and changes the underlying string to 
```str```.
```peekToken()```: returns the token at the stream's current position.  
```getToken()```: returns the token at the stream's current position and 
increments the position.  
```rewind(n)```: un-pops ```n``` tokens, the default being one. ```rewind(0)``` 
puts the stream back to the beginning.  
```savePos()```: returns the stream's current position.  
```loadPos(n)```: sets the stream's current position to ```n```.

## TokenFilter

A token filter filters and mutates tokens parsed to put them into an easier to 
process form. Create one with 

    new TokenFilter(excludedIndicies, listOfMaps,
                    listOfFunctions, caseInsensitive)

### Parameters

```excludedIndicies```: an array of integers representing categories of token 
that are to be ignored by the tokeniser.  
```listOfMaps```: an array of maps which have as keys possible token values, 
and as values an array ```[index, value]``` indicating what is to be returned 
in the token instead of the actual string read.  
```listOfFunctions```: an array of functions, each index representing a token 
category. For each category of token for which there is an associated function, 
this function is run with the index and value as inputs. The token actually 
returned is the output of this function.  
```caseInsensitive```: a boolean representing whether case should be ignored. 
Defaults to ```false```.
