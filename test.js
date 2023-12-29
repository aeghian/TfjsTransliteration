const translitModuleEntry = require('./index.js');
var armenian_letter_keys = {
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
var english_letter_keys = {
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

var input_word = 'sharagan';
var model_location = '/home/armbool/Documents/armenian_custom_node_module/src/scripted_model_3_31_2023.pt';
var input_tensor = [];
for (letter of input_word){
    input_tensor.push([english_letter_keys[letter]]);
}
input_tensor.push(['2']); //a 2 is needed as a starter token for this model
input_tensor = input_tensor.reverse(); //input needs to be reversed because model expects inputs to be backwards
const ranked_word_keys = translitModuleEntry.Translitorator(input_tensor, model_location, "int");
const ranked_word_outputs = [];
var word_rank = 0;
for (word_keys of ranked_word_keys){
    var output_word ='';
    for (key of word_keys){
        output_word = output_word.concat(armenian_letter_keys[key]);
    }
    ranked_word_outputs[word_rank] = output_word;
    word_rank += 1;
}
console.log('INPUT: ', input_word);
console.log('OUTPUT: ', ranked_word_outputs);
