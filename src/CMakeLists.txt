cmake_minimum_required(VERSION 3.0 FATAL_ERROR)
project(translitModel)

find_package(Torch REQUIRED)

add_executable(translitModel translitModel.cpp)
target_link_libraries(translitModel "${TORCH_LIBRARIES}")
set_property(TARGET translitModel PROPERTY CXX_STANDARD 14)