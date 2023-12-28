{
  "targets": [
    {
      "target_name": "window_manager_win32",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
      "conditions": [
        ["OS == 'win'", {
          "sources": [ "./gyp_modules/window_management/win32/window_manager_win32.cc" ],
          "libraries": [ "-lDwmapi" ],
        }]
      ]
    }
  ]
}
