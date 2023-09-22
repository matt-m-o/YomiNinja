#include <napi.h>
#include <windows.h> // ! Platform specific

class WindowManager : public Napi::Addon< WindowManager > {
    
 public:
  WindowManager( Napi::Env env, Napi::Object exports ) {
	  
    DefineAddon(exports, {
      InstanceMethod("hello", &WindowManager::Hello, napi_enumerable),
      InstanceMethod("setForegroundWindow", &WindowManager::setForegroundWindow, napi_enumerable)
    });
  }

 private:
  Napi::Value Hello(const Napi::CallbackInfo& info) {
	
    const wchar_t* windowTitle = L"Calculator"; // Notice the L prefix for wide characters
    
    // Find the window by its title
    HWND hwnd = FindWindowW(NULL, windowTitle);

    // Bring the window to the foreground
    SetForegroundWindow(hwnd);
    
    Napi::Env env = info.Env();
    
    // Check if at least one argument is provided
    if (info.Length() < 1 || !info[0].IsString()) {
      Napi::TypeError::New(env, "String argument expected").ThrowAsJavaScriptException();
      return env.Null();
    }

    // Get the string parameter from the first argument
    Napi::String name = info[0].As<Napi::String>();
    std::string nameStr = name.ToString();

    // Create the greeting message
    std::string message = "Hello, " + nameStr;

	  
    return Napi::String::New(info.Env(), message);
  }

  Napi::Value setForegroundWindow( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();
    
    // Check if at least one argument is provided
    if (info.Length() < 1 || !info[0].IsString()) {
      Napi::TypeError::New(env, "String argument expected").ThrowAsJavaScriptException();
      return env.Null();
    }

    // Get the string parameter from the first argument
    Napi::String window_title = info[0].As<Napi::String>();
    std::string window_title_str = window_title.ToString();

    std::wstring window_title_wstr = std::wstring( window_title_str.begin(), window_title_str.end() );

    const wchar_t* window_title_wcstr = window_title_wstr.c_str();    
    
    // Find the window by its title
    HWND hwnd = FindWindowW( NULL, window_title_wcstr );

    // Bring the window to the foreground
    SetForegroundWindow(hwnd);
	  
    return Napi::String::New(info.Env(), window_title_str);
  }
};

NODE_API_ADDON(WindowManager)

// ---------------------------------------------------