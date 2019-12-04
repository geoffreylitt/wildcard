(function () {
  'use strict';
  
  const setupTable = () => {
    console.log("hey there")

    let events = document.querySelectorAll("div[data-eventchip]")
    console.log(events)
  }

  if (document.readyState === "complete") {
    setupTable();
  } else {
    window.addEventListener("load", setupTable);
  }
})();