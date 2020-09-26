(function(){
    const optionsContainer = document.getElementById('optionsContainer');
    const optionSelector = '.option';
    optionsContainer.addEventListener('click', (event) => {
        console.log(event.target);
        const closest = event.target.closest(optionSelector);
        if (closest && optionsContainer.contains(closest)) {
          switch(closest.id) {
              case 'optionsPage':
                chrome.runtime.openOptionsPage() 
                break;
              default:
                break;
          }
        }
    });
})();