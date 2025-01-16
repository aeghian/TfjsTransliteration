//Settings (Set defaults)/ensure settings carry between page reloads
let wordLength;
let armenianLetterKeys = {};
let englishLetterKeys = {};
let typingBuffer;
let revertTimer;
let firstToken;


function decodeArmenianWordPredictionArray(outputArray){
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
    if (/^[a-zA-Z]+$/.test(word.trim())){
      englishTextIndexArray.push(index);
    }
    index++;
  }
  return englishTextIndexArray;
}

function returnarmenianTextArray(englishTextIndexArray, currentTextArray, modelOutputsArray){
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

function returnCapitalArmenianTextArray(armenianTextArray, capitalLocation){
  for (const armenianTextArrayIndex in capitalLocation){
    for (const capitalLocationIndex of capitalLocation[armenianTextArrayIndex]){
      armenianTextArray[armenianTextArrayIndex] = armenianTextArray[armenianTextArrayIndex].substring(0, capitalLocationIndex) + armenianTextArray[armenianTextArrayIndex][capitalLocationIndex].toUpperCase() + armenianTextArray[armenianTextArrayIndex].substring(capitalLocationIndex + 1);
    }  
  }
  return armenianTextArray;
}

function returnNonletterArmenianTextArray(capitalArmenianTextArray, nonletterLocations){
  let modifiedText = "";
  let capitalArmenianTextArrayIndex = 0;
  for (const capitalArmenianText of capitalArmenianTextArray){
    modifiedText += capitalArmenianText;
    if (capitalArmenianTextArrayIndex in nonletterLocations){
      modifiedText += nonletterLocations[capitalArmenianTextArrayIndex].join("");
    }
    else{
      modifiedText += " ";
    }
    capitalArmenianTextArrayIndex++;  
  }
  return modifiedText;
}

function returnModifiedTextArray(armenianTextArray, nonletterLocations, capitalLocation){
  let capitalArmenianTextArray = returnCapitalArmenianTextArray(armenianTextArray, capitalLocation);
  let nonletterArmenianTextArray = returnNonletterArmenianTextArray(capitalArmenianTextArray, nonletterLocations); 
  return nonletterArmenianTextArray;
}

function modifyText(text, modelOutputsArray, nonletterLocations, capitalLocation) {
  const regex = /[`~!@#$%^&*()_+-=|\;:'"?/.>,<]/gi;
  text = text.replaceAll(regex, " ");
  let currentTextArray = text.split(" ").filter(function(entry) { return /\S/.test(entry); });
  let englishTextIndexArray = returnEnglishTextIndex(currentTextArray);
  let armenianTextArray = returnarmenianTextArray(englishTextIndexArray, currentTextArray, modelOutputsArray);
  let modifiedText = returnModifiedTextArray(armenianTextArray, nonletterLocations, capitalLocation);
  return modifiedText;
  }
  

function returncleanTextArrayAndnonletterLocations(text){
  let cleanTextArray = [];
  let nonletterLocations = {};
  let nonletterLocationsIndex = 0;
  let cleanText = "";
  for (const character of text){
    if (character == " "){
      if (nonletterLocationsIndex in nonletterLocations){
        nonletterLocations[nonletterLocationsIndex].push(character);
      }
      cleanTextArray.push(cleanText);
      cleanText = "";
      nonletterLocationsIndex += 1;
    }
    else if (/[`~!@#$%^&*()_+-=|\;:'"?/.>,<]/.test(character)){
      
      if (nonletterLocationsIndex in nonletterLocations){
        nonletterLocations[nonletterLocationsIndex].push(character);
      }
      else{
        nonletterLocations[nonletterLocationsIndex] = [character];
      }
    }
    else{
      if (nonletterLocationsIndex in nonletterLocations){
        cleanTextArray.push(cleanText);
        cleanText = "";
        nonletterLocationsIndex += 1;
      }
      cleanText += character;
    } 
  }

  return [cleanTextArray, nonletterLocations];
}

function returnCapitalLocation(cleanTextArray){
  let capitalLocation = {};
  let cleanTextArrayIndex = 0;
  for (const word of cleanTextArray){
    let letterIndex = 0;
    let capitalLetterIndexArray = [];
    for (const letter of word){
      if (letter == letter.toUpperCase()){
        capitalLetterIndexArray.push(letterIndex);
      }
      letterIndex++;
    }
    if (capitalLetterIndexArray.length > 0){
      capitalLocation[cleanTextArrayIndex] = capitalLetterIndexArray;
    }
    cleanTextArrayIndex++;
  }
  return capitalLocation;
}

function getModelInputs(text){
  let [cleanTextArray, nonletterLocations] = returncleanTextArrayAndnonletterLocations(text);
  let capitalLocation = returnCapitalLocation(cleanTextArray);

  let englishTextIndexArray = returnEnglishTextIndex(cleanTextArray);
  let modelInputsArray = [];
  for (const textIndex of englishTextIndexArray){
    let englishText = cleanTextArray[textIndex].toLowerCase().split("").reverse().join(""); //input needs to be reversed for model
    let keyArray = [];
    if (!isNaN(firstToken)){
      keyArray.push([firstToken]);
    }
    for (const letter of englishText){
      keyArray.push([Number(englishLetterKeys[letter])]);
    }
    
    //pad for variable length
    for (let i = keyArray.length; i < wordLength; i++){
      keyArray.push([1]);
    }
    modelInputsArray.push(keyArray);
  }
  return [modelInputsArray, nonletterLocations, capitalLocation];
}


let finishedTyping;
document,addEventListener("keydown", async function(event){
  if (event.key != " "){
    let date = new Date();
    finishedTyping = date.getTime() + typingBuffer;
  }
});
  
document.addEventListener("keyup", async function(event) {
  let date = new Date();
  if ((event.key == " "  || event.code == "Space") && date.getTime() > finishedTyping ){
    console.log('here');//REMEMBER TO REMOVE

    // Get the text user is typing.
    let text = event.target.value;

    let [modelInputsArray, nonletterLocations, capitalLocation] = getModelInputs(text);
    browser.runtime.sendMessage({message: 'RunModel', modelInputsArray: modelInputsArray});
    browser.runtime.onMessage.addListener(
      async function(request) {
        if (request.message == 'ModelReturn'){
          // Modify the text.
          let modifiedText = await modifyText(text, request.data, nonletterLocations, capitalLocation);
          // Set the text back on the element.
          while (event.target.value.replace(/ /g,'') == text.replace(/ /g,'')){
            event.target.value = modifiedText;
            await new Promise(r => setTimeout(r, revertTimer)); //needed because some text fields instantly revert text after being changed; maybe adjustable in settings
          }
        }
      }
    );
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
        input = document.activeElement;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const input_text = input.value;
        const highlightedText = input_text.slice(start, end);
        const modified_input_text = input_text.substring(0, start) + request.revision + input_text.substring(end, input_text.length);
        input.value = modified_input_text;        
      }
    }
  );

  function parseLetterKeysFile(letterKeysLocation){
    url = browser.runtime.getURL(letterKeysLocation);
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        for (const line of text.split(/\r?\n/)){
          let [dictKey, dictElement] = line.split(":");
          if (isNaN(dictElement)){
            armenianLetterKeys[dictKey] = dictElement;
          } 
          else{
            englishLetterKeys[dictKey] = dictElement;
          }
        }
      })
      .catch((e) => console.error(e));
  };

  browser.runtime.onMessage.addListener(
    function(request) {
      if (request.message == 'SaveSettings'){
        wordLength = request.wordLength;
        parseLetterKeysFile(request.letterKeysLocation);
        typingBuffer = request.typingBuffer;
        revertTimer = request.revertTimer;
        firstToken = request.firstToken;
      }
    }
  );
