'use strict';

import ohm from 'ohm-js/dist/ohm';
import _ from "lodash";
import { Attribute, Record } from './core/types';

// An object to store results of calling functions
const functionCache = {}

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
    = "\\\"" StringChar+ "\\\""

  NumberLiteral
    = digit+

  ColRefChar
  	= alnum+ | "_"

  ColRef
    = ColRefChar+

  StringChar
    = alnum | "." | ":" | ">" | "-" | "(" | ")"

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
      let result = response.seconds || -1 // -1 is our error value... rethink?
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
  },
  "GetAttribute": function(el, attrName) {
    // todo: error handling here?
    return promisify(el.getAttribute(attrName))
  },
  "GetParent": function(el) {
    return promisify(el.parentElement);
  },
  "QuerySelector": function(el, selector, index) {
    if (!el && selector && typeof(index) === 'number') {
      return promisify(document.querySelectorAll(selector)[index]);
    }
    return promisify(el && selector && ! (typeof(selector) === 'number') ? el.querySelector(selector) : " ")
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
      // Compute a cache key representing executing this function on these inputs
      // of the form "FunctionName:RowId:Arg1:Arg2".
      // Then look it up in our in-memory cache. (the cache isn't persisted,
      // it's just there to make re-evals smoother within pageloads)

      // Note 1:
      // Technically this could go wrong in weird cases where the input
      // contains this separator character, and we should do something better like
      // hash a key-value object or something... but this seems good enough for now.

      // Note 2:
      // If any of the arguments is a DOM element, we don't cache.
      // We don't have an easy way to test equality.
      values = [...values, parseInt(row.id)]
      if(values.find(v => v instanceof HTMLElement)) {
        return fn.apply(this, values)
      }

      const cacheKey = `${this.fnName}:${row.id}:${values.join("_:_")}`;

      if(functionCache[cacheKey]) {
        return functionCache[cacheKey]
      } else {
        const result =  fn.apply(this, values)
        functionCache[cacheKey] = result
        return result
      }
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
    } else {
      console.error(`Couldn't parse formula: ${this.match.message}`)
      return `Error: ${this.match.message}`;
    }
  }
}

// Given a map from attribute names to Formulas,
// return a list of topologically sorted attribute names
// (if B depends on A, then A comes before B in the ordering)
// This is a simple implementation and could be much more optimized, but
// should be negligible perf impact for small # of columns
function sortAttributesByDependencies(parsedFormulas: { [key: string]: Formula }) {
  const formulaAttrs = Object.keys(parsedFormulas)

  // Create a map from each attr to the other formula cols it depends on
  const dependencies = _.mapValues(parsedFormulas, formula => _.intersection(formula.colrefs(), formulaAttrs))

  const result = []
  while(result.length < Object.entries(dependencies).length) {
    for(const [attr, deps] of Object.entries(dependencies)) {
      const outstandingDeps = _.difference(deps, result)
      if (outstandingDeps.length === 0) {
        result.push(attr)
      }
    }
  }

  return result
}

export function formulaParse(s) {
  if (s === null || s[0] !== '=') {
    return null;
  } else {
    return new Formula(s, formulaGrammar.match(s));
  }
}

// This function is responsible for actually evaluating formulas and
// turning them into data results.
// Accepts a callback, which it calls with results as it goes through the table.
export async function evalFormulas(records: Record[], attributes: Attribute[], callback: any){
  const formulaAttributes = attributes.filter(attr => attr.formula)

  // parse formula text into AST, once per attribute
  const parsedFormulas: {[key: string]: Formula} = {}
  formulaAttributes.forEach(attr => {
    parsedFormulas[attr.name] = formulaParse(attr.formula)
  })

  const sortedFormulaAttributes: string[] = sortAttributesByDependencies(parsedFormulas)

  //console.log({sortedFormulaAttributes, parsedFormulas})

  // Start by initializing an empty results object of the right shape,
  // so that we can start incrementally sending back results to the table
  const evalResults = {}
  for (const record of records) {
    evalResults[record.id] = {}
    for (const attr of sortedFormulaAttributes) {
      evalResults[record.id][attr] = null
    }
  }

  callback(evalResults)

  // Loop through records and attributes, iteratively evaluating formulas
  for (const attr of sortedFormulaAttributes) {
    // Eval all cells in this column, in parallel
    // (this is safe to do because rows don't depend on each other)
    const results = await Promise.all(records.map(record => parsedFormulas[attr].eval({...record.values, id: record.id})))
    for (const [index, result] of results.entries()) {
      const record = records[index]

      // Set the result in the output
      evalResults[record.id][attr] = result

      // Also mutate the result in our local state, so that later formulas
      // can use the evaluation result of this column
      record.values[attr] = result
    }
    callback(evalResults)
  }
}