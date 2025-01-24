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


  //TEST THIS FUNCTION AND ENSURE ENABLE CHECK BOX STAYS CHECKED WHEN BOX IS RECLICKED
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggle').addEventListener('change', function() {
      if (this.checked){
        let modelLocation = document.getElementById('modelLocation').value;
        let wordLength = document.getElementById('wordLength').value;
        let letterKeysLocation = document.getElementById('letterKeysLocation').value;
        let typingBuffer = document.getElementById('typingBuffer').value;
        let revertTimer = document.getElementById('revertTimer').value;
        let firstToken = document.getElementById('firstToken').value;
        browser.runtime.sendMessage({message: 'ActivateListeners', modelLocation: modelLocation, wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
      }
      else {
        browser.runtime.sendMessage({message: 'RemoveListeners'});
      }
      });
    });