let englishToArmenianDictionary = {};
let possibleEnglishArray = [];

//Settings (set detauls)
let configurationInputs = {};
let model;
let wordLength;
let wordLengthBufferToken;
let letterTokensLocation;
let typingBuffer;
let revertTimer;
let firstToken;
let noncharacterTokens;

async function runTensorFlowModel(model, modelInputsArray){
  let modelOutputsArray = [];
  for (const inputKeys of modelInputsArray){
    const input = tf.tensor(inputKeys,[wordLength,1], 'int32');
    const result = await model.executeAsync(input);
    const data = await result.array();
    modelOutputsArray.push(data);
  }
  return modelOutputsArray;
}

function runTensorFlowModelListener(request, sender, sendResponse) {
  if (request.message == 'RunModel'){
    runTensorFlowModel(model, request.modelInputsArray).then(data => {
      browser.tabs.sendMessage(sender.tab.id, {message: 'ModelReturn', data: data});
    });
    return true;
  }
}

function updateEnglishToArmenianDictionaryListener(request) {
  if (request.message == 'UpdateEnglishToArmenianDictionary'){
    englishToArmenianDictionary[request.text] = request.armenianWordPredictionsArray;
  }
}

function sendReviseWordMessage(info, tab){
  if (possibleEnglishArray.includes(info.parentMenuItemId)) {
    if (info.menuItemId == info.selectionText) {
      browser.tabs.sendMessage(tab.id, {message: 'ReviseWord', revision: info.parentMenuItemId});
    } else {
      browser.tabs.sendMessage(tab.id, {message: 'ReviseWord', revision: info.menuItemId});
    }
  }
}

function updateContextMenuListener(request) {
  if (request.message == 'UpdateContextMenu'){
    possibleEnglishArray = [];
    for (const [key, armenianWordPredictionsArray] of Object.entries(englishToArmenianDictionary)) {
      if (armenianWordPredictionsArray.includes(request.highlightedText.trim())){
        possibleEnglishArray.push(key);
      }
    }
    if (possibleEnglishArray.length > 0){
      for (const possibleEnglishWord of possibleEnglishArray){
        browser.contextMenus.create({
          id: possibleEnglishWord,
          title: possibleEnglishWord,
        });
        browser.contextMenus.create({
          id: request.highlightedText, //there may be a better id to give this as this one may cause confusion
          title: possibleEnglishWord,
          parentId: possibleEnglishWord,
        });
        for (const revisionOption of englishToArmenianDictionary[possibleEnglishWord]){
          if (revisionOption != request.highlightedText) {
            browser.contextMenus.create({
              id: revisionOption,
              title: revisionOption,
              parentId: possibleEnglishWord,
            });
          }
        }
      }
    } else {
      browser.contextMenus.removeAll();
    }
  }
}

function saveConfigurationsLocalStorage(){
  localStorage.setItem("toggleSwitch", "enabled");
  for (const key in configurationInputs){
    localStorage.setItem(key, configurationInputs[key]);
  }
}

function removeConfigurationsLocalStorage(){
  localStorage.removeItem("toggleSwitch");
  for (const key in configurationInputs){
    localStorage.removeItem(key);
  }
}

async function updateSettings() {
  model = await tf.loadGraphModel(localStorage.getItem('modelLocation'));
  wordLength = Number(localStorage.getItem('wordLength'));
  wordLengthBufferToken = Number(localStorage.getItem('wordLengthBufferToken')); //unused
  letterTokensLocation = localStorage.getItem('letterTokensLocation'); //unused
  typingBuffer = Number(localStorage.getItem('typingBuffer')); //unused
  revertTimer = Number(localStorage.getItem('revertTimer')); //unused
  firstToken = Number(localStorage.getItem('firstToken')); //unused
  noncharacterTokens = localStorage.getItem('noncharacterTokens'); //unused
  //need to send message from context to main
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { message: "ActivateListeners", wordLength: wordLength, wordLengthBufferToken: wordLengthBufferToken, letterTokensLocation: letterTokensLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken, noncharacterTokens: noncharacterTokens});
  });
}

function addContextMenuListeners(){
  browser.runtime.onMessage.addListener(runTensorFlowModelListener);
  browser.runtime.onMessage.addListener(updateEnglishToArmenianDictionaryListener);
  browser.contextMenus.onClicked.addListener(sendReviseWordMessage);
  browser.runtime.onMessage.addListener(updateContextMenuListener);
}

function removeAllListeners(){
  browser.runtime.onMessage.removeListener(runTensorFlowModelListener);
  browser.runtime.onMessage.removeListener(updateEnglishToArmenianDictionaryListener);
  browser.contextMenus.onClicked.removeListener(sendReviseWordMessage);
  browser.runtime.onMessage.removeListener(updateContextMenuListener);
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { message: "RemoveListeners"});
  });
}

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'checkSwitchToggle'){
    if (localStorage.getItem('toggleSwitch') == 'enabled'){
      updateSettings();
      addContextMenuListeners();
    } else {
      removeConfigurationsLocalStorage();
      removeAllListeners();
    }
  }
});

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'ActivateListeners'){
    configurationInputs = request.configurationInputs;
    saveConfigurationsLocalStorage();
    updateSettings();
    addContextMenuListeners();
  }
});

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'RemoveListeners'){
    configurationInputs = request.configurationInputs;
    removeConfigurationsLocalStorage();
    removeAllListeners();
  }
});

