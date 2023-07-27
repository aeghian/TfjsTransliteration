#include <napi.h>
#include <string>
#include <vector>
#include <torch/script.h>
#include "translitModel.h"
#include <typeinfo>

//native c++ function that is assigned to 'runCustomModel' property on `exports` object
Napi::String runCustomModel(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // call 'convertTranslit' function from 'translitModel.cpp' file
    std::string model_input = (std::string) info[0].ToString();
    std::string model_input_dimensions = (std::string) info[1].ToString();
    std::string model_source_location = (std::string) info[2].ToString();
    std::string tensor_datatype = (std::string) info[3].ToString();
    std::string result = convertTranslit(model_input, model_input_dimensions, model_source_location, tensor_datatype);

    // return new 'Napi::String' value
    return Napi::String::New(env, result);
}

//callback method when module is required with Node.js
Napi::Object Init(Napi::Env env, Napi::Object exports) {

    //set a key on 'exports' object
    exports.Set(
        Napi::String::New(env, "runCustomModel"), // property name => "runCustomModel"
        Napi::Function::New(env, runCustomModel) // property value => 'runCustomModel' function

    );

    //return 'exports' object (always)
    return exports;
}

// register 'armenian_translit' module which calls 'Init' method
NODE_API_MODULE(armenian_translit, Init)