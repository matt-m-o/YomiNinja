#include <napi.h>
#include <windows.h> // ! Platform specific


// Structure to store window information
struct WindowInfo {
  std::wstring title;
  RECT rect;
  HWND hwnd;
};

// Callback function to retrieve window information and store it in the array
BOOL CALLBACK EnumWindowsCallback(HWND hwnd, LPARAM lParam) {

  if (IsWindowVisible(hwnd) && !IsIconic(hwnd)) {

    std::vector<WindowInfo>* windowInfoArray = reinterpret_cast<std::vector<WindowInfo>*>(lParam);

    WindowInfo info;
    // Get the window title as a wide character string
    wchar_t w_title[256];
    GetWindowTextW(hwnd, w_title, sizeof(w_title));

    // Convert the wide character title to a UTF-8 string
    info.title = std::wstring(w_title);

    // Get the window position and size
    GetWindowRect(hwnd, &info.rect);

    // Store the window handle (HWND)
    info.hwnd = hwnd;

    // Store the window info in the array
    windowInfoArray->push_back(info);

  }

  return true; // Continue enumeration
}

class WindowManager : public Napi::Addon< WindowManager > {
    
 public:
  WindowManager( Napi::Env env, Napi::Object exports ) {
	  
    DefineAddon(exports, {      
      InstanceMethod("setForegroundWindow", &WindowManager::setForegroundWindow, napi_enumerable),
      InstanceMethod("getWindowProperties", &WindowManager::getWindowProperties, napi_enumerable),
      InstanceMethod("getAllWindows", &WindowManager::getAllWindows, napi_enumerable)
    });
  }

 private:
  Napi::Value setForegroundWindow( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsNumber()) {
      Napi::TypeError::New(env, "Window handle (HWND) must be provided as an integer.").ThrowAsJavaScriptException();
      return env.Null();
    }

    int hwnd_value = info[0].As<Napi::Number>().Int32Value();
    HWND hwnd = getWindowByHandle(hwnd_value);

    // Bring the window to the foreground
    SetForegroundWindow(hwnd);    

    return Napi::Boolean::From( env, true );
  }

  Napi::Value getWindowProperties( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsNumber()) {
      Napi::TypeError::New(env, "Window handle (HWND) must be provided as an integer.").ThrowAsJavaScriptException();
      return env.Null();
    }

    int hwnd_value = info[0].As<Napi::Number>().Int32Value();
    HWND hwnd = getWindowByHandle(hwnd_value);
    
    if (!IsWindow(hwnd) || !IsWindowVisible(hwnd)) {
      Napi::TypeError::New(env, "Invalid or non-visible window handle.").ThrowAsJavaScriptException();
      return env.Null();
    }

    Napi::Object result = Napi::Object::New(env);

    if (hwnd != NULL) {
      RECT rect;
      GetWindowRect(hwnd, &rect);

      wchar_t w_title[256];
      GetWindowTextW(hwnd, w_title, sizeof(w_title));
      auto const title_ws = std::wstring(w_title);

      auto const utf8Title = titleToUtf8( title_ws );

      result.Set( "title", utf8Title );
      result.Set( "handle", hwnd_value );
      
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

  Napi::Value getAllWindows( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();
    
    // Create an array to store window information
    std::vector<WindowInfo> windowInfoArray;

    // Enumerate all top-level windows and populate the array
    EnumWindows(EnumWindowsCallback, reinterpret_cast<LPARAM>(&windowInfoArray));

    // Create a result array to hold the extracted data
    Napi::Array result = Napi::Array::New(env, windowInfoArray.size());

    for (size_t i = 0; i < windowInfoArray.size(); i++) {
      Napi::Object windowInfo = Napi::Object::New(env);
      
      // Convert the wide character title to a UTF-8 string for JavaScript
      auto const utf8Title = titleToUtf8( windowInfoArray[i].title );
      
      windowInfo.Set("title", Napi::String::New(env, utf8Title));
      windowInfo.Set("handle", Napi::Number::New(env, reinterpret_cast<int64_t>(windowInfoArray[i].hwnd))); // Convert HWND to a number

      auto const rect = windowInfoArray[i].rect;

      Napi::Object size = Napi::Object::New(env);
      size.Set( "width", rect.right - rect.left );
      size.Set( "height", rect.bottom - rect.top );

      Napi::Object position = Napi::Object::New(env);
      position.Set( "x", rect.left );
      position.Set( "y", rect.top );

      windowInfo.Set( "size", size );
      windowInfo.Set( "position", position );

      result.Set(i, windowInfo);
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

  HWND getWindowByHandle( const int handle ) {
    return reinterpret_cast<HWND>(static_cast<intptr_t>(handle));    
  }

  std::string titleToUtf8( const std::wstring &title ) {

    // Convert the wide character title to a UTF-8 string for JavaScript
    int utf8Length = WideCharToMultiByte(CP_UTF8, 0, title.c_str(), -1, nullptr, 0, nullptr, nullptr);
    std::string utf8Title(utf8Length, '\0');
    WideCharToMultiByte(CP_UTF8, 0, title.c_str(), -1, &utf8Title[0], utf8Length, nullptr, nullptr);

    return utf8Title;
  }

};

NODE_API_ADDON(WindowManager)

// ---------------------------------------------------