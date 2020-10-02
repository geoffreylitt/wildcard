(function(){
    const generateConfigButton = document.getElementById('generateConfig');
    const selectorsInput = document.getElementById('selectorsInput');
    generateConfigButton.addEventListener('click', (event) => {
      const selectors = selectorsInput.value.split(",").map(selector => selector.trim());
      selectors.reverse();
      if (selectors && selectors.length) {
        const message = { command: 'generateScraper', selectors };
        chrome.runtime.sendMessage(message, (response) => {
          if (response.error) {
            alert(response.error);
          }
        });
      } else {
        alert('Please paste selectors for the first row in the input before clicking button.');
      }
    });
})();