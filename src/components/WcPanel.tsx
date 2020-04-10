import React from "react";
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";

import { connect } from 'react-redux'
import * as WcActions from '../actions'
import { bindActionCreators } from 'redux'

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

const WcPanel = ({ appRecords, appAttributes, actions }) => {
  const hotSettings = {
    data: formatRecordsForHot(appRecords),
    rowHeaders: true,
    contextMenu: true,
    columns: formatAttributesForHot(appAttributes),
    colHeaders: appAttributes.map(attr => attr.name)
  }

  if (appRecords) {
    return <Panel>
      <HotTable
        licenseKey='non-commercial-and-evaluation'
        settings = {hotSettings} />
    </Panel>;
  } else {
    return null;
  }
}

const mapStateToProps = state => ({
  appRecords: state.appRecords,
  appAttributes: state.appAttributes
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(WcActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WcPanel)

