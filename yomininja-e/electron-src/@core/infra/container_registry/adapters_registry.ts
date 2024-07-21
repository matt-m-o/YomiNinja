import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { PpOcrAdapter } from '../ocr/ppocr.adapter/ppocr.adapter';
import { SharpImageProcessingAdapter } from "../sharp_image_process.adapter/sharp_image_process.adapter";
import { GithubAppVersionProviderAdapter } from "../github_app_version_provider.adapter/github_app_version_provider.adapter";
import { FakeAppVersionProviderAdapter } from "../test/fake_app_version_provider.adapter/fake_app_version_provider.adapter";
import { KuromojiTermExtractor } from "../kuromoji_term_extractor.adapter/kuromoji_term_extractor.adapter";
import { JapaneseHelper } from "../japanese_helper.adapter/japanese_helper.adapter";
import { CloudVisionOcrAdapter } from "../ocr/cloud_vision_ocr.adapter/cloud_vision_ocr.adapter";
import { CloudVisionRestAPI } from "../ocr/cloud_vision_ocr.adapter/cloud_vision_rest_api";
import { CloudVisionNodeAPI } from "../ocr/cloud_vision_ocr.adapter/cloud_vision_node_api";
import { GoogleLensOcrAdapter } from "../ocr/google_lens_ocr.adapter/google_lens_ocr.adapter";
import { MangaOcrAdapter } from "../ocr/manga_ocr.adapter/manga_ocr.adapter";
import { AppleVisionAdapter } from "../ocr/apple_vision.adapter/apple_vision.adapter";


container_registry.bind( Registry.PpOcrAdapter ).toDynamicValue( (context) => {
    return new PpOcrAdapter();
}).inSingletonScope();

container_registry.bind( Registry.CloudVisionOcrAdapter ).toDynamicValue( (context) => {

    const cloudVisionRestApi = new CloudVisionRestAPI({
        proxyUrl: 'https://cxl-services.appspot.com/proxy' // Google's proxy
    });

    const cloudVisionNodeApi = new CloudVisionNodeAPI();

    return new CloudVisionOcrAdapter(
        cloudVisionNodeApi,
        cloudVisionRestApi
    );
    
}).inSingletonScope();

container_registry.bind( Registry.GoogleLensOcrAdapter ).toDynamicValue( (context) => {
    return new GoogleLensOcrAdapter();
}).inSingletonScope();

container_registry.bind( Registry.MangaOcrAdapter ).toDynamicValue( (context) => {
    return new MangaOcrAdapter();
}).inSingletonScope();

container_registry.bind( Registry.AppleVisionAdapter ).toDynamicValue( (context) => {
    return new AppleVisionAdapter();
}).inSingletonScope();


container_registry.bind( Registry.SharpImageProcessingAdapter ).toDynamicValue( (context) => {
    return new SharpImageProcessingAdapter();
}).inSingletonScope();

container_registry.bind( Registry.GithubAppVersionProviderAdapter ).toDynamicValue( (context) => {
    return new GithubAppVersionProviderAdapter({ githubRepoUrl: get_AppGithubUrl() });
}).inSingletonScope();

container_registry.bind( Registry.FakeAppVersionProviderAdapter ).toDynamicValue( (context) => {
    return new FakeAppVersionProviderAdapter({ runningVersion: '0.0.1', releases: [{ tag_name: '0.1.0' }] });
}).inSingletonScope();

container_registry.bind( Registry.KuromojiTermExtractor ).toDynamicValue( (context) => {
    return new KuromojiTermExtractor();
}).inSingletonScope();

container_registry.bind( Registry.JapaneseHelper ).toDynamicValue( (context) => {
    return new JapaneseHelper();
}).inSingletonScope();


export function get_PpOcrAdapter(): PpOcrAdapter {
    return container_registry.get< PpOcrAdapter >( Registry.PpOcrAdapter )
}

export function get_CloudVisionOcrAdapter(): CloudVisionOcrAdapter {
    return container_registry.get< CloudVisionOcrAdapter >( Registry.CloudVisionOcrAdapter )
}

export function get_GoogleLensOcrAdapter(): GoogleLensOcrAdapter {
    return container_registry.get< GoogleLensOcrAdapter >( Registry.GoogleLensOcrAdapter )
}

export function get_MangaOcrAdapter(): MangaOcrAdapter {
    return container_registry.get< MangaOcrAdapter >( Registry.MangaOcrAdapter )
}

export function get_AppleVisionAdapter(): AppleVisionAdapter {
    return container_registry.get< AppleVisionAdapter >( Registry.AppleVisionAdapter )
}


export function get_SharpImageProcessingAdapter(): SharpImageProcessingAdapter {
    return container_registry.get< SharpImageProcessingAdapter >( Registry.SharpImageProcessingAdapter )
}

export function get_GithubAppVersionProviderAdapter(): GithubAppVersionProviderAdapter {
    return container_registry.get< GithubAppVersionProviderAdapter >( Registry.GithubAppVersionProviderAdapter );
}

export function get_FakeAppVersionProviderAdapter(): FakeAppVersionProviderAdapter {
    return container_registry.get< FakeAppVersionProviderAdapter >( Registry.FakeAppVersionProviderAdapter );
}

export function get_KuromojiTermExtractor(): KuromojiTermExtractor {
    return container_registry.get< KuromojiTermExtractor >( Registry.KuromojiTermExtractor );
}

export function get_JapaneseHelper(): JapaneseHelper {
    return container_registry.get< JapaneseHelper >( Registry.JapaneseHelper );
}

export function get_AppGithubUrl(): string {
    return 'https://github.com/matt-m-o/YomiNinja';
}