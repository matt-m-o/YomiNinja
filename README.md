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

### Dictionary Extensions
YomiNinja supports web browser dictionary extensions, enabling convenient word lookup without external applications. <br>
While not all extensions are currently installable, 10Ten (aka Rikaichamp) has been successfully tested and will be included as a pre-installed option for simplified installation. <br>
Please note that, at present, Yomichan is not installable and requires web browsers to function.

### Installation

You need Windows 10 or 11 and [VCRedist](https://www.techpowerup.com/download/visual-c-redistributable-runtime-package-all-in-one/) installed. <br>
Linux support is on the way.

[Download](https://github.com/matt-m-o/YomiNinja/releases) and install the latest release. <br>

#### (optional) Install Yomichan:
1. Install [Yomichan](https://foosoft.net/projects/yomichan/) on your browser of preference.
2. Go to the Yomichan settings.
3. Find and enable the clipboard monitoring option.

   - Chromium: `Enable background clipboard text monitoring`
   - Firefox: `Enable native popups when copying Japanese text`
4. Go to the YomiNinja settings and enable ```Show Yomichan window on text copy```


### Current features

- Text extraction from the entire screen or specific window.
- Built-in pop-up dictionaries.
- WebSocket for Texthookers.


### Planned Features

- Text extraction from snip.
- Text extraction from custom templates (define extraction patterns for specific use cases).
- Automatic refresh text extraction.
- Anki integration.
- History.
- Text translation.
- Support for more OCR engines.


### Supported Languages

YomiNinja currently supports text extraction in:

- English
- Japanese
- Chinese
- Korean

Currently, PaddleOCR is used for text extraction, which generally produces very good results in Asian languages such as Chinese or Japanese.
It supports dozens of languages, that will be integrated into this application in the future. <br>

### Building
1. Clone git repository
```commandline
git clone https://github.com/matt-m-o/YomiNinja.git && cd YomiNinja
```
2. Download and extract the latest build of [PPOCR-Inference-Service](https://github.com/matt-m-o/PPOCR-Inference-Service) inside the "./bin/ppocr" directory.
3. Install node modules
```commandline
cd yomininja-e && npm install
```
4. Generate gRPC Protobuf types
```commandline
npm run grpc-types
```
5. Build distribution
```commandline
npm run dist
```
   
### OCR Engines

- [PPOCR-Inference-Service](https://github.com/matt-m-o/PPOCR-Inference-Service)

### Inspired by:
- [Yomichan](https://github.com/FooSoft/yomichan)
- [Manga OCR](https://github.com/kha-white/manga-ocr)
- [kanjitomo-ocr](https://github.com/sakarika/kanjitomo-ocr)
