// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('saveButton').addEventListener('click', function() {
//       let modelLocation = document.getElementById('modelLocation').value;
//       let wordLength = document.getElementById('wordLength').value;
//       let letterKeysLocation = document.getElementById('letterKeysLocation').value;
//       let typingBuffer = document.getElementById('typingBuffer').value;
//       let revertTimer = document.getElementById('revertTimer').value;
//       let firstToken = document.getElementById('firstToken').value;
//       browser.runtime.sendMessage({message: 'ActivateListeners', modelLocation: modelLocation, wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
//     });
//   });

function enableAddOn(){
  let modelLocation = document.getElementById('modelLocation').value;
  let wordLength = document.getElementById('wordLength').value;
  let letterKeysLocation = document.getElementById('letterKeysLocation').value;
  let typingBuffer = document.getElementById('typingBuffer').value;
  let revertTimer = document.getElementById('revertTimer').value;
  let firstToken = document.getElementById('firstToken').value;
  browser.runtime.sendMessage({message: 'ActivateListeners', modelLocation: modelLocation, wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
}

if (localStorage.getItem('modelLocation')){
  document.getElementById('modelLocation').value = localStorage.getItem('modelLocation');
  document.getElementById('wordLength').value = localStorage.getItem('wordLength');
  document.getElementById('letterKeysLocation').value = localStorage.getItem('letterKeysLocation');
  document.getElementById('typingBuffer').value = localStorage.getItem('typingBuffer');
  document.getElementById('revertTimer').value = localStorage.getItem('revertTimer');
  document.getElementById('firstToken').value = localStorage.getItem('firstToken');
}

if (localStorage.getItem('toggleSwitch') == "enabled"){
  document.getElementById('toggle').checked = true;
  //set the rest of global vars in localstorage and reset text as well as checkbox
}


  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggle').addEventListener('change', function() {
      if (this.checked){
        localStorage.setItem("toggleSwitch", "enabled");
        localStorage.setItem("modelLocation", document.getElementById('modelLocation').value);
        localStorage.setItem("wordLength", document.getElementById('wordLength').value);
        localStorage.setItem("letterKeysLocation", document.getElementById('letterKeysLocation').value);
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