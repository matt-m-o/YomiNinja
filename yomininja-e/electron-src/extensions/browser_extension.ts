

export interface BrowserExtension {
    id: string;
    name: string;
    description: string;
    version: string;
    icon: string; //  Base64 encode image
    optionsUrl?: string;
}