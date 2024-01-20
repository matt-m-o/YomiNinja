

export type BrowserExtensionId = string;

export interface BrowserExtensionConstructorProps {
    id: BrowserExtensionId;
    name: string;
    description?: string;
    version: string;
    icon?: Buffer; //  Base64 encode image
    optionsUrl?: string;
};

export interface BrowserExtension_CreationInput extends BrowserExtensionConstructorProps {
    id: BrowserExtensionId;
    name: string;
    version: string
};

// Entity for more control over browser extensions
export class BrowserExtension {

    id: BrowserExtensionId; // ID
    name: string;
    description: string;
    version: string;
    icon?: Buffer; //  Base64 encode image
    optionsUrl?: string;
    
    
    private constructor( props: BrowserExtensionConstructorProps ) {

        if ( !props ) return;

        this.id = props.id;
        this.name = props.name;
        this.description = props.description || '';
        this.version = props.version;
        this.icon = props.icon;
        this.optionsUrl = props.optionsUrl;
    }

    static create( input: BrowserExtension_CreationInput ): BrowserExtension {
        return new BrowserExtension( input );
    }

    toJson(): BrowserExtensionJson {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            version: this.version,
            icon: this.icon,
            icon_base64: this.icon?.toString('base64'),
            optionsUrl: this.optionsUrl
        }
    }
}

export interface BrowserExtensionJson extends BrowserExtensionConstructorProps {
    icon_base64?: string;
};