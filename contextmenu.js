let englishToArmenianDictionary = {};
let possibleEnglishArray = [];

//Settings (set detauls)
let model;
let wordLength;
let letterKeysLocation;
let typingBuffer;
let revertTimer;
let firstToken;

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

function saveConfigurationsLocalStorage(request){
  localStorage.setItem("toggleSwitch", "enabled");
  localStorage.setItem("modelLocation", request.modelLocation);
  localStorage.setItem("wordLength", request.wordLength);
  localStorage.setItem("letterKeysLocation", request.letterKeysLocation);
  localStorage.setItem("typingBuffer", request.typingBuffer);
  localStorage.setItem("revertTimer", request.revertTimer);
  localStorage.setItem("firstToken", request.firstToken);
}

function removeConfigurationsLocalStorage(){
  localStorage.removeItem("toggleSwitch");
  localStorage.removeItem("modelLocation");
  localStorage.removeItem("wordLength");
  localStorage.removeItem("letterKeysLocation");
  localStorage.removeItem("typingBuffer");
  localStorage.removeItem("revertTimer");
  localStorage.removeItem("firstToken");
}

async function updateSettings() {
  model = await tf.loadGraphModel(localStorage.getItem('modelLocation'));
  wordLength = Number(localStorage.getItem('wordLength'));
  letterKeysLocation = localStorage.getItem('letterKeysLocation'); //unused
  typingBuffer = Number(localStorage.getItem('typingBuffer')); //unused
  revertTimer = Number(localStorage.getItem('revertTimer')); //unused
  firstToken = Number(localStorage.getItem('firstToken')); //unused
  //need to send message from context to main
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, { message: "ActivateListeners", wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer, firstToken: firstToken});
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
    saveConfigurationsLocalStorage(request);
    updateSettings();
    addContextMenuListeners();
  }
});

browser.runtime.onMessage.addListener(function(request){
  if (request.message == 'RemoveListeners'){
    removeConfigurationsLocalStorage();
    removeAllListeners();
  }
});

