(function () {
  'use strict';
  
  let gmail = Gmail()

  const setupTable = () => {
    console.log("hey there")
    console.log(gmail.get.user_email())

    console.log(gmail.dom.visible_messages())
  }

  if (document.readyState === "complete") {
    setupTable();
  } else {
    window.addEventListener("load", setupTable);
  }
})();