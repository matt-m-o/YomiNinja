#include <napi.h>
#include <windows.h> // ! Platform specific
#include <dwmapi.h>

#pragma comment(lib, "Dwmapi.lib") // Link with Dwmapi.lib


struct Size {
  int width;
  int height;
};
struct Position {
  int x;
  int y;
};


struct WindowProps {
  int handle;
  std::string title;
  Size size;
  Position position;
};

std::string titleToUtf8( const std::wstring &title ) {

  // Convert the wide character title to a UTF-8 string for JavaScript
  int utf8Length = WideCharToMultiByte(CP_UTF8, 0, title.c_str(), -1, nullptr, 0, nullptr, nullptr);
  std::string utf8Title(utf8Length, '\0');
  WideCharToMultiByte(CP_UTF8, 0, title.c_str(), -1, &utf8Title[0], utf8Length, nullptr, nullptr);

  return utf8Title;
}

WindowProps getWindowProps( HWND &hwnd ) {

  RECT rect;
  DwmGetWindowAttribute(hwnd, DWMWA_EXTENDED_FRAME_BOUNDS, &rect, sizeof(RECT));

  wchar_t w_title[256];
  GetWindowTextW(hwnd, w_title, sizeof(w_title));
  auto const title_ws = std::wstring(w_title);

  auto const utf8Title = titleToUtf8( title_ws );

  auto const hwnd_value = reinterpret_cast<int64_t>(hwnd);

  WindowProps props;
  props.title = utf8Title;
  props.handle = hwnd_value;

  props.size.width = rect.right - rect.left;
  props.size.height = rect.bottom - rect.top;

  props.position.x = rect.left;
  props.position.y = rect.top;    

  return props;
}

// Callback function to retrieve window information and store it in the array
BOOL CALLBACK EnumWindowsCallback(HWND hwnd, LPARAM lParam) {

  if (IsWindowVisible(hwnd) && !IsIconic(hwnd)) {

    std::vector<WindowProps>* windowPropsArray = reinterpret_cast<std::vector<WindowProps>*>(lParam);

    WindowProps props = getWindowProps(hwnd);
    
    windowPropsArray->push_back(props);
  }

  return true; // Continue enumeration
}


struct TaskbarProps {
  Size size;
  Position position;
  bool auto_hide;
};

TaskbarProps getTaskbarInfo() {
  APPBARDATA abd;
  abd.cbSize = sizeof(APPBARDATA);

  // Send the message to get taskbar information
  UINT taskbar_state = (UINT)SHAppBarMessage(ABM_GETSTATE, &abd);
  bool auto_hide = (taskbar_state & ABS_AUTOHIDE) != 0;

  if (auto_hide) {
    // If the taskbar is set to auto-hide, we need to temporarily unhide it
    SHAppBarMessage(ABM_ACTIVATE, &abd);
    // Give it some time to unhide
    Sleep(1000);
  }

  // Get the taskbar information
  SHAppBarMessage(ABM_GETTASKBARPOS, &abd);

  TaskbarProps taskbar_props;
  taskbar_props.position.x = abd.rc.left;
  taskbar_props.position.y = abd.rc.top;
  taskbar_props.size.width = abd.rc.right - abd.rc.left;
  taskbar_props.size.height = abd.rc.bottom - abd.rc.top;
  taskbar_props.auto_hide = auto_hide;

  if (auto_hide) {
    // If the taskbar was set to auto-hide, hide it again
    SHAppBarMessage(ABM_ACTIVATE, &abd);
  }

  return taskbar_props;
}

class WindowManager : public Napi::Addon< WindowManager > {
    
 public:
  WindowManager( Napi::Env env, Napi::Object exports ) {
	  
    DefineAddon(exports, {      
      InstanceMethod("setForegroundWindow", &WindowManager::setForegroundWindow, napi_enumerable),
      InstanceMethod("getWindowProperties", &WindowManager::getWindowProperties, napi_enumerable),
      InstanceMethod("getAllWindows", &WindowManager::getAllWindows, napi_enumerable),
      InstanceMethod("getTaskBarProps", &WindowManager::getTaskBarProps, napi_enumerable),      
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

    Napi::Object window = Napi::Object::New(env);

    if (hwnd != NULL) {

      auto const props = getWindowProps(hwnd);

      window.Set( "title", props.title );
      window.Set( "handle", props.handle );
      
      Napi::Object size = Napi::Object::New(env);      
      size.Set( "width", props.size.width );
      size.Set( "height", props.size.height );

      Napi::Object position = Napi::Object::New(env);
      position.Set( "x", props.position.x );
      position.Set( "y", props.position.y );
      
      window.Set( "size", size );
      window.Set( "position", position );
    }

    return window;
  }

  Napi::Value getAllWindows( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();
    
    // Create an array to store window information
    std::vector<WindowProps> windowPropsArray;

    // Enumerate all top-level windows and populate the array
    EnumWindows(EnumWindowsCallback, reinterpret_cast<LPARAM>(&windowPropsArray));

    // Create a result array to hold the extracted data
    Napi::Array results = Napi::Array::New(env, windowPropsArray.size());

    for (size_t i = 0; i < windowPropsArray.size(); i++) {

      const auto props = windowPropsArray[i];
      
      Napi::Object window = Napi::Object::New(env);
      
      window.Set("title", props.title);
      window.Set("handle", props.handle);
      

      Napi::Object size = Napi::Object::New(env);
      size.Set( "width", props.size.width );
      size.Set( "height", props.size.height );

      Napi::Object position = Napi::Object::New(env);
      position.Set( "x", props.position.x );
      position.Set( "y", props.position.y );

      window.Set( "size", size );
      window.Set( "position", position );

      results.Set(i, window);
    }

    return results;
  }

  Napi::Value getTaskBarProps( const Napi::CallbackInfo& info ) {

    Napi::Env env = info.Env();

    TaskbarProps props = getTaskbarInfo();

    Napi::Object size = Napi::Object::New(env);  
    size.Set("width", props.size.width);
    size.Set("height", props.size.height);

    Napi::Object position = Napi::Object::New(env);
    position.Set("x", props.position.x);
    position.Set("y", props.position.y);

    Napi::Object taskbar = Napi::Object::New(env);
    taskbar.Set("size", size);
    taskbar.Set("position", position);
    taskbar.Set("auto_hide", props.auto_hide);

    return taskbar;
  }

private:

  HWND getWindowByTitle( const std::string window_title_str ) {

    std::wstring window_title_wstr = std::wstring( window_title_str.begin(), window_title_str.end() );

    const wchar_t* window_title_wcstr = window_title_wstr.c_str();
    
    // Find the window by its title
    return FindWindowW( NULL, window_title_wcstr );
  }

  HWND getWindowByHandle( const int handle ) {
    return reinterpret_cast<HWND>(static_cast<intptr_t>(handle));    
  }

};

NODE_API_ADDON(WindowManager)

// ---------------------------------------------------