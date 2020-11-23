import React, { useRef, useState } from "react";
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";
import "./overrides.css";

import styled from 'styled-components'

import { Record, Attribute } from '../core/types'
import Handsontable from "handsontable";

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
  right: 20px;
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
  width: 98vw;
  z-index: 2200;

  box-shadow: 0px -5px 10px 1px rgba(170,170,170,0.5);
  border-top: solid thin #9d9d9d;

  overflow: hidden;
  background-color: white;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
`

const ControlBar = styled.div`
  height: 20px;
  padding: 5px 10px;
`

// Declare our functional React component

const WcPanel = ({ records, attributes, query, actions }) => {
  const hotRef = useRef(null);
  const [hidden, setHidden] = useState(false);

  const hotSettings = {
    data: formatRecordsForHot(records),
    rowHeaders: true,
    columns: formatAttributesForHot(attributes),
    colHeaders: attributes.map(attr => attr.name),
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
        cellProperties.placeholder = "loading..."
        cellProperties.className = "formula-cell"
      }
      return cellProperties
    },

    hiddenColumns: {
      columns: attributes.map((attr, idx) => attr.hidden ? idx : null).filter(e => Number.isInteger(e))
    },
    contextMenu: {
      items: {
        "insert_user_attribute": {
          name: 'Insert new user column',
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
          name: 'Clear user table',
          callback: function(key, selection, clickEvent) {
            // TODO: For now, new columns always get added to the user table.
            // Eventually, do we want to allow adding to the main site table?
            // Perhaps that'd be a way of extending scrapers using formulas...
            actions.clear("user");
          }
        },
        "toggle_column_visibility":{
          name: 'Toggle visibility',
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

    actions.editRecords(edits);

    // don't let HOT edit the value
    return false;
  }

  const onAfterSelection = (rowIndex, prop) => {
    const recordId = records[rowIndex].id;
    const attribute = prop;

    actions.selectRecord(recordId, attribute)
  }

  if (records && records.length > 0) {
    return <>
      <ToggleButton hidden={hidden} onClick={ () => setHidden(!hidden)}>
        { hidden ? "↑ Open Wildcard Table" : "↓ Close Wildcard Table" }
      </ToggleButton>
      <Panel hidden={hidden}>
        <ControlBar>
          <strong>Wildcard v0.2</strong>
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
    </>;
  } else {
    return null;
  }
}

export default WcPanel;
