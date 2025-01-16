document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('saveButton').addEventListener('click', function() {
      let modelLocation = document.getElementById('modelLocation').value;
      let wordLength = document.getElementById('wordLength').value;
      let letterKeysLocation = document.getElementById('letterKeysLocation').value;
      let typingBuffer = document.getElementById('typingBuffer').value;
      let revertTimer = document.getElementById('revertTimer').value;
      let firstToken = document.getElementById('firstToken').value;
      browser.runtime.sendMessage({message: 'SaveSettings', modelLocation: modelLocation, wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
    });
  });

browser.runtime.onInstalled.addListener(function() {
  console.log('Addon installed');
});
