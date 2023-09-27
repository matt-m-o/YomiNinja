#include <napi.h>
#include <windows.h> // ! Platform specific

class WindowManager : public Napi::Addon< WindowManager > {
    
 public:
  WindowManager( Napi::Env env, Napi::Object exports ) {
	  
    DefineAddon(exports, {      
      InstanceMethod("setForegroundWindow", &WindowManager::setForegroundWindow, napi_enumerable),
      InstanceMethod("getWindowProperties", &WindowManager::getWindowProperties, napi_enumerable)
    });
  }

 private:
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
    
    // Find the window by its title
    HWND hwnd = getWindow( window_title_str );

    // Bring the window to the foreground
    SetForegroundWindow(hwnd);
	  
    return Napi::String::New(info.Env(), window_title_str);
  }

  Napi::Value getWindowProperties( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();

    // Get the string parameter from the first argument
    Napi::String window_title = info[0].As<Napi::String>();
    HWND hwnd = getWindow( window_title.ToString() ); // Replace "Window Title" with the title of the third-party application's window


    Napi::Object result = Napi::Object::New(env);

    if (hwnd != NULL) {
      RECT rect;
      GetWindowRect(hwnd, &rect);
      
      Napi::Object size = Napi::Object::New(env);
      size.Set( "width", rect.right - rect.left );
      size.Set( "height", rect.bottom - rect.top );

      Napi::Object position = Napi::Object::New(env);
      position.Set( "x", rect.left );
      position.Set( "y", rect.top );

      result.Set( "size", size );
      result.Set( "position", position );
    }

    return result;
  }

private:
  HWND getWindow( const std::string window_title_str ) {

    std::wstring window_title_wstr = std::wstring( window_title_str.begin(), window_title_str.end() );

    const wchar_t* window_title_wcstr = window_title_wstr.c_str();    
    
    // Find the window by its title
    return FindWindowW( NULL, window_title_wcstr );
  }
};

NODE_API_ADDON(WindowManager)

// ---------------------------------------------------