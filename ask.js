(function () {
  let LOCAL_ADAPTERS;
  const localAdaptersKey = 'localStorageAdapter:adapters';

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const aid = urlParams.get('aid');
  const url = "http://localhost:3000/adapters/" + aid + "/script.ts";

  let adapterName ="default";
  let adapterCode;

  // alert("aid=" + aid);
  // alert("url=" + url);

  let editor;
  window.onload = function(e){ 
    editor = ace.edit("adapterViewer"); 
    editor.session.setMode("ace/mode/typescript"); 
    editor.setTheme("ace/theme/monokai"); 
    editor.setReadOnly(true);

    // load LOCAL_ADAPTERS
    chrome.storage.local.get([localAdaptersKey], (results) => {
      LOCAL_ADAPTERS = results[localAdaptersKey];
      // defined LOCAL_ADAPTERS if needed
      if (LOCAL_ADAPTERS === undefined){
        LOCAL_ADAPTERS = [];
      }
    });

    $.get(url, function (data, status) {
      adapterCode = data;
      // get adapter name from adapterCode
      const result = adapterCode.match(/name\s*:\s*['|"](.*)['|"],/);
      if (result && result.length > 1){
        adapterName = result[1];
      }

      editor.setValue(adapterCode);
      $("#adapterName").text(adapterName);

      // check if adapter already installed
      if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapterName) > -1) {
        // disable Install button
        $("#install").attr("disabled", true);
        statusMessage("Adapter already installed.");
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      alert("error " + textStatus + errorThrown);
    });
  } 

  $("#install").on("click", function(event) {
    // if adapterName not exist, update LOCAL_ADAPTERS and create one
    if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapterName) === -1) {
      document.getElementById("askContainer").style.cursor = "wait";
      LOCAL_ADAPTERS.push(adapterName);
      chrome.storage.local.set({ [localAdaptersKey]: LOCAL_ADAPTERS }, function(){
        const key = "localStorageAdapter:adapters:" + adapterName;
        chrome.storage.local.set({ [key]: adapterCode }, function() {
          document.getElementById("askContainer").style.cursor = "default";
          // Update status to let user know adapter was installed.
          statusMessage("Adapter installed.");
          $("#install").attr("disabled", true);
        });
      });
    }
  });

  function statusMessage(msg) {
    let status = document.getElementById('status');
    status.textContent = msg;
  }

})();