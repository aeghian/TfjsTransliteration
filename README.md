**INTRODUCTION**

The goal of this project is to create a browser addon with the ability to transliterate Armenian words written in English letters to their Armenian counterparts. The current model is designed for Western Armenian pronunciations. This process is also referred to as phoneme to grapheme conversion since phonetic representations (phonemes) are converted to printed symbols (graphemes). Additionally, this browser addon must make all inferences locally since text data has the potential to be sensitive, and an ideal solution would not automatically send all data to an unknown server. The current state of this project is a fully functioning Firefox-based protype capable of automatically transliterating Armenian words spelled in English letter phonetics with a tensorflow model. The protype also includes a configurations pane to enable/disable the tool or replace the tensorflow model used. Software development is an ongoing process requiring constant updates, and the current development effort of this project has stopped since a working protype has been created. That being said, if there is  value in this type of tool, people are invited to improve the project or contact the author (https://www.linkedin.com/in/armen-eghian-6979b01a1/) for additional information. Below additional information around the, project goal, instructions for use, development process/quirks, possible feature updates, and file dscriptions is included below.

**INSTRUCTIONS FOR USE**

The tool can be used by downloading the addon folder, going to "about:debugging#/runtime/this-firefox" in a firefox browser, clicking "Load Temporary Add-on...", and selecting the manifest.json file. The current tool has been designed for Firefox without full spectrum compatibility in mind. The addon can be accessed in the upper right corner of the browser to enable/disable or configure. Unless a custom model is being used, all configurations should be left as default. The "Enabled" check box controls if the tool is actively updating the current input field being modified. The tool has been designed with moderate flexibity in mind allowing users to create their own models to update the current ability or expand usage to new languages. To update the model configurations the following fields can be modified:
- Model: This field will select the tensorflow model location used for inference. The current program is designed for the tensorflow SaveModel format. Ideally, new models will output an ordered list of possible options starting with the most likely choice. People looking to change the model should consider how it is implemented in the current addon. The current model requires the input to be reversed so this is done within the current addon code.
- Max Word Length: This field sets the maximum word length accepted by the model. It is needed because the current model requires a fixed input size which limits the maximum length of a word.
- Word Length Buffer Token: This field sets the token used to create buffers for the model input.  
- Letter Tokens Location: This field sets the location of the text file containing the token mappings for all characters used. Please follow the format used in the current file "letterKeys.txt." This is "output token":"output grapheme" on new lines until complete then "input phoneme":"input token." No characters to denote the separate sets of keys are needed as long as this format is followed.
- Typing Buffer (ms): The program is triggered automatically when enabled as the user hits space bar. Since constant input field changes would be frustrating to deal with, a timing buffer was added to ensure the model only runs after the user stops typing for a specified period of time. Adjusting this field will impact how long the program waits before reacting to a space.
- Text Revert Timer (ms): Some online input fields automatically revert javascript text changes. This timer waits for a prespecified time to see if this reversion has occured. If it has, the proper phonemes will be placed within the unput field again. Adjusting this field will change the time window in which the program checks to see if the new phonemes have been reverted.
- First Token: The current model (and possibly future models) require a starting token. If a new model is added, this figure may need to be changed to adjust to any new token system.
- Noncharacter Tokens: Some tokens may be needed for the model but should not be displayed to the end user since they are not relavent for the actual word. These tokens may be for padding or indicate the start of a value. If new models added require these tokens, list the token ids with commas separating them like the current input in this field.

The tool works by detecting the current input field and modifying any words with characters matching the input token options. The tool activates automatically once enabled. After the user waits the preconfigured window set by Typing Buffer and hits space bar, the program will convert all matching text. Additionally, words that convert incorrectly can be highlighted and right clicked on to show a menu with additional options. This menu can be seen by hovering over the matching word in the right click menu. From here the user can select the correction including reverting the word to its english characters. 

**DEVELOPMENT PROCESS/QUIRKS**

Developing this add-on was the combined effort of two projects. First, a model was trained to accurately predict the correct Armenian word given the word was typed phonetically in English letters. Word pronunciations are based on the Western Armenian Dialect. For more details about this model please refer to the separate github project detailing this development process (https://github.com/aeghian/EnglishToArmenianPhonemeToGraphemeModel). The second part of the process was creating a javascript add-on capable of using this model in a real world context instead of simply a colab notebook or one off script. Overall, the tools and techniques used were relatively standard, but a few issues related to asynchronous code resulted in abnormal design.

These quirks are related to locally stored variables and message responses. Ideally, the storage API would be enabled since global variables could be controlled across files, but the asynchronous nature of this API kept resulting in errors. Although promises provided the correct results they would not consistenly resolve properly. This issue was resolved by simply using the localstorage API and sending a message between files for the needed variables. Message responses also presented challenges when trying to return an asynchronous response. In this instance, the asynchronous function would never resolve before the response was sent which resulted in the incorrect result being sent as a response. This issue was resolved by using another sendmessage within the message listener instead of sendresonse.

**FEATURE UPDATES**

The current add-on is simply a prototype meant to show how a tool like this could work and provide a basis for others looking to make a similar program. Development has effectively stopped on this project, but if others find use in this tool the effort could be renewed. While the tool is currently in a stable and working place, there are a handful of updates which could improve the stability and functionality. Some of the following additions are likely the next best modifications to focus on:
- Using the asynchronous storage API to manage variables instead of locaclStorage and messaging
- Using proper responses instead of sending a message within a message listener
- Creating additional models (e.g., Eastern Armenian pronunciations or Japanese character systems)
- Updating the configuration menu to have a more modern look
- Increasing the speed of the model or other javascript functions
- Adding visual indicators to show when the addon is turning on and when words are being converted (transforming a single word can take a few seconds, and a large group of words can take minutes)

**FILE EXPLANATIONS**

Below is a description of each folder or individual file:
- icons: This folder contains the icons for the program.
- node_modules: This folder contains the necessary modules to run Tensorflowjs.
- tensorflowjs_model_32_max: This folder contains the Tensorflowjs model created to transofrm English phonemes to Armenian graphemes. This model is designed for 32 character inputs.
- background.html: This file runs contextmenu.js while also using the Tensorflowjs module.
- contextmenu.js: This file runs the Tensorflowjs model and controls modifications to the contextmenu.
- letterKeys.txt: This file contains the token list and keys used by the model.
- main.js: This file modifies input field text and listens for input.
- manifest.json: This file is used to run the addon and contains meta information related to the program.
- package-lock.json: This is a version locking file automatically created by npm.
- package.json: This file provides project metadata and dependancy management information.
- settings.html: This file provides the layout for the configuration and settings menu.
- settings.js: This file handles communication between the settings menu and other javascript files. It also communicates if the program should be enabled or disabled.

