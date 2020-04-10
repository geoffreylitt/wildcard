import React, { useRef } from "react";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";

import keyBy from 'lodash/keyBy'
import includes from 'lodash/includes'

import { connect } from 'react-redux'
import * as WcActions from '../core/actions'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'

import styled from 'styled-components'

import { getFinalRecords, getFinalAttributes } from '../core/getFinalTable'
import { Record, Attribute } from '../core/types'

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

const Panel = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 280px;
  width: 98vw;
  z-index: 100;

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

const WcPanel = ({ records, attributes, actions }) => {
  const hotRef = useRef(null);

  const hotSettings = {
    data: formatRecordsForHot(records),
    rowHeaders: true,
    columns: formatAttributesForHot(attributes),
    colHeaders: attributes.map(attr => attr.name),
    columnSorting: true,
    width: "100%",
    stretchH: "all" as const,
    height: 250,
    hiddenColumns: {
      columns: attributes.map((attr, idx) => attr.hidden ? idx : null).filter(e => Number.isInteger(e))
    },
    contextMenu: {
      items: {
        "insert_user_attribute": {
          name: 'Insert new column',
          callback: function(key, selection, clickEvent) {
            actions.addAttribute("user");
          }
        },
        "rename_user_attribute": {
          // todo: disable this on site columns
          name: 'Rename column',
          callback: function(key, selection, clickEvent) {
            alert('not implemented yet');
          }
        }
      }
    }
  }

  const getHotInstance = () => {
    if (hotRef && hotRef.current) { return hotRef.current.hotInstance; }
    else { return null; }
  }

  const onBeforeColumnSort = (_, destinationSortConfigs) => {
    // We suppress HOT's built-in sorting by returning false,
    // and manually tell HOT that we've taken care of
    // sorting the table ourselves.
    // https://handsontable.com/docs/7.4.2/demo-sorting.html#custom-sort-implementation
    const columnSortPlugin = getHotInstance().getPlugin('columnSorting');
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

    return false;
  }

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

    console.log("wcpanel edits", edits);
    actions.editRecords(edits);

    return false;
  }

  if (records && records.length > 0) {
    return <Panel>
      <ControlBar><strong>Wildcard v0.2</strong></ControlBar>
      <HotTable
        licenseKey='non-commercial-and-evaluation'
        beforeColumnSort={onBeforeColumnSort}
        beforeChange={onBeforeChange}
        settings = {hotSettings}
        ref={hotRef} />
    </Panel>;
  } else {
    return null;
  }
}

export default WcPanel;
