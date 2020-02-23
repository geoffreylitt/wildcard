'use strict';

import ohm from 'ohm-js/dist/ohm';

const GRAMMAR_SRC = `
Formula {
  Formula
    = "=" Exp

  Exp
    = FunctionExp
    | attribute

  attribute
    = letter+

  FunctionExp
    = letter+ "(" Exp ")"
}
`;

let getHistory = (url) => {
  return new Promise((resolve, _reject) => {
    chrome.runtime.sendMessage({command: "getVisits", url: url}, function(response) {
      let result = !!response.visits && response.visits.length > 0
      resolve(result)
    });
  })
}

async function visited(url) {
  return await getHistory(url)
}

const functions = {
  visited: async function(arg) {
    let result = await visited(arg)
    return result
  }
}

const formulaGrammar = ohm.grammar(GRAMMAR_SRC);

const formulaSemantics = formulaGrammar.createSemantics().addOperation('toAst', {
  Formula: function(eq, e) {
    return e.toAst();
  },
  Exp: function(e) {
    return e.toAst();
  },
  FunctionExp: function(fnName, _p1, arg, _p2) {
    return new FnNode(fnName.sourceString, arg.toAst())
  },
  attribute: function(chars) {
    return new AttrNode(chars.sourceString);
  }
});

class FnNode {
  fnName: string;
  arg: any;

  constructor(fnName, arg) {
    this.fnName = fnName
    this.arg = arg
  }

  eval(row) {
    let fn = functions[this.fnName]
    if (fn) { return fn.call(this, this.arg.eval(row)) }
    else { return null } //??
  }
}

class AttrNode {
  name: string;

  constructor(name) {
    this.name = name
  }

  eval(row) {
    return row[this.name]
  }
}

class Formula {
  src:string;
  match:any;

  constructor(src, match) {
    this.src = src;
    this.match = match;
  }

  eval(row) {
    // A deleted formula evaluates to empty
    if (this.src === "") {
      return null
    }

    if (this.match.succeeded()) {
      return formulaSemantics(this.match).toAst().eval(row);
    } else {
      return "#ERROR!";
    }
  }
}

export function parse(s) {
  if (s === null || s[0] !== '=') {
    return null;
  } else {
    return new Formula(s, formulaGrammar.match(s));
  }
}

export function test() {
  let formula = parse("=pad(value)")
  let result = formula.eval({ value: "world" })
  return result
}
