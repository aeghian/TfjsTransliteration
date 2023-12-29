//probably better way to do this than global vars
let englishToArmenianDictionary = {};
let possibleEnglishArray = [];

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

