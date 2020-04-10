import React, { useRef } from "react";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";
import keyBy from 'lodash/keyBy'

import { connect } from 'react-redux'
import * as WcActions from '../actions'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'

import styled from 'styled-components'

function formatRecordsForHot(records) {
  return records.map(record => ({
    id: record.id,
    ...record.attributes
  }))
}

function formatAttributesForHot(attributes) {
  return attributes.map(attribute => ({
    data: attribute.name,
    type: attribute.type
  }))
}

const Panel = styled.div`
  border-top: solid thin #ddd;
  position: fixed;
  overflow: hidden;
  background-color: white;
  font-size: 14px;
  height: 250px;
  width: 100%;
  z-index: 3000;
  bottom: 0;
`

// Declare our functional React component

const WcPanel = ({ records, attributes, actions }) => {
  const hotRef = useRef(null);
  const columns = formatAttributesForHot(attributes);

  const hotSettings = {
    data: formatRecordsForHot(records),
    rowHeaders: true,
    contextMenu: true,
    columns: columns,
    colHeaders: attributes.map(attr => attr.name),
    columnSorting: true
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

  if (records) {
    return <Panel>
      <HotTable
        licenseKey='non-commercial-and-evaluation'
        beforeColumnSort={onBeforeColumnSort}
        settings = {hotSettings}
        ref={hotRef} />
    </Panel>;
  } else {
    return null;
  }
}

// Hook it up to our Redux store with react-redux

const mapStateToProps = state => ({
  // todo: when we have non-app records and attributes,
  // merge them in the redux state, and pass in merged data here --
  // this panel view isn't responsible for combining them.
  // keep this component thin.
  records: state.finalRecords,
  attributes: state.appAttributes
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(WcActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WcPanel)

