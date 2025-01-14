let englishToArmenianDictionary = {};
let possibleEnglishArray = [];

//Settings (set detauls)
let model;
let wordLength;
let letterKeysLocation;
let typingBuffer;
let revertTimer;

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

browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == 'RunModel'){
      runTensorFlowModel(model, request.modelInputsArray).then(data => {
        browser.tabs.sendMessage(sender.tab.id, {message: 'ModelReturn', data: data});
      });
      return true;
    }
  });


browser.runtime.onMessage.addListener(
  function(request) {
    if (request.message == 'UpdateEnglishToArmenianDictionary'){
      englishToArmenianDictionary[request.text] = request.armenianWordPredictionsArray;
    }
  }
);


browser.contextMenus.onClicked.addListener((info, tab) => {
  if (possibleEnglishArray.includes(info.parentMenuItemId)) {
    if (info.menuItemId == info.selectionText) {
      browser.tabs.sendMessage(tab.id, {message: 'ReviseWord', revision: info.parentMenuItemId});
    } else {
      browser.tabs.sendMessage(tab.id, {message: 'ReviseWord', revision: info.menuItemId});
    }
  }
});


  browser.runtime.onMessage.addListener(
    function(request) {
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
    });

browser.runtime.onMessage.addListener(
 async function(request) {
    if (request.message == 'SaveSettings'){
      model = await tf.loadGraphModel(request.modelLocation);
      wordLength = Number(request.wordLength);
      letterKeysLocation = request.letterKeysLocation; //unused
      typingBuffer = Number(request.typingBuffer); //unused
      revertTimer = Number(request.revertTimer); //unused
      //need to send message from context to main
      browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
        browser.tabs.sendMessage(tabs[0].id, { message: "SaveSettings", wordLength: wordLength, letterKeysLocation: letterKeysLocation, typingBuffer: typingBuffer, revertTimer: revertTimer});
      });
    }
  }
);

