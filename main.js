function predictArmenianWords (translitEnglishWord){
  translitEnglishWord = translitEnglishWord.toLowerCase();
  let englishLetterKeys = {
    '<unk>': '0',
    '<pad>': '1',
    '<s>': '2',
    'h': '3',
    'a': '4',
    'o': '5',
    'n': '6',
    'e': '7',
    't': '8',
    'r': '9',
    's': '10',
    'y': '11',
    'u': '12',
    'z': '13',
    'd': '14',
    'v': '15',
    'g': '16',
    'l': '17',
    'k': '18',
    'c': '19',
    'm': '20',
    'b': '21',
    'p': '22',
    'i': '23',
    'j': '24',
    'f': '25'
  };

  let armenianLetterKeys = {
    '0': '<unk>',
    '1': '<pad>',
    '2': '<os>',
    '3': '</os>',
    '4': 'ա',
    '5': 'ն',
    '6': 'ե',
    '7': 'ր',
    '8': 'ու',
    '9': 'ց',
    '10': 'թ',
    '11': 'լ',
    '12': 'իւ',
    '13': 'տ',
    '14': 'կ',
    '15': 'ո',
    '16': 'գ',
    '17': 'ս',
    '18': 'ի',
    '19': 'ւ',
    '20': 'ծ',
    '21': 'ք',
    '22': 'մ',
    '23': 'ղ',
    '24': 'պ',
    '25': 'ուե',
    '26': 'ռ',
    '27': 'հ',
    '28': 'ձ',
    '29': 'դ',
    '30': 'բ',
    '31': 'յ',
    '32': 'խ',
    '33': 'շ',
    '34': 'զ',
    '35': 'վ',
    '36': 'ժ',
    '37': 'ուա',
    '38': 'չ',
    '39': 'փ',
    '40': 'օ',
    '41': 'ոյ',
    '42': 'է',
    '43': 'ջ',
    '44': 'ը',
    '45': 'ճ',
    '46': 'ուի',
    '47': 'ուո',
    '48': 'ֆ',
    '49': 'ուէ',
    '50': 'ուը',
    '51': 'ուօ'
  };
  
  let keyArray = []; 
  for (const letter of translitEnglishWord){
    keyArray.push(englishLetterKeys[letter]);
  }

  //this will need to be modified with nodejs library, but it creates placeholder dict for now
  let placeholderArray = [];
  for (let i=0; i < 5; i++){
    let placeholderData = '';
    for (const key of keyArray){
      placeholderData += armenianLetterKeys[(Number(key)+i).toString()];
    }
    placeholderArray.push(placeholderData); 
  }

  let armenianWordPredictionsArray = placeholderArray;
  return armenianWordPredictionsArray;
}

function modifyText(text) {
    let textArray = text.split(" ");
    let newText = textArray[textArray.length - 1]; //replace latest word in text THIS PROCESS SHOULD BE CHANGED BY COMPARING OLD STRING TO NEW STRING AND DOING UPDATE BECAUSE LATEST WORD IS NOT ALWAYS AT THE END
    //modify text with pytorch algo
    let armenianWordPredictionsArray = predictArmenianWords(newText);

    textArray[textArray.length - 1] = armenianWordPredictionsArray[0];

    //reattach array as strng
    let modifiedText = textArray.join(" ");

    //store additional output options in dictionaryarmenianWordPredictionsArray
    browser.runtime.sendMessage({message: 'UpdateEnglishToArmenianDictionary', text:  newText, armenianWordPredictionsArray: armenianWordPredictionsArray});

    // Return the modified text.
    return modifiedText;
  }
  
  document.addEventListener("keydown", function(event) {
    if (event.key == " "  || event.code == "Space"){
      // Get the text that the user is typing.
      let text = event.target.value;

      // Modify the text.
      let modifiedText = modifyText(text);
      
      // Set the text back on the element.
      event.target.value = modifiedText;
    }
  });


  document.addEventListener("selectionchange", function(event) {
    let selectionStart = event.target.selectionStart;
    let selectionEnd = event.target.selectionEnd;
    let highlightedText = event.target.value.slice(selectionStart, selectionEnd);
    browser.runtime.sendMessage({message: 'UpdateContextMenu', highlightedText: highlightedText});
  });

  browser.runtime.onMessage.addListener( 
    function(request) {
      if (request.message == 'ReviseWord'){
        //probably a better way than looping through every input field. Update later
        var all_inputs = document.getElementsByTagName('input')
        for (input of all_inputs){
          if (input == document.activeElement){
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const input_text = input.value;
            const highlightedText = input_text.slice(start, end);
            const modified_input_text = input_text.substring(0, start) + request.revision + input_text.substring(end, input_text.length);
            input.value = modified_input_text;
            }
        }
      }
    }
  );
