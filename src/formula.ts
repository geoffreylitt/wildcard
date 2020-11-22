'use strict';

import ohm from 'ohm-js/dist/ohm';
import _ from "lodash";
import { Attribute, Record } from './core/types';

const GRAMMAR_SRC = `
Formula {
  Formula
    = "=" Exp

  Exp = AddExp

  SimpleExp =
    FunctionExp
    | StringLiteral
    | NumberLiteral
    | ColRef

  StringLiteral
    = "\\\"" alnum+ "\\\""

  NumberLiteral
    = digit+

  ColRefChar
  	= alnum+ | "_"

  ColRef
    = ColRefChar+

  FunctionExp
    = letter+ "(" ListOf<Exp, ","> ")"

  AddExp
    = AddExp "+" MulExp --plus
    | AddExp "-" MulExp --minus
    | MulExp

  MulExp
    = MulExp "*" SimpleExp --times
    | MulExp "/" SimpleExp --divide
    | SimpleExp
}
`;

let promisify = (value) => {
  return new Promise((resolve, _) => {
    resolve(value)
  })
}

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

let getReadingTime = (url) => {
  return new Promise((resolve, _reject) => {
    chrome.runtime.sendMessage({command: "getReadingTime", url: url}, function(response) {
      let result = response.seconds || null
      resolve(result)
    });
  })
}

async function readingTime(url) {
  return await getReadingTime(url)
}

const functions = {
  "Visited": async function(arg) {
    let result = await visited(arg)
    return result
  },
  "ReadTimeInSeconds": async function(arg) {
    let result = await readingTime(arg)
    return result
  },
  "Concat": function(...args) {
    return promisify(args.join(" "))
  },
  "Divide": function(x, y) {
    return promisify(x / y)
  },
  "Multiply": function(x, y) {
    return promisify(x * y)
  },
  "Plus": function(x, y) {
    return promisify(x + y)
  },
  "Minus": function(x, y) {
    return promisify(x - y)
  },
  "Round": function(x) {
    return promisify(Math.round(x))
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
  SimpleExp: function(e) {
    return e.toAst();
  },
  FunctionExp: function(fnName, _p1, args, _p2) {
    return new FnNode(fnName.sourceString, args.asIteration().toAst())
  },
  ColRef: function(chars) {
    return new ColRefNode(chars.sourceString);
  },
  StringLiteral: function(_q1, string , _q2) {
    return new StringNode(string.sourceString)
  },
  NumberLiteral: function(num) {
    return new NumberNode(num.sourceString)
  },
  MulExp_times: function(a, _, b) {
    return new FnNode("Multiply", [a, b].map(x => x.toAst()))
  },
  MulExp_divide: function(a, _, b) {
    return new FnNode("Divide", [a, b].map(x => x.toAst()))
  },
  AddExp_plus: function(a, _, b) {
    return new FnNode("Plus", [a, b].map(x => x.toAst()))
  },
  AddExp_minus: function(a, _, b) {
    return new FnNode("Minus", [a, b].map(x => x.toAst()))
  }
});

class FnNode {
  fnName: string;
  args: Array<any>;

  constructor(fnName, args) {
    this.fnName = fnName
    this.args = args
  }

  eval(row) {
    let fn = functions[this.fnName]
    if (!fn) { return null }
    return Promise.all(this.args.map(arg => arg.eval(row))).then(values => {
      return fn.apply(this, values)
    })
  }

  colrefs() {
    return _.chain(this.args.map(arg => arg.colrefs())).flatten().uniq().value()
  }
}

class ColRefNode {
  name: string;

  constructor(name) {
    this.name = name
  }

  eval(row) {
    return promisify(row[this.name])
  }

  colrefs() {
    return [this.name]
  }
}

class StringNode {
  string: string;

  constructor(str) {
    this.string = str
  }

  eval(row) {
    return promisify(this.string)
  }

  colrefs() {
    return []
  }
}

class NumberNode {
  number: number;

  constructor(num) {
    this.number = Number(num)
  }

  eval(row) {
    return promisify(this.number)
  }

  colrefs() {
    return []
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
      console.error(`Couldn't parse formula: ${this.match.message}`)
      return `Error: ${this.match.message}`;
    }
  }

  colrefs() {
    if (this.src === "") {
      return null
    }

    if (this.match.succeeded()) {
      let colrefs = formulaSemantics(this.match).toAst().colrefs();
      return colrefs;
    }
  }
}

export function formulaParse(s) {
  if (s === null || s[0] !== '=') {
    return null;
  } else {
    return new Formula(s, formulaGrammar.match(s));
  }
}

export async function evalFormulas(record: Record, attributes: Attribute[]): Promise<any> {
  // todo: actually correctly evaluate in topo sort order here. 
  // as-is, this will break if deps aren't properly ordered.
  const sortedFormulaAttributes = attributes.filter(attr => attr.formula)
  
  const evalResults = await Promise.all(
    sortedFormulaAttributes.map(attr =>
       formulaParse(attr.formula).eval(record.values)))
  
  const values = {}
  evalResults.forEach((value, index) => {
    values[sortedFormulaAttributes[index].name] = value
  })

  return values
}