# YomiNinja

YomiNinja is an application for extracting text from any type of visual content and is designed with language learners in mind.

## Demonstration with [10ten](https://github.com/birchill/10ten-ja-reader)

https://github.com/matt-m-o/YomiNinja/assets/25914763/2bb02444-fc41-44e7-bc9e-c66d0d40d7b3

## Demonstration with [Yomichan](https://github.com/FooSoft/yomichan)

https://github.com/matt-m-o/YomiNinja/assets/25914763/1868db47-5b50-44c1-a5b3-694d46c69e28

The extracted text overlays the original content, allowing for quick look-ups with pop-up dictionaries like [10ten](https://github.com/birchill/10ten-ja-reader), [Yomitan](https://github.com/themoeway/yomitan) and [Inkah](https://chromewebstore.google.com/detail/inkah-chinese-korean-pop/pcgmedbmchghfgikplcimdmfldfnecec). <br>
It minimizes distractions and simplifies the process of looking up unfamiliar words. <br>
This is especially beneficial for language learners who study through videos or games.

YomiNinja is perfect for:

- Language learners who study through games, videos, or any other visual content.
- Anyone who values a distraction-free, efficient way to look up unfamiliar words.
- Users looking for seamless text extraction and workflow improvement.

Check out this [video](https://www.youtube.com/watch?v=sF1isrgjwZI) by [ganqqwerty](https://github.com/ganqqwerty) to get started quickly and easily!

## Dictionary Extensions
YomiNinja supports web browser dictionary extensions, enabling convenient word lookup without external applications. <br>
While not all extensions are currently installable, [10Ten](https://github.com/birchill/10ten-ja-reader) and [Yomitan](https://github.com/themoeway/yomitan) have been successfully tested and are included as pre-installed options for simplified installation. <br>


## Installation
### Windows
You need Windows 10 or 11 and [VCRedist](https://www.techpowerup.com/download/visual-c-redistributable-runtime-package-all-in-one/) installed. <br>
If you are using the N or KN edition of Windows 10 or 11, please be aware that you will also need to install the [Media Feature Pack](https://support.microsoft.com/en-us/topic/media-feature-pack-list-for-windows-n-editions-c1c6fffa-d052-8338-7a79-a4bb980a700a). This is necessary to ensure that all the required DLLs are installed.

[Download](https://github.com/matt-m-o/YomiNinja/releases) and install the latest YomiNinja release. <br>

### Linux
YomiNinja currently offers support for distros using the X11 window system. Wayland is not supported due to its limitations with global shortcuts and window positioning.
1. Install [xdotool](https://github.com/jordansissel/xdotool?tab=readme-ov-file#installation).
2. Download the YomiNinja package corresponding to your distribution.
3. Install the package. For example, on Debian-based distributions:

    ```commandline
    sudo dpkg -i yomininja-e_x.x.x_amd64.deb
    ```
### macOS
[Download](https://github.com/matt-m-o/YomiNinja/releases) and install the latest YomiNinja release (.dmg file). <br>

Notes:
- The list of available languages for the Apple Vision OCR engine depends on your macOS version.
- Manga OCR will be supported in version 0.8 and above.
- Native support for ARM64 (Apple Silicon) is coming in version 0.8 and above.



## Current features

- Text extraction from the entire screen or specific window.
- Built-in pop-up dictionaries.
- Chrome Extensions (partial support).
- OCR Templates (predefined text areas, optimizing OCR efficiency).
- Auto OCR.
- Text to speech.
- WebSocket for Texthookers.


## Planned Features

- Text extraction from snip.
- Anki integration.
- History.
- Text translation.
- Support for more OCR engines.
- Support for more TTS voices.


## Supported Languages

- English
- Japanese
- Chinese
- Korean

## Supported OCR Engines

- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR)
- [Google Cloud Vision](https://cloud.google.com/vision/docs)
- [Google Lens](https://lens.google/intl/pt-BR/#translate)

## Building
1. Clone the git repository
    ```commandline
    git clone https://github.com/matt-m-o/YomiNinja.git && cd YomiNinja
    ```

2. Build OCR services:
    ```commandline
    cd ./ocr_services/py_ocr_service
    ./gen_grpc_service.bat
    ./build.bat
    cd ../..
    ./copy_py_ocr_service_build.bat
    ```
   
3. Based on your platform, download and extract the latest build of [PPOCR-Inference-Service](https://github.com/matt-m-o/PPOCR-Inference-Service/releases) into the appropriate directory:

    - Windows: `./bin/win32/ppocr`
    - Linux: `./bin/linux/ppocr`

4. (optional) Download [10ten v1.15.1](https://github.com/birchill/10ten-ja-reader/releases/tag/v1.15.1) for Chrome, and place the zip file into the following directory:
       
       ./yomininja-e/extensions/

5. Install node modules. Note: `--force` is used due to outdated react-furi peerDependencies, but it should function normally.
    ```commandline
    cd yomininja-e && npm install --force
    ```
6. Generate gRPC Protobuf types
    ```commandline
    npm run grpc-types
    ```
7. Build
    ```commandline
    npm run dist
    ```


## Inspired by:
- [Yomichan](https://github.com/FooSoft/yomichan)
- [mokuro](https://github.com/kha-white/mokuro)
- [kanjitomo-ocr](https://github.com/sakarika/kanjitomo-ocr)
