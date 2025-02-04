function enableAddOn(){
  let modelLocation = document.getElementById('modelLocation').value;
  let wordLength = document.getElementById('wordLength').value;
  let wordLengthBufferToken = document.getElementById('wordLengthBufferToken').value;
  let letterTokensLocation = document.getElementById('letterTokensLocation').value;
  let typingBuffer = document.getElementById('typingBuffer').value;
  let revertTimer = document.getElementById('revertTimer').value;
  let firstToken = document.getElementById('firstToken').value;
  browser.runtime.sendMessage({message: 'ActivateListeners', modelLocation: modelLocation, wordLength: wordLength, wordLengthBufferToken: wordLengthBufferToken, letterTokensLocation: letterTokensLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
}

if (localStorage.getItem('modelLocation')){
  document.getElementById('modelLocation').value = localStorage.getItem('modelLocation');
  document.getElementById('wordLength').value = localStorage.getItem('wordLength');
  document.getElementById('wordLengthBufferToken').value = localStorage.getItem('wordLengthBufferToken');
  document.getElementById('letterTokensLocation').value = localStorage.getItem('letterTokensLocation');
  document.getElementById('typingBuffer').value = localStorage.getItem('typingBuffer');
  document.getElementById('revertTimer').value = localStorage.getItem('revertTimer');
  document.getElementById('firstToken').value = localStorage.getItem('firstToken');
}

if (localStorage.getItem('toggleSwitch') == "enabled"){
  document.getElementById('toggleSwitch').checked = true;
  //set the rest of global vars in localstorage and reset text as well as checkbox
}

  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggleSwitch').addEventListener('change', function() {
      if (this.checked){
        localStorage.setItem("toggleSwitch", "enabled");
        localStorage.setItem("modelLocation", document.getElementById('modelLocation').value);
        localStorage.setItem("wordLength", document.getElementById('wordLength').value);
        localStorage.setItem("wordLengthBufferToken", document.getElementById('wordLengthBufferToken').value);
        localStorage.setItem("letterTokensLocation", document.getElementById('letterTokensLocation').value);
        localStorage.setItem("typingBuffer", document.getElementById('typingBuffer').value);
        localStorage.setItem("revertTimer", document.getElementById('revertTimer').value);
        localStorage.setItem("firstToken", document.getElementById('firstToken').value);
        enableAddOn();

      }
      else {
        localStorage.removeItem("toggleSwitch");
        browser.runtime.sendMessage({message: 'RemoveListeners'});
      }
      });
    });