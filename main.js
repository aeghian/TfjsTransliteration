//Settings
let wordLength;
let wordLengthBufferToken;
let armenianLetterKeys = {};
let englishLetterKeys = {};
let typingBuffer;
let revertTimer;
let firstToken;
let noncharacterTokens = [];


function decodeArmenianWordPredictionArray(outputArray){
  let placeholderArray = [];
  for (const prediction of outputArray){
    let placeholderData = '';
    for (const key of prediction){
      if (noncharacterTokens.includes(Number(key).toString())){
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

function padModelInput(keyArray){
  for (let i = keyArray.length; i < wordLength; i++){
    keyArray.push([wordLengthBufferToken]);
  }
  return keyArray;
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
    
    keyArray = padModelInput(keyArray);
    modelInputsArray.push(keyArray);
  }
  return [modelInputsArray, nonletterLocations, capitalLocation];
}


let finishedTyping;
async function setFinishedTyping(event){
  if (event.key != " "){
    let date = new Date();
    finishedTyping = date.getTime() + typingBuffer;
  }
}

async function changeUserText(event) {
  let date = new Date();
  if ((event.key == " "  || event.code == "Space") && date.getTime() > finishedTyping ){
    let text = event.target.value;
    let [modelInputsArray, nonletterLocations, capitalLocation] = getModelInputs(text);
    browser.runtime.sendMessage({message: 'RunModel', modelInputsArray: modelInputsArray});
    browser.runtime.onMessage.addListener(
      function(request) {
        if (request.message == 'ModelReturn'){
          let modifiedText = modifyText(event.target.value, request.data, nonletterLocations, capitalLocation);
          while (event.target.value.replace(/ /g,'') == text.replace(/ /g,'')){
            event.target.value = modifiedText;
            new Promise(r => setTimeout(r, revertTimer)); //needed because some text fields instantly revert text after being changed
          }
        }
      }
    );
  }
}

function updateContextMenu(event) {
  let selectionStart = event.target.selectionStart;
  let selectionEnd = event.target.selectionEnd;
  let highlightedText = event.target.value.slice(selectionStart, selectionEnd).toLowerCase();
  browser.runtime.sendMessage({message: 'UpdateContextMenu', highlightedText: highlightedText});
}

function contextMenuReviseWord(request) {
  if (request.message == 'ReviseWord'){
    input = document.activeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const inputText = input.value;
    const highlightedText = inputText.substring(start, end);
    let capitalLocation = returnCapitalLocation([highlightedText]);
    let revision = returnCapitalArmenianTextArray([request.revision], capitalLocation).join("");
    console.log(revision);
    const modifiedInputText = inputText.substring(0, start) + revision + inputText.substring(end, inputText.length);
    input.value = modifiedInputText;        
  }
}

function parseLetterKeysFile(letterTokensLocation){
  url = browser.runtime.getURL(letterTokensLocation);
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

function updateSettings(request) {
  wordLength = request.wordLength;
  wordLengthBufferToken = request.wordLengthBufferToken;
  parseLetterKeysFile(request.letterTokensLocation);
  typingBuffer = request.typingBuffer;
  revertTimer = request.revertTimer;
  firstToken = request.firstToken;
  noncharacterTokens = request.noncharacterTokens.split(",");
}

browser.runtime.sendMessage({message: 'checkSwitchToggle'});

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'ActivateListeners'){
    updateSettings(request);
    document.addEventListener("keydown", setFinishedTyping);
    document.addEventListener("keyup", changeUserText);
    document.addEventListener("selectionchange", updateContextMenu);
    browser.runtime.onMessage.addListener(contextMenuReviseWord);
  }
});

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'RemoveListeners'){
    document.removeEventListener("keydown", setFinishedTyping);
    document.removeEventListener("keyup", changeUserText);
    document.removeEventListener("selectionchange", updateContextMenu);
    browser.runtime.onMessage.removeListener(contextMenuReviseWord);
  }
});