const appAttributes = (state = null, action) => {
  switch(action.type) {
    case "SET_APP_ATTRIBUTES":
      console.log("setting attributes", action.appAttributes)
      return action.appAttributes

    default:
      return state;
  }
}

export default appAttributes;
