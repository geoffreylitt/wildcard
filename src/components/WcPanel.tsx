import React from "react";
import { HotTable } from '@handsontable/react';
import "handsontable/dist/handsontable.full.css";

import { connect } from 'react-redux'
import * as WcActions from '../actions'
import { bindActionCreators } from 'redux'

const WcPanel = ({ tableData, actions }) => {
  console.log("table data", tableData);

  const changeData = () => {
    actions.changeData();
  }

  return <div>
    <HotTable
      licenseKey='non-commercial-and-evaluation'
      data={ tableData }
      colHeaders={true}
      rowHeaders={true}
      width="600"
      height="200" />

    <button onClick={changeData}>Change data</button>
  </div>;
}

const mapStateToProps = state => ({
  tableData: state.tableData
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(WcActions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WcPanel)

