function decodeArmenianWordPredictionArray(outputArray){
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

  let placeholderArray = [];
  for (const prediction of outputArray){
    let placeholderData = '';
    for (const key of prediction){
      if (key < 4){
        break;
      }
      placeholderData += armenianLetterKeys[(Number(key)).toString()];
    }
    placeholderArray.push(placeholderData); 
  }

  let armenianWordPredictionsArray = placeholderArray;
  return armenianWordPredictionsArray;
}

function returnEnglishTextIndex(currentTextArray){
  let englishTextIndexArray = [];
  let index = 0;
  for (const word of currentTextArray){
    if (/^[a-zA-Z]+$/.test(word)){
      englishTextIndexArray.push(index);
    }
    index++;
  }
  return englishTextIndexArray;
}

function returnModifiedTextArray(englishTextIndexArray, currentTextArray, modelOutputsArray){
  let outputIndex = 0;
  for (const textIndex of englishTextIndexArray){
    let armenianWordPredictionsArray = decodeArmenianWordPredictionArray(modelOutputsArray[outputIndex]);
    //store additional output options in dictionaryarmenianWordPredictionsArray
    browser.runtime.sendMessage({message: 'UpdateEnglishToArmenianDictionary', text:  currentTextArray[textIndex], armenianWordPredictionsArray: armenianWordPredictionsArray});
    currentTextArray[textIndex] = armenianWordPredictionsArray[0];
    outputIndex++;
  }
  return currentTextArray;
}

function modifyText(text, modelOutputsArray) {
  let currentTextArray = text.split(" ");
  let englishTextIndexArray = returnEnglishTextIndex(currentTextArray);
  let modifiedTextArray = returnModifiedTextArray(englishTextIndexArray, currentTextArray, modelOutputsArray);
  //reattach array as strng
  let modifiedText = modifiedTextArray.join(" ");
  modifiedText += " ";
  return modifiedText;
  }
  
//FINISH THIS FUNCTION
function returnCleanText(text){
  let cleanText = [];
  let nonletterLocation = [];
  textIndex = 0;
  for (const word of text.split(" ")){
    let result = word.replace(/[^a-zA-Z]/g, '');
    if (result.length > 0){
      nonletterLocation.push({textIndex: []});
    }
    textIndex++;
  }
  return cleanText;
}

function getModelInputs(text){
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
  //CAPTURE WHERE CAPITALS ARE TO ADJUST LATER also capture punctuation
  let cleanText = returnCleanText(text);
  let  = cleanText.split(" ");
  let englishTextIndexArray = returnEnglishTextIndex(currentTextArray);
  let modelInputsArray = [];
  for (const textIndex of englishTextIndexArray){
    let englighText = currentTextArray[textIndex].toLowerCase().split("").reverse().join(""); //input needs to be reversed/lowercase for model
    let keyArray = [[2]]; 
    for (const letter of englighText){
      keyArray.push([Number(englishLetterKeys[letter])]);
    }
    //pad for variable length
    const maxLength = 32;
    for (let i = keyArray.length; i < maxLength; i++){
      keyArray.push([1]);
    }
    modelInputsArray.push(keyArray);
  }

  return modelInputsArray;
}

  document.addEventListener("keydown", async function(event) {
    //ADD TIMER HERE TO WAIT FOR PERSON TO STOP TYPING
    if (event.key == " "  || event.code == "Space"){
      // Get the text that the user is typing.
      let text = event.target.value;

      let modelInputsArray = getModelInputs(text);

      let modelOutputsArray = await browser.runtime.sendMessage({message: 'RunModel', modelInputsArray: modelInputsArray});
      // Modify the text.
      let modifiedText = await modifyText(text, modelOutputsArray.message);
      // Set the text back on the element.
      while (event.target.value.replace(/ /g,'') == text.replace(/ /g,'')){
        evecurrentTextArraynt.target.value = modifiedText;
        await new Promise(r => setTimeout(r, 500)); //needed because some text fields instantly revert text after being changed
      }
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
