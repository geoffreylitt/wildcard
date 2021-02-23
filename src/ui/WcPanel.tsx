import React, { useRef, useState } from "react";
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-monokai";
import "./overrides.css";
import styled from 'styled-components'
import { Record, Attribute } from '../core/types'
import Handsontable from "handsontable";
import { FormulaEditor } from '../ui/cell_editors/formulaEditor'

const marketplaceUrl = "https://wildcard-marketplace.herokuapp.com";

function formatRecordsForHot(records:Array<Record>) {
  return records.map(record => ({
    id: record.id,
    ...record.values
  }))
}

function formatAttributesForHot(attributes:Array<Attribute>) {
  return attributes.map(attribute => ({
    data: attribute.name,
    type: attribute.type,
    readOnly: !attribute.editable,
    editor: attribute.editor
  }))
}

const ToggleButton = styled.div`
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  border-radius: 10px;
  z-index: 10000;
  padding: 10px;
  position: fixed;
  bottom: ${props => props.hidden ? 20 : 300}px;
  right: ${props => props.codeEditorHidden ? 2 : 31}vw;
  background-color: white;
  box-shadow: 0px 0px 10px -1px #d5d5d5;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #eee;
  }
`

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  height: ${props => props.hidden ? 0 : 280}px;
  width: ${props => props.codeEditorHidden ? 98 : 68.5}vw;
  z-index: 2200;
  box-shadow: 0px -5px 10px 1px rgba(170,170,170,0.5);
  border-top: solid thin #9d9d9d;
  overflow: hidden;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
`

const ControlBar = styled.div`
  height: 30px;
  padding: 5px 10px;
`

const CodeEditor = styled(AceEditor)`
  display: ${props => props.codeEditorHidden ? 'none' : 'block'};
  position: fixed;
  bottom: 0px;
  right: 0px;
  z-index: 2500;
`
const EditorButton = styled(ToggleButton)`
  display: ${props => props.codeEditorHidden ? 'none' : 'block'};
  bottom: 20px;
  right: ${props => props.right};
`

const ShareButton = styled(ToggleButton)`
  /* right: ${props => props.right}; */
  right: calc(2vw + 165px);
  display: ${props => props.hidden || !props.codeEditorHidden ? 'none' : 'block'};
`

const EditButton = styled(ToggleButton)`
  /* right: ${props => props.right}; */
  right: calc(2vw + 180px);
  display: ${props => props.hidden || !props.codeEditorHidden ? 'none' : 'block'};
`

const CellEditorBox = styled.input`
  display: inline-block;
  margin-left: 10px;
  padding: 5px 10px;
  border: solid thin #ddd;
  min-width: 600px;
  height: 100%;

  &:focus {
    border: none;
  }
`

// Declare our functional React component

const WcPanel = ({ records, attributes, query, actions, adapter, creatingAdapter }) => {
  const hotRef = useRef(null);
  const cellEditorRef = useRef(null);
  const [hidden, setHidden] = useState(false);
  // Declare a new state variable for adapter code
  const [adapterCode, setAdapterCode] = useState("");
  const [codeEditorHidden, setCodeEditorHidden] = useState(true);
  const _adapterKey = "localStorageAdapter:adapters:" + adapter.name;


  // Keep track of the currently selected cell
  const [activeCell, setActiveCell] = useState(null)

  // The value of the selected cell.
  // (Including in-progress updates that we are making in the UI)
  const [activeCellValue, setActiveCellValue] = useState(null)

  const onCellEditorKeyPress = (e) => {
    const key = e.key
    if (key === 'Enter') {
      cellEditorRef.current.blur()
    }
  }

  const commitActiveCellValue = () => {
    if(activeCellValue[0] === "=") {
      actions.setFormula(
        activeCell.attribute.tableId,
        activeCell.attribute.name,
        activeCellValue
      )
    } else {
      actions.editRecords([
        {
          tableId: activeCell.attribute.tableId,
          recordId: activeCell.record.id,
          attribute: activeCell.attribute.name,
          value: activeCellValue
        }
      ])
    }
  }

  const hotSettings = {
    data: formatRecordsForHot(records),
    rowHeaders: true,
    columns: formatAttributesForHot(attributes),
    colHeaders: attributes.map(attr => {
      if(attr.formula) {
        return `<span class="formula-header">${attr.name}</span>`
      } else {
        return `<span class="data-header">${attr.name}</span>`
      }
    }),
    columnSorting: true,

    // Set a low column width,
    // then let HOT stretch out the columns to match the width
    width: "100%",
    colWidths: attributes.map(a => 100),
    stretchH: "all" as const,
    wordWrap: false,
    manualColumnResize: true,

    // todo: parameterize height, make whole panel stretchable
    height: 250,

    cells: (row, col, prop) => {
      const cellProperties:any = {}
      const attr = attributes.find(a => a.name === prop)
      if (attr.formula) {
        cellProperties.formula = attr.formula
        cellProperties.editor = FormulaEditor
        cellProperties.placeholder = "loading..."
      }
      return cellProperties
    },

    hiddenColumns: {
      columns: attributes.map((attr, idx) => attr.hidden ? idx : null).filter(e => Number.isInteger(e))
    },
    contextMenu: {
      items: {
        "insert_user_attribute": {
          name: 'Insert User Column',
          callback: function(key, selection, clickEvent) {
            // TODO: For now, new columns always get added to the user table.
            // Eventually, do we want to allow adding to the main site table?
            // Perhaps that'd be a way of extending scrapers using formulas...
            actions.addAttribute("user");
          }
        },
        "rename_user_attribute": {
          // todo: disable this on site columns
          name: 'Rename column',
          callback: function(key, selection, clickEvent) {
            alert('not implemented yet');
          }
        },
        "clear_user_table": {
          name: 'Clear user columns',
          callback: function(key, selection, clickEvent) {
            // TODO: For now, new columns always get added to the user table.
            // Eventually, do we want to allow adding to the main site table?
            // Perhaps that'd be a way of extending scrapers using formulas...
            actions.clear("user");
          }
        },
        "toggle_column_visibility":{
          name: 'Show/hide column in page',
          disabled: () => {
            // only allow toggling visibility on user table
            const colIndex = getHotInstance().getSelectedLast()[1]
            const attribute = attributes[colIndex]

            return attribute.tableId !== "user"
          },
          callback: function(key, selection, clickEvent) {
            const attribute = attributes[selection[0].start.col];

            // NOTE! idx assumes that id is hidden.
            actions.toggleVisibility(attribute.tableId, attribute.name);
          }
        },
        "set_column_formula":{
          name: 'Edit formula',
          disabled: () => {
            // only allow editing formulas on user table
            const colIndex = getHotInstance().getSelectedLast()[1]
            const attribute = attributes[colIndex]

            return attribute.tableId !== "user"
          },
          callback: function(key, selection, clickEvent) {
            const attribute = attributes[selection[0].start.col];

            // NOTE! idx assumes that id is hidden.
            const formula = prompt("Edit formula:")
            actions.setFormula(attribute.tableId, attribute.name, formula);
          }
        }
      }
    }
  }

  // Get a pointer to the current handsontable instance
  const getHotInstance = () => {
    if (hotRef && hotRef.current) { return hotRef.current.hotInstance; }
    else { return null; }
  }

  // make sure the HOT reflects the current sort config
  // of the query in our redux state.
  // (usually the sort config will be set from within HOT,
  // but this is needed e.g. to tell HOT when we load sort state from
  // local storage on initial pageload)
  const updateHotSortConfig = () => {
    if (getHotInstance()) {
      const columnSortPlugin = getHotInstance().getPlugin('columnSorting');

      let newHotSortConfig;

      if (query.sortConfig) {
        newHotSortConfig = {
          column: attributes.map(a => a.name).indexOf(query.sortConfig.attribute),
          sortOrder: query.sortConfig.direction
        };
      } else {
        newHotSortConfig = undefined;
      }
      columnSortPlugin.setSortConfig(newHotSortConfig);
    }
  }

  // todo: don't define these handlers inside the render funciton?
  // define outside and parameterize on props?

  // Handle user sorting the table
  const onBeforeColumnSort = (_, destinationSortConfigs) => {
    const columnSortPlugin = getHotInstance().getPlugin('columnSorting');
    // We suppress HOT's built-in sorting by returning false,
    // and manually tell HOT that we've taken care of
    // sorting the table ourselves.
    // https://handsontable.com/docs/7.4.2/demo-sorting.html#custom-sort-implementation
    columnSortPlugin.setSortConfig(destinationSortConfigs);

    // for the moment we only support single column sort
    const sortConfig = destinationSortConfigs[0];

    if (sortConfig) {
      actions.sortRecords({
        // Sort config gives us a numerical index; convert to attribute
        attribute: attributes[sortConfig.column].name,
        direction: sortConfig.sortOrder
      });
    } else {
      actions.sortRecords(null);
    }

    // don't let HOT sort the table
    return false;
  }

  // Handle user making a change to the table.
  // Similar to sorting, we suppress HOT built-in behavior, and
  // we handle the edit ourselves by triggering an action and
  // eventually rendering a totally fresh table from scratch
  const onBeforeChange = (changes, source) => {
    const edits = changes.map(([rowIndex, propName, prevValue, nextValue]) => {
      const attribute = attributes.find(a => a.name === propName)

      return {
        tableId: attribute.tableId,
        recordId: records[rowIndex].id,
        attribute: attribute.name,
        value: nextValue
      }
    })

    const dataEdits = edits.filter(e => e.value[0] !== "=")
    const formulaEdits = edits.filter(e => e.value[0] === "=")

    console.log({dataEdits, formulaEdits})

    actions.editRecords(dataEdits);

    for (const formulaEdit of formulaEdits) {
      actions.setFormula(
        formulaEdit.tableId,
        formulaEdit.attribute,
        formulaEdit.value
      )
    }

    // don't let HOT edit the value
    return false;
  }

  const onAfterSelection = (rowIndex, prop) => {
    const record = records[rowIndex]
    const attribute = attributes.find(attr => attr.name === prop)

    actions.selectRecord(record.id, prop)

    setActiveCell({ record, attribute })
    const activeCellValue = (attribute.formula || record.values[attribute.name] || "")
    setActiveCellValue(activeCellValue)
  }


  const loadAdapterCode = function () {
    let loaded = false;
    // setup listener
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.command) {
        case 'openCodeEditor':
          // show code editor
          setCodeEditorHidden(false);
          sendResponse({ codeEditorHidden: false });

          // load adapter code
          if (!loaded) {
            loaded = true;
            chrome.storage.local.get(_adapterKey, (results) => {
              setAdapterCode(results[_adapterKey]);
              console.log("loaded code from storage");
            });
          }
          break;
        default:
          break;
      }
    });
  }

  const onBlurCodeEditor = function(e, code){
    const data = code.getValue();
    console.log('Editor Data: ',data);
    setAdapterCode(data);
  }

  const saveAdapterCode = function() {
    chrome.storage.local.set({ [_adapterKey]: adapterCode }, function() {
console.log("saved changes");
    });
  }

  if (records && records.length > 0) {
    return <>
      {!creatingAdapter && (
        <>
          <EditButton hidden={hidden} codeEditorHidden={codeEditorHidden}
            onClick={() => {
              chrome.runtime.sendMessage({ command: 'editAdapter' });
          }}> Edit Adapter
          </EditButton>
          <ToggleButton hidden={hidden} onClick={ () => setHidden(!hidden)}
          codeEditorHidden={codeEditorHidden}>
            { hidden ? "↑ Open Wildcard Table" : "↓ Close Wildcard Table" }
          </ToggleButton>
        </>
      )}
      <Panel hidden={hidden} codeEditorHidden={codeEditorHidden}>
        <ControlBar>
          <strong>Wildcard v0.2</strong>
          <CellEditorBox
            ref={cellEditorRef}
            value={activeCellValue}
            onChange={(e) => setActiveCellValue(e.target.value)}
            onKeyPress={onCellEditorKeyPress}
            placeholder="Enter cell value..."
            onBlur={commitActiveCellValue} />
        </ControlBar>
        <HotTable
          licenseKey='non-commercial-and-evaluation'
          beforeColumnSort={onBeforeColumnSort}
          beforeChange={onBeforeChange}
          afterSelectionByProp={onAfterSelection}
          afterRender={updateHotSortConfig}
          settings = {hotSettings}
          ref={hotRef} />
      </Panel>
      <CodeEditor mode="typescript" theme="monokai" value={adapterCode}
         codeEditorHidden={codeEditorHidden}
         onLoad ={loadAdapterCode}
         onBlur={(e, code) => setAdapterCode(code.getValue())}
        //  onBlur={onBlurCodeEditor}
         width="30vw" height="100vh"
      />
      <EditorButton codeEditorHidden={codeEditorHidden} right="70px"
        onClick={() => {saveAdapterCode();}}> Save
      </EditorButton>
      <EditorButton codeEditorHidden={codeEditorHidden} right="10px"
        onClick={() => setCodeEditorHidden(true)}> Close
      </EditorButton>
    </>;
  } else {
    return null;
  }
}

export default WcPanel;
