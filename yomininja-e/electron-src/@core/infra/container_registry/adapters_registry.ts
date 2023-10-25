import "reflect-metadata";
import { Registry, container_registry } from './container_registry';
import { PpOcrAdapter } from '../ppocr.adapter/ppocr.adapter';
import { SharpImageProcessingAdapter } from "../sharp_image_process.adapter/sharp_image_process.adapter";
import { GithubAppVersionProviderAdapter } from "../github_app_version_provider.adapter/github_app_version_provider.adapter";
import { FakeAppVersionProviderAdapter } from "../test/fake_app_version_provider.adapter/fake_app_version_provider.adapter";
import { KuromojiTermExtractor } from "../kuromoji_term_extractor.adapter/kuromoji_term_extractor.adapter";


container_registry.bind( Registry.PpOcrAdapter ).toDynamicValue( (context) => {
    return new PpOcrAdapter();
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


export function get_PpOcrAdapter(): PpOcrAdapter {
    return container_registry.get< PpOcrAdapter >( Registry.PpOcrAdapter )
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

export function get_AppGithubUrl(): string {
    return 'https://github.com/matt-m-o/YomiNinja';
}