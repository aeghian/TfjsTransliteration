#include <iostream>
#include<sstream>
#include <string>
#include <vector>
#include <algorithm>
#include <memory>
#include <torch/script.h>
#include "translitModel.h"

std::vector<double> stringToSingleDimVector(std::string string_input) {
  std::replace(string_input.begin(), string_input.end(), ',', ' ');
  std::replace(string_input.begin(), string_input.end(), '[', ' ');
  std::replace(string_input.begin(), string_input.end(), ']', ' ');
  std::vector<double> vector_output;
  std::string splitter = " ";
  int start = 0;
  int end = 0;
  while (end != -1){
    end = string_input.find(splitter, start);
    double input_element = std::stoi(string_input.substr(start, end - start));
    vector_output.push_back(input_element);
    start = end + splitter.size();
  }
  return vector_output;
}

std::vector<torch::jit::IValue> vectorToTorchTensor(std::vector<double> single_dim_input_vector, std::vector<double> model_input_dimensions_vector_double, std::string tensor_datatype){
  std::vector<long int> model_input_dimensions_vector_long_int(model_input_dimensions_vector_double.begin(), model_input_dimensions_vector_double.end());
  at::ArrayRef<long int> model_input_dimensions_array = model_input_dimensions_vector_long_int;
  std::vector<torch::jit::IValue> input_tensor;
  if (tensor_datatype.find("bool") != std::string::npos){
    input_tensor.push_back(torch::tensor(single_dim_input_vector, at::kBool).reshape(model_input_dimensions_array)); 
  } else if (tensor_datatype.find("int") != std::string::npos) {
    input_tensor.push_back(torch::tensor(single_dim_input_vector, at::kInt).reshape(model_input_dimensions_array));
  } else {
    input_tensor.push_back(torch::tensor(single_dim_input_vector, at::kFloat).reshape(model_input_dimensions_array));
  }
  return input_tensor;
}

at::Tensor loadAndExecuteTorchModel(std::string model_source_location, std::vector<torch::jit::IValue> input_tensor){
  torch::jit::script::Module module;
  module = torch::jit::load(model_source_location); // Deserialize the ScriptModule from a file using torch::jit::load().
  at::Tensor ranked_libtorch_outputs = module.forward(input_tensor).toTensor();
  return ranked_libtorch_outputs;
}

std::string convertTensorToString(at::Tensor target_tensor){
  std::ostringstream stream;
  stream << target_tensor;
  return stream.str();
}

std::string convertTranslit(std::string model_input, std::string model_input_dimensions, std::string model_source_location, std:: string tensor_datatype) {
  std::vector<double> single_dim_input_vector = stringToSingleDimVector(model_input);
  std::vector<double> model_input_dimensions_vector = stringToSingleDimVector(model_input_dimensions);
  std::vector<torch::jit::IValue> input_tensor = vectorToTorchTensor(single_dim_input_vector, model_input_dimensions_vector, tensor_datatype);
  at::Tensor ranked_libtorch_outputs = loadAndExecuteTorchModel(model_source_location, input_tensor);
  std::string ranked_string_tensors = convertTensorToString(ranked_libtorch_outputs);
  return ranked_string_tensors;
}