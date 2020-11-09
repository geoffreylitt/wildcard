(function(){
    let LOCAL_ADAPTERS;
    const localStorageKey = 'localStorageAdapter';
    const localAdaptersKey = `${localStorageKey}:adapters`;
    const adapterActionsSelect = document.getElementById('adapterActions');
    const createAdaptersContainer = document.getElementById('createAdapterContainer');
    const createAdaptersInput = document.getElementById('createAdapter');
    const loadAdaptersContainer = document.getElementById('loadAdaptersContainer');
    const adaptersSelect = document.getElementById('loadAdapters');
    const saveAdapterButton = document.getElementById('saveAdapter');
    const deleteAdapterButton = document.getElementById('deleteAdapter');
    var editor;

    window.onload = function(e){ 
        editor = ace.edit("adapterEditor"); 
        editor.session.setMode("ace/mode/typescript"); 
        editor.setTheme("ace/theme/monokai"); 
    } 

    function statusMessage(msg) {
        let status = document.getElementById('status');
        status.textContent = msg;
        setTimeout(function() {
            status.textContent = '';
        }, 1000);
    }
    function readFromLocalStorage(key, callback) {
        chrome.storage.local.get([key], (results) => {
            callback(results[key])
        });
    }
    function saveToLocalStorage(key, value, callback) {
        if (callback) {
            chrome.storage.local.set({ [key]: value }, callback);
        } else {
            chrome.storage.local.set({ [key]: value }, function() {
            // Update status to let user know options were saved.
            statusMessage("Adapter saved.");
            });
        }
    }
    function removeFromLocalStorage(key, callback) {
        if (callback) {
            chrome.storage.local.remove(key, callback);
        } else {
            chrome.storage.local.remove(key, function() {
              // Update status to let user know options were saved.
              statusMessage("Options updated.");
            });
        }
    }
    function populateAdapterSelect(localAdapters = []) {
        LOCAL_ADAPTERS = localAdapters;
        adaptersSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.text = 'Choose adapter';
        defaultOption.value = '';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        defaultOption.hidden = true;
        adaptersSelect.append(defaultOption);
        localAdapters.forEach(adapter => {
            const option = document.createElement('option');
            option.value = adapter;
            option.text = adapter;
            adaptersSelect.append(option);
        });
    }
    adapterActionsSelect.addEventListener('change', () => {
        const action = adapterActionsSelect.value;
        loadAdaptersContainer.style.display = 'none';
        createAdaptersContainer.style.display = 'none';
        deleteAdapterButton.style.display = 'none';
        createAdaptersInput.value = '';
        editor.setValue('');
        if (action === 'create') {
            createAdaptersContainer.style.display = 'block';
        } else if (action === 'load' || action === 'delete') {
            loadAdaptersContainer.style.display = 'block';
            const adapter = adaptersSelect.value;
            if (adapter) {
                readFromLocalStorage(`${localAdaptersKey}:${adapter}`, (adapterConfig) => {
                    editor.setValue(adapterConfig);
                });
            }
            if (action === 'delete') {
                deleteAdapterButton.style.display = 'inline';
            }
        }
    });
    adaptersSelect.addEventListener('change', () => {
        const adapter = adaptersSelect.value;
        readFromLocalStorage(`${localAdaptersKey}:${adapter}`, (adapterConfig) => {
            editor.setValue(adapterConfig);
        });
    });
    saveAdapterButton.addEventListener('click', () => {
        const adapterConfig = editor.getValue().trim();
        const action = adapterActionsSelect.value;
        const adapter = action === 'create' ? createAdaptersInput.value.trim() : adaptersSelect.value;
        if (adapter && adapterConfig) {
            if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapter) === -1) {
                LOCAL_ADAPTERS.push(adapter);
                populateAdapterSelect(LOCAL_ADAPTERS);
                saveToLocalStorage(localAdaptersKey, LOCAL_ADAPTERS);
            }
            saveToLocalStorage(`${localAdaptersKey}:${adapter}`, adapterConfig);
        } else {
            alert('Please select an adapter to save to and make sure the text area has content.')
        }
    });
    deleteAdapterButton.addEventListener('click', () => {
        const adapter = adaptersSelect.value;
        if (adapter) {
            if (Array.isArray(LOCAL_ADAPTERS) && LOCAL_ADAPTERS.indexOf(adapter) !== -1) {
                LOCAL_ADAPTERS.splice(LOCAL_ADAPTERS.indexOf(adapter), 1);
                populateAdapterSelect(LOCAL_ADAPTERS);
                saveToLocalStorage(localAdaptersKey, LOCAL_ADAPTERS);
            }
            removeFromLocalStorage(`${localAdaptersKey}:${adapter}`, () => {
                editor.setValue('');
                statusMessage("Adapter removed.");
              });

        }
    });
    chrome.runtime.getBackgroundPage((backgroundPage) => {
        readFromLocalStorage(localAdaptersKey, populateAdapterSelect);
        const { state } = backgroundPage;
        if (state && state.endUserScraper) {
            const { name, config } = state.endUserScraper;
            adapterActionsSelect.value = 'create';
            adapterActionsSelect.dispatchEvent(new Event('change'));
            createAdaptersInput.value = name;
            editor.setValue(config);
            delete state.endUserScraper;
        }
    });
})();