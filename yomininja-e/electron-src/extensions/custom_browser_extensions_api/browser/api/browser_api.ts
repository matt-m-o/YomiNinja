import url from "url";
import { TabsAPI } from "./tabs";
import http from 'http'

export type CustomBrowserExtensionsAPIPrefix = 'tabs';
export type ResponseData = {
    data: any;
};

export class CustomBrowserExtensionsAPI {

    tabs: TabsAPI;

    constructor(
        input: {
            tabs: TabsAPI
        }
    ) {
        this.tabs = input.tabs;
    }

    async router(
        url: url.UrlWithParsedQuery,
        request: http.IncomingMessage,
        response: http.ServerResponse
    ): Promise<boolean> {

        if ( !url.pathname?.startsWith('/chrome-api') )
            return false;

        const path = url.pathname.split('/').slice(2);

        let body = "";
        request.on("data", (chunk) => {
            body += chunk;
        });

        const data = await new Promise( ( resolve, reject ) => {
            request.on("end", async () => {
                try {
                    const jsonData = JSON.parse(body);
                    // console.log({ jsonData });
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            });
        });

        

        // console.log({ path });

        if ( path.length < 2)
            return false;

        const prefix = path[0] as CustomBrowserExtensionsAPIPrefix;

        let result: ResponseData | undefined;

        if ( prefix == 'tabs')
            result = await this.tabsRouter({ path, data });

        response.end( JSON.stringify(result) );

        return false;
    }

    private async tabsRouter(
        input: {
            data: any,
            path: string[]
        }
    ): Promise< ResponseData | undefined > {

        const { data, path } = input;

        const func = path[1] as keyof TabsAPI;

        if ( !(func in this.tabs) )
            return;

        return await this.tabs[func]( data );
    }
}

export const customBrowserExtensionsAPI = new CustomBrowserExtensionsAPI({
    tabs: new TabsAPI()
});