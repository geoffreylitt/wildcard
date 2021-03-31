import React from "react";
import Autosuggest from 'react-autosuggest';
import {functions} from '../formula'

const autosuggestTheme = {
    container: {
      display: 'inline-block',
      position: 'absolute',
      minWidth: '50%',
      marginLeft: '10px',
      zIndex: '2500',
      color: 'black',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '14px',
    },
    input: {
      padding: '5px',
      border: 'solid thin #ddd',
      height: '1.5em',
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '14px',
      '&:focus': {
        border: 'none'
      }
    },
    suggestionsContainer: {
      display: 'none',
    },
    suggestionsContainerOpen: {
      position: 'absolute',
      width: '100%',
      maxHeight: '240px',
      background: 'white',
      boxShadow: '0px 0px 3px gray',
      display: 'flex',
      flexFlow: 'column',
    },
    suggestionsList: {
      padding: '0px',
      margin: '0px',
      overflow: 'auto',
      flex: '1 1 auto'
    },
    suggestion: {
      listStyleType: 'none',
      margin: '0',
      padding: '0px 5px',
      cursor: 'pointer'
    },
    suggestionHighlighted: {
      background: 'rgb(240,240,240)',
    },
  };

const AutosuggestInput = ({activeCellValue, setActiveCellValue, suggestions, setSuggestions, cellEditorRef, attributes, onCellEditorKeyPress, commitActiveCellValue}) => {

    // This pattern matches every thing after and including any one of these symbols: = ( + - * /
const regex = /[=(\+\-\*\/][^=(\+\-\*\/]*$/; 
    
    // Teach Autosuggest how to calculate suggestions for any given input value.
    const mathSymbols = {"Plus": "+", "Minus": "-", "Multiply": "*", "Divide": "/"};
    const attributeNames = attributes.map(attribute => attribute.name);
    const mathSuggestions = Object.keys(functions)
        .filter(functionName => Object.keys(mathSymbols).indexOf(functionName) !== -1)
        .reduce((obj, functionName) => {
        const symbol = mathSymbols[functionName];
        obj[symbol] = functions[functionName];
        return obj; 
        }, {});
    const allSuggestionNames = Object.keys(functions)
        .sort()
        .filter(functionName => Object.keys(mathSymbols).indexOf(functionName) === -1)
        .concat(attributeNames);
    const getSuggestions = value => {
        const inputValue = value.trim()
        const matchIndex = inputValue.search(regex);
        
        if (matchIndex === inputValue.length - 1) {
        // If at the start of a new expression, include all possible suggestions
        return allSuggestionNames.map(suggestion => inputValue + suggestion);
        }
        else if (matchIndex === -1) {
        return [];
        }
        else {
        // Use everything after the regex match index (matchValue) as the prefix to determine suggestions
        const matchValue = inputValue.slice(matchIndex+1, inputValue.length).toLowerCase();
        let suggestions = allSuggestionNames
            .filter(suggestion => suggestion.toLowerCase().slice(0, matchValue.length) === matchValue)
            .map(suggestion => inputValue.slice(0, matchIndex+1) + suggestion);
        
        // Math operations are suggested after a numeric attribute name or after ")"
        const attributeIndex = attributeNames.indexOf(matchValue);
        const isNumericAttribute = attributeIndex != -1 && attributes[attributeIndex].type === "numeric";
        const lastChar = matchValue[matchValue.length - 1];
        if (isNumericAttribute || lastChar === ")"){
            suggestions = suggestions.concat(Object.keys(mathSuggestions).map(suggestion => inputValue + suggestion))
        }
        return suggestions;
        }
    };
    
    // Determine how individual suggestions are rendered into HTML.
    const renderSuggestion = function(suggestion) {
        const matchIndex = suggestion.search(regex);
        const matchValue = suggestion.slice(matchIndex+1, suggestion.length);
        const lastChar = suggestion[suggestion.length-1];
        if (attributeNames.indexOf(matchValue) != -1) {
        return (<div><b>{matchValue}</b></div>)
        }
        else if (lastChar in mathSuggestions) {
        return (<div>{lastChar}</div>)
        }
        else {
        return (<div>{matchValue}</div>)
        }
        
    }
    // Render helper text for functions in the footer
    const renderSuggestionsContainer = function({ containerProps, children }) {
        const inputValue = activeCellValue.toString().trim()
        const matchIndex = inputValue.search(regex);
        const matchValue = inputValue.slice(matchIndex+1, inputValue.length);
        const attributeIndex = attributeNames.indexOf(matchValue);
        const lastChar = inputValue[inputValue.length-1];
        
        let footer = undefined;
        if (matchValue in functions) { // function
        const params = functions[matchValue]["help"];
        footer = (
            <div>
            {matchValue + "("} <b>{Object.keys(params).join(", ")}</b> {")"}
            <div>{Object.keys(params).map(key => <div><b>{key}</b>: {params[key]}</div>)}</div>
            </div>
        )
        }
        else if (lastChar in mathSuggestions) { // math symbol
        const helpText = mathSuggestions[lastChar]["help"];
        footer = (
            <div>
            numeric1 <b>{lastChar}</b> numeric2
            <div>{helpText}</div>
            </div>
        )
        }
        else if (attributeIndex != -1) { // attribute name
        const attribute = attributes[attributeIndex];
        footer = (
            <div>
            <b>{attribute.name}</b> is a column with type <b>{attribute.type}</b>.
            </div>
        )
        }
    
        return (
        <div {...containerProps}>
            {children}
            <div style={footer ? {backgroundColor: 'rgb(240, 240, 240)', borderTop: '1px solid rgb(204, 204, 204)', padding: '5px', flex: '0 1 auto'} : {}}>
            {footer}
            </div>
        </div>
        )
    }
    
    const onChange = function(event, { newValue }) {
        setActiveCellValue(newValue);
    }
    
    // Autosuggest will call this function every time we need to update suggestions.
    const onSuggestionsFetchRequested = function({ value }) {
        setSuggestions(getSuggestions(value));
    };
    
    // Autosuggest will call this function every time we need to clear suggestions.
    const onSuggestionsClearRequested = function() {
        setSuggestions([]);
    };

    return <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={(v) => v}
        renderSuggestion={renderSuggestion}
        renderSuggestionsContainer={renderSuggestionsContainer}
        inputProps={{
        ref: cellEditorRef,
        value: activeCellValue.toString(),
        onChange: onChange,
        onKeyPress: onCellEditorKeyPress,
        placeholder: "Enter cell value, or enter \"=\" to begin a formula...",
        onBlur: commitActiveCellValue}}
        theme={autosuggestTheme}
    />
}

export default AutosuggestInput;