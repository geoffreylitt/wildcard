const appRecords = (state = null, action) => {
  switch(action.type) {
    case "LOAD_RECORDS":
      console.log("new records loaded", action.records);
      return action.records

    default:
      return state;
  }
}

export default appRecords;
