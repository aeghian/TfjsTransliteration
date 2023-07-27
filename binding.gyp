{
  "targets": [
    {
      "target_name": "armenian_translit",
      "cflags!": [ "-fno-exceptions"],
      "cflags_cc!": ["-fno-rtti", "-fno-exceptions"],
      "sources": [
        "./src/translitModel.cpp",
        "./src/index.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "./libtorch/include",
      ],
      'link_settings': {
        'libraries': [
          '-ltorch',
          '-Wl,-rpath,./libtorch/lib/'
          ],
        'library_dirs': [
          '../libtorch/lib',
          ],
      },
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS']
    }
  ]
}