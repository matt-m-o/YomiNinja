var serverUrl = 'http://localhost:10010';
var apiBaseUrl = serverUrl+'/chrome-api';

async function invoke({ url, args }={}) {
    const response = await fetch( apiBaseUrl+url, {
        method: 'POST',
        body: JSON.stringify({
            extensionId: chrome.runtime?.id,
            ...args
        })
    });

    const json = await response.json();

    if ( !( 'data' in json ) )
        return;

    return json.data;
}

var apiDefinitions = {
    
    tabs: {
        factory: ( base ) => {
            
            if ( base?.tabs) return;
            
            const baseUrl = '/tabs'
            
            return {
                ...base,
                captureVisibleTab: async ( windowId, options, callback ) => {

                    let imageData = '';

                    try {
                        imageData = await invoke({
                            url: baseUrl+'/captureVisibleTab',
                            args: {
                                windowId,
                                options
                            }
                        });

                    } catch (error) {
                        console.error(error.message);
                    }

                    if ( callback ) return callback( imageData ); 

                    return imageData;
                }
            }
        }
    }
};

Object.keys( apiDefinitions ).forEach( ( apiName ) => {
    const baseApi = chrome[ apiName ];
    const api = apiDefinitions[ apiName ];

    Object.defineProperty( chrome, apiName, {
        value: api.factory( baseApi, serverUrl ),
        enumerable: true,
        configurable: true,
    });
});

Object.freeze(chrome);