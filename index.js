const translitModule = require('./build/Release/armenian_translit.node');
const math = require('mathjs');

function CleanOutput(model_output_string){
  const regex = /[^0-9,]/g;
  var model_output_array = model_output_string.split(' ');
  model_output_array.forEach((element, index) => {
    model_output_array[index] = element.replace(regex, ""); //find way to remove / and letters or keep all commas and numbers
  })
  model_output_array = model_output_array.filter(i => i != "");
  return model_output_array;
}

function ShapeModelOutput(cleaned_output){
  const output_tensor_shape = cleaned_output.pop().split(',').map(parseFloat);
  cleaned_output = cleaned_output.map(parseFloat);
  const output_tensor = math.reshape(cleaned_output, output_tensor_shape);
  return output_tensor;
}

exports.Translitorator = function(input_tensor, model_location, tensor_datatype) {
    var model_output_string = translitModule.runCustomModel(input_tensor, math.size(input_tensor), model_location, tensor_datatype);
    const cleaned_output = CleanOutput(model_output_string);
    const output_tensor = ShapeModelOutput(cleaned_output);
    return output_tensor;
  }