const sortOrder = (state = null, action) => {
  switch(action.type) {
    case "SORT_RECORDS":
      console.log("new sort order", action.sortConfig);
      return action.sortConfig;

    default:
      return state;
  }
}

export default sortOrder;
