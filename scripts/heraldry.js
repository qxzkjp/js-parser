(function () {
  let BLA    = new GrammarToken("BLA", "blazon");
  let NBLA   = new GrammarToken("NBLA", "blazon withoout overall (etc)");
  let SUB    = new GrammarToken("SUB", "sub-blazon");
  let BSUB   = new GrammarToken("BSUB", "bare sub-blazon");
  let SUBL   = new GrammarToken("SUBL", "sub-blazon list");
  let BSUBL  = new GrammarToken("BSUBL", "bare sub-blazon list");
  let ORDS   = new GrammarToken("ORDS", "an ordinal group");
  let ORD    = new GrammarToken("ORD", "an ordinal");
  let DIV    = new GrammarToken("DIV", "a division");
  let DIVN   = new GrammarToken("DIVN", "a division name");
  let BDIV   = new GrammarToken("BDIV", "a bare division");
  let FLD    = new GrammarToken("FLD", "a field");
  let TINC   = new GrammarToken("TINC", "a tincture");
  let BTINC  = new GrammarToken("BTINC", "a beastly tincture name (armed, etc)");
  let BTINCL = new GrammarToken("BTINCL", "a list of beastly tincture names");
  let SMY    = new GrammarToken("SMY", "a semy charge");
  let CHG    = new GrammarToken("CHG", "a charge");
  let CHGN   = new GrammarToken("CHGN", "a charge name");
  let CHGM   = new GrammarToken("CHGM", "a charge modifier");
  let CHGML  = new GrammarToken("CHGML", "a charge modifier list");
  let CLST   = new GrammarToken("CLST", "a charge list");
  let TCLST  = new GrammarToken("TCLST", "a charge list without conjunctions");
  let CSP    = new GrammarToken("CSP", "a charge specifier");
  let CSPL   = new GrammarToken("CSPL", "a charge specifier list");
  let HOR    = new GrammarToken("HOR", "an honorable ordinary");
  let MOV    = new GrammarToken("MOV", "a movable charge");
  let BST    = new GrammarToken("BST", "a beast");

  let commaMap     = new TreeMap(",");
  let semicolonMap = new TreeMap(";");
  let overallMap   = new TreeMap("over all");
  let onTheMap     = new TreeMap("on the");
  let ofTheMap     = new TreeMap("of the");

  let COMMA     = new GrammarToken("COMMA", "a comma", commaMap);
  let SEMICOLON = new GrammarToken("SEMICOLON", "a semicolon", semicolonMap);
  let OVERALL   = new GrammarToken("OVERALL", "the words 'over all'", overallMap);
  let ON_THE    = new GrammarToken("ON_THE", "the words 'on the'", onTheMap);
  let OF_THE    = new GrammarToken("OF_THE", "the words 'of the'", ofTheMap);

  let TINCN = new GrammarToken("TINCN", "a tincture name", null);

  let heraldryRules = [];
  heraldryRules.push(new GrammarRule([BLA], [FLD, new Optional(COMMA), TCLIST]));
  heraldryRules.push(new GrammarRule([BLA], [FLD]));
  heraldryRules.push(new GrammarRule([BLA], [DIV, OVERALL, TCLIST]));
  heraldryRules.push(new GrammarRule([BLA], [DIV, SEMICOLON, TCLIST]));
  heraldryRules.push(new GrammarRule([BLA], [BDIV, new Optional(CSPL)]));
  heraldryRules.push(new GrammarRule([BLA], [BDIV, new Optional(TCLST)]));

  heraldryRules.push(new GrammarRule([NBLA], [FLD, new Optional(COMMA), CHG, new Optional(TCLST)]));
  heraldryRules.push(new GrammarRule([NBLA], [DIV]));

  heraldryRules.push(new GrammarRule([CSP], [ON_THE, ORDS, CLST]));
  heraldryRules.push(new GrammarRule([CSPL], [CSP, new Optional(CSPL)]));

  heraldryRules.push(new GrammarRule([FLD], [TINC]));
  heraldryRules.push(new GrammarRule([FLD], [TINC, SMY]));

  heraldryRules.push(new GrammarRule([TINC], [TINCN]));
  heraldryRules.push(new GrammarRule([TINC], [OF_THE, ORD]));

})();
