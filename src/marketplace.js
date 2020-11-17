const localAdaptersKey = 'localStorageAdapter:adapters';
let LOCAL_ADAPTERS;

window.onload = function(e){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const key = urlParams.get('key');

  // don't do anything if key is not available
  if (key == null || key == "")
    return;
  
  // read adapter code from storage
  chrome.storage.local.get(key, (results) => {
    const code = results[key];

    // populate fields
    document.getElementById("code").textContent = code;

    // get name and url from adapter code
    
    // const scraper = new Function(`return ${code}`)();
    // document.getElementById("name").value = scraper.name;
    // document.getElementById("url").value = scraper.contains;
    
    const json = JSON.parse(code);
    document.getElementById("name").value = json.name;
    document.getElementById("url").value = json.urls[0];

    document.getElementById("upload").removeAttribute('disabled');
  });

}

// listen for custom event to ensure adapter info has been parsed
document.addEventListener('adapterReady', function (e) {
  const adapterName = document.getElementById("adapterName").textContent;
  const adapterCode = document.getElementById("adapterCode").textContent;
  const url = document.getElementById("url").textContent;

  const installBtn = document.getElementById("install");
  const uninstallBtn = document.getElementById("uninstall");
  const status = document.getElementById('status');

  // check if adapter installed
  // load LOCAL_ADAPTERS
  chrome.storage.local.get([localAdaptersKey], (results) => {
    LOCAL_ADAPTERS = results[localAdaptersKey];
    // initialize LOCAL_ADAPTERS if needed
    if (LOCAL_ADAPTERS === undefined) {
      LOCAL_ADAPTERS = [];
      installBtn.removeAttribute('disabled');
    } else if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapterName) > -1) {
      // hide Install button
      installBtn.style.display = "none";
      uninstallBtn.style.display = "inline";
      status.textContent = "Adapter already installed.";
    } else {
      installBtn.removeAttribute('disabled');
    }
  });

  // add onclick to install and uninstall buttons
  installBtn.onclick = function () {
    // if adapterName not exist, update LOCAL_ADAPTERS and create one
    if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapterName) === -1) {
      LOCAL_ADAPTERS.push(adapterName);
      chrome.storage.local.set({ [localAdaptersKey]: LOCAL_ADAPTERS }, function () {
        const key = `${localAdaptersKey}:${adapterName}`;
        chrome.storage.local.set({ [key]: adapterCode }, () => {
          // Update status to let user know adapter was installed.
          status.textContent = "Adapter installed.";
          installBtn.style.display = "none";
          uninstallBtn.style.display = "inline";

          // open a window with the target url with delay
          setTimeout(() => {
            window.open(url);
          }, 1000);
        });
      });
    }
  }

  uninstallBtn.onclick = function () {
    // if adapterName exists, remove it from storage
    if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapterName) !== -1) {
      LOCAL_ADAPTERS.splice(LOCAL_ADAPTERS.indexOf(adapterName), 1);
      chrome.storage.local.set({ [localAdaptersKey]: LOCAL_ADAPTERS });

      const key = `${localAdaptersKey}:${adapterName}`;
      chrome.storage.local.remove(key, () => {
        status.textContent = "Adapter removed.";
        // hide Uninstall button, show Install button
        installBtn.removeAttribute('disabled');
        installBtn.style.display = "inline";
        uninstallBtn.style.display = "none";
      });
    }
  }
});
