'use strict';

import ohm from 'ohm-js/dist/ohm';
import _ from "lodash";
import { Attribute, Record } from './core/types';
import stringHash from 'string-hash'

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
    = alnum | "." | ":" | ">" | "-" | "(" | ")" | "[" | "]" | "=" | "'" | "/" | "*" | "!" | "$" | "_"

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
  "Visited": {
    "function": async function(arg) {
      let result = await visited(arg)
      return result
    },
    "help": {
      "link": "The link column to determine whether its URLs have been visited in browser history."
    }
  },
  "ReadTimeInSeconds": {
    "function": async function(arg) {
      let result = await readingTime(arg)
      return result
    },
    "help": {
      "link": "The link column to calculate read times for."
    }
  },
  "Concat": {
    "function": function(...args) {
      return promisify(args.map(v => v instanceof HTMLElement ? v.textContent : v).join(" "))
    },
    "help": {
      "value1": "The value to which following columns will be appended.",
      "value2...": "The value to append to column1."
    }
  },
  "Includes": {
    "function": function(arg, searchValue) {
      arg = arg instanceof HTMLElement ? arg.textContent : arg;
      return arg ? promisify(arg.includes(searchValue)) : undefined
    },
    "help": {
      "text": "The string value to search.",
      "searchValue": "The value to find in 'text'. Returns a boolean." 
    },
  },
  "ExtractBetween": {
    "function": function(arg, left, right) {
      arg = arg instanceof HTMLElement ? arg.textContent : arg;
      if (arg == undefined) {
        return undefined;
      }
      const leftIdx = arg.indexOf(left) + left.length
      const rightIdx = arg.indexOf(right, leftIdx)
      return arg ? promisify(arg.slice(leftIdx, rightIdx)) : undefined
    },
    "help": {
      "text": "The string value to search (extracts between the first occurence of 'left' and 'right').",
      "left": "The beginning string value",
      "right": "The ending string value.",
    },
  },
  "ExtractStart": {
    "function": function(arg, right) {
      arg = arg instanceof HTMLElement ? arg.textContent : arg;
      if (arg == undefined) {
        return undefined;
      }
      const rightIdx = arg.indexOf(right) + right.length
      return arg ? promisify(arg.slice(0, rightIdx)) : undefined
    },
    "help": {
      "text": "The string value to search (extracts between the start of 'text' and the first occurence of 'right').",
      "right": "The ending string value.",
    },
  },
  "ExtractEnd": {
    "function": function(arg, left) {
      arg = arg instanceof HTMLElement ? arg.textContent : arg;
      if (arg == undefined) {
        return undefined;
      }
      const leftIdx = arg.lastIndexOf(left) + left.length
      return arg ? promisify(arg.slice(leftIdx, arg.length)) : undefined
    },
    "help": {
      "text": "The string value to search (extracts between the last occurence of 'left' and the end of 'text').",
      "left": "The beginning string value.",
    },
  },
  "Substring": {
    "function": function(arg, indexStart, indexEnd = undefined) {
      if (arg == undefined) {
        return undefined;
      }
      return indexEnd ? promisify(arg.substring(indexStart, indexEnd)) : promisify(arg.substring(indexStart))
    },
    "help": {
      "text": "The string value to take the substring of.",
      "indexStart": "The index of the first character to include in the returned substring.",
      "indexEnd": "(optional) The index of the first character to exclude from the returned substring.",
    },
  },
  "And": {
    "function": function(...args) {
      return promisify(args.reduce((accumulator, element) => accumulator && element))
    },
    "help": {
      "values, ...": "The boolean values to perform AND across."
    },
  },
  "Or": {
    "function": function(...args) {
      return promisify(args.reduce((accumulator, element) => accumulator || element))
    },
    "help": {
      "values, ...": "The boolean values to perform OR across."
    },
  },
  "Not": {
    "function": function(arg) {
      return promisify(! arg)
    },
    "help": {
      "values, ...": "The boolean values to perform NOT across."
    },
  },
  "LessThan": {
    "function": function(arg, value) {
      arg = arg instanceof HTMLElement ? arg.textContent : arg;
      return promisify(arg < value)
    },
    "help": {
      "arg": "The numeric value to compare to 'compareValue'",
      "compareValue": "The value to check if it is greater than 'arg'"
    },
  },
  "QuerySelector": {
    "function": function(el, selector, index) {
      if (!el && selector && typeof(index) === 'number') {
        return promisify(document.querySelectorAll(selector)[index]);
      }
      return promisify(el && selector && ! (typeof(selector) === 'number') ? el.querySelector(selector) || " " : " ")
    },
    "help": {
      "arg": "The numeric value to compare to 'compareValue'",
      "compareValue": "The value to check if it is greater than 'arg'"
    },
  },
  "Divide": {
    "function": function(x, y) {
      return promisify(x / y)
    },
    "help": "Divides one numeric value by another."
  },
  "Multiply": {
    "function": function(x, y) {
      return promisify(x * y)
    },
    "help": "Multiplies two numeric values together."
  },
  "GetParent": {
    "function": function(el) {
      return promisify(el.parentElement);
    },
    "help": "Get parent of element"
  },
  "GetAttribute": {
    "function": function(el, attribute) {
      return promisify(el.getAttribute(attribute))
    },
    "help": "Get attribute of element"
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
    let fn = functions[this.fnName]["function"]
    if (!fn) { return null }
    return Promise.all(this.args.map(arg => arg.eval(row))).then(values => {
      // Compute a cache key representing executing this function on these inputs
      // of the form "FunctionName:RowId:Arg1:Arg2".
      // Then look it up in our in-memory cache. (the cache isn't persisted,
      // it's just there to make re-evals smoother within pageloads)

      // Most input arguments are directly stringified into the cache key;
      // but we need to treat DOM elements specially to compare them.
      // We hash the HTML of the element as an equality check
      const inputArguments = values.map(v => {
        if(v instanceof HTMLElement) {
          return stringHash(v.outerHTML)
        } else {
          return v
        }
      })

      const cacheKey = `${this.fnName}:${row.id}:${inputArguments.join("_:_")}`;

      if(functionCache[cacheKey]) {
        //console.log("FROM CACHE:", this.fnName, row.id, values[0].tagName, values[1]);
        return functionCache[cacheKey]
      } else {
        const result =  fn.apply(this, values)
        functionCache[cacheKey] = result
        //console.log("COMPUTED:", this.fnName, row.id, values[0].tagName, values[1]);
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

const parsedFormulaCache = {

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
  //callback(evalResults)
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
    //callback(evalResults)
  }
  callback(evalResults)
}

export {functions};