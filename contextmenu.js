//probably better way to do this than global vars
let englishToArmenianDictionary = {};
let possibleEnglishArray = [];
const model = await tf.loadGraphModel('tensorflowjs_model_32_max/model.json');

async function runTensorFlowModel(model, input){
  try {
    const result = await model.executeAsync(input);
    return result.array()
  } catch (error) {
    console.error("Error running the model:", error);
    throw error;
  } 
}

browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == 'RunModel'){
      let modelOutputsArray= [];
      for (const inputKeys of request.modelInputsArray){
        const input = tf.tensor(inputKeys,[32,1], 'int32');
        runTensorFlowModel(model, input).then(data => {
          modelOutputsArray.push(data);
        });
      }
      sendResponse({message: modelOutputsArray});
    }
    return true; 
  }
);

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
          if (armenianWordPredictionsArray.includes(request.highlightedText)){
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

