# YomiNinja

YomiNinja is an application for extracting text from any type of visual content and is designed with language learners in mind.


## Demonstration with [10ten](https://github.com/birchill/10ten-ja-reader)

https://github.com/matt-m-o/YomiNinja/assets/25914763/2bb02444-fc41-44e7-bc9e-c66d0d40d7b3

## Demonstration with [Yomichan](https://github.com/FooSoft/yomichan)

https://github.com/matt-m-o/YomiNinja/assets/25914763/1868db47-5b50-44c1-a5b3-694d46c69e28


The extracted text overlays the original content, allowing for quick look-ups with pop-up dictionaries like [10ten](https://github.com/birchill/10ten-ja-reader) and [Yomichan](https://github.com/FooSoft/yomichan). <br>
It minimizes distractions and simplifies the process of looking up unfamiliar words. <br>
This is especially beneficial for language learners who study through videos or games.  


YomiNinja is perfect for:

- Language learners who study through games, videos, or any other visual content.
- Anyone who values a distraction-free, efficient way to look up unfamiliar words.
- Users looking for seamless text extraction and workflow improvement.

## Dictionary Extensions
YomiNinja supports web browser dictionary extensions, enabling convenient word lookup without external applications. <br>
While not all extensions are currently installable, 10Ten (aka Rikaichamp) has been successfully tested and will be included as a pre-installed option for simplified installation. <br>
Please note that, at present, Yomichan is not installable and requires web browsers to function.

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


### Install Yomichan or Yomitan (optional):
1. Install [Yomichan](https://foosoft.net/projects/yomichan/)/[Yomitan](https://foosoft.net/projects/yomichan/) on your browser of preference.
2. Go to the Yomichan/Yomitan settings.
3. Find and enable the clipboard monitoring option.

   - Chromium: `Enable background clipboard text monitoring`
   - Firefox: `Enable native popups when copying Japanese text`
4. Go to the YomiNinja settings and enable ```Show window on text copy```
5. Set the `Window title` to "Yomichan Search" or "Yomitan Search".


## Current features

- Text extraction from the entire screen or specific window.
- Built-in pop-up dictionaries.
- Chrome Extensions (partial support).
- OCR Templates (predefined text areas, optimizing OCR efficiency).
- WebSocket for Texthookers.


## Planned Features

- Auto OCR.
- Text extraction from snip.
- Anki integration.
- History.
- Text translation.
- Support for more OCR engines.


## Supported Languages

YomiNinja currently supports text extraction in:

- English
- Japanese
- Chinese
- Korean

Currently, PaddleOCR is used for text extraction, which generally produces very good results in languages such as Chinese or Japanese.
It supports dozens of languages, that will be integrated into this application in the future. <br>

## Building
1. Clone the git repository
    ```commandline
    git clone https://github.com/matt-m-o/YomiNinja.git && cd YomiNinja
    ```
2. Based on your platform, download and extract the latest build of [PPOCR-Inference-Service](https://github.com/matt-m-o/PPOCR-Inference-Service/releases) into the appropriate directory:

    - Windows: `./bin/win32/ppocr`
    - Linux: `./bin/linux/ppocr`

3. (optional) Download [10ten v1.15.1](https://github.com/birchill/10ten-ja-reader/releases/tag/v1.15.1) for Chrome, extract the contents, and place them into the following directory:
       
       ./yomininja-e/extensions/10ten

4. Install node modules. Note: `--force` is used due to outdated react-furi peerDependencies, but it should function normally.
    ```commandline
    cd yomininja-e && npm install --force
    ```
5. Generate gRPC Protobuf types
    ```commandline
    npm run grpc-types
    ```
6. Build the distribution
    ```commandline
    npm run dist
    ```

   
## OCR Engines

- [PPOCR-Inference-Service](https://github.com/matt-m-o/PPOCR-Inference-Service)

## Inspired by:
- [Yomichan](https://github.com/FooSoft/yomichan)
- [mokuro](https://github.com/kha-white/mokuro)
- [kanjitomo-ocr](https://github.com/sakarika/kanjitomo-ocr)
