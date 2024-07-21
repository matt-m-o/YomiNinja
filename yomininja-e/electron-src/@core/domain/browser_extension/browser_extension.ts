

export type BrowserExtensionId = string;

export interface BrowserExtensionConstructorProps {
    id: BrowserExtensionId;
    name: string;
    description: string;
    author?: string;
    version: string;
    icon?: Buffer; //  Base64 encode image
    optionsUrl?: string;
    enabled: boolean;
};

export interface BrowserExtension_CreationInput extends Partial< BrowserExtensionConstructorProps > {
    id: BrowserExtensionId;
    name: string;
    version: string;
    enabled?: boolean;
};

// Entity for more control over browser extensions
export class BrowserExtension {

    id: BrowserExtensionId; // ID
    name: string;
    description: string;
    author?: string;
    version: string;
    icon?: Buffer; //  Base64 encode image
    optionsUrl?: string;
    enabled: boolean;
    
    
    private constructor( props: BrowserExtensionConstructorProps ) {

        if ( !props ) return;

        this.id = props.id;
        this.name = props.name;
        this.description = props.description;
        this.version = props.version;
        this.icon = props.icon;
        this.optionsUrl = props.optionsUrl;
        this.enabled = props.enabled;
    }

    static create( input: BrowserExtension_CreationInput ): BrowserExtension {

        const enabled = typeof input.enabled === 'boolean' ?
            input.enabled :
            true;

        return new BrowserExtension({
            ...input,
            enabled,
            description: input.description || '',
            author: input.author || ''
        });
    }

    toJson(): BrowserExtensionJson {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            author: this.author,
            version: this.version,
            icon: this.icon,
            icon_base64: this.icon?.toString('base64'),
            optionsUrl: this.optionsUrl,
            enabled: this.enabled
        }
    }
}

export interface BrowserExtensionJson extends BrowserExtensionConstructorProps {
    icon_base64?: string;
};