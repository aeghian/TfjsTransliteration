let configurationInputs = {
  "modelLocation": document.getElementById('modelLocation').value,
  "wordLength": document.getElementById('wordLength').value,
  "wordLengthBufferToken": document.getElementById('wordLengthBufferToken').value,
  "letterTokensLocation": document.getElementById('letterTokensLocation').value,
  "typingBuffer": document.getElementById('typingBuffer').value,
  "revertTimer": document.getElementById('revertTimer').value,
  "firstToken": document.getElementById('firstToken').value,
  "noncharacterTokens": document.getElementById('noncharacterTokens').value
};

if (localStorage.getItem('modelLocation')){
  for (const key in configurationInputs){
    document.getElementById(key).value = localStorage.getItem(key);
  };
}

if (localStorage.getItem('toggleSwitch') == "enabled"){
  document.getElementById('toggleSwitch').checked = true;
}

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggleSwitch').addEventListener('change', function() {
      if (this.checked){
        for (const key in configurationInputs){
          localStorage.setItem(key, document.getElementById(key).value);
        };
        localStorage.setItem("toggleSwitch", "enabled");
        browser.runtime.sendMessage({message: 'ActivateListeners', configurationInputs: configurationInputs});
      }
      else {
        localStorage.removeItem("toggleSwitch");
        browser.runtime.sendMessage({message: 'RemoveListeners', configurationInputs: configurationInputs});
      }
      });
    });