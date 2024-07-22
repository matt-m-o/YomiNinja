import { Box, Button, Card, CardActions, Container, Switch, Typography } from "@mui/material";
import Image  from 'next/image';
import { CardContent } from "@mui/material";
import { useEffect, useState } from "react";
import { BrowserExtensionJson } from "../../../electron-src/@core/domain/browser_extension/browser_extension";
import { SimpleConsoleLogger } from "typeorm";


export type ExtensionItemProps = {
    extension: BrowserExtensionJson;
    openOptions: () => void;
    uninstall: () => void;
    onToggle: ( extension: BrowserExtensionJson ) => void;
}

export default function ExtensionItem( props: ExtensionItemProps ) {

    const { extension, openOptions, uninstall, onToggle } = props;

    const [ enabled, setEnabled ] = useState(true);

    useEffect( () => {

        if ( !extension ) return;

        setEnabled( extension.enabled )

    }, [ extension ] );

    return (

        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#202124',
                borderRadius: '8px',
                width: '465px',
                minHeight: '230px',
            }}
        >
            <CardContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: '24px',
                    flex: 1
                }}
            >

                <Box display='flex' mb={2}>

                    <Image
                        src={'data:image/png;base64,'+extension.icon_base64}
                        alt={extension.name}
                        height={60}
                        width={60}
                    />

                    <Box style={{ marginLeft: '16px' }} overflow='hidden'>

                        <Box display='flex' mb={1} >
                            <Typography
                                title={ extension.name }
                                fontSize={'1rem'}
                                fontWeight={600}
                                noWrap
                                mr={2}
                            >
                                {extension.name}
                            </Typography>
                            <Typography color='InactiveCaptionText'>
                                {extension.version}
                            </Typography>
                        </Box>
                        
                        <Typography 
                            title={ extension.description }
                            color='darkgray'
                            // height='96px'
                            flex={1}
                        >
                            {extension.description}
                        </Typography>

                        <Typography 
                            title={ extension.author }
                            color='darkgray'
                            // height='96px'
                            flex={1}
                            noWrap
                            overflow={'hidden'}
                            mt={2}
                            // visibility={ extension?.author ? 'visible' : 'hidden' }
                        >
                            Author: { extension.author || "unknown" }
                        </Typography>
                    </Box>
                </Box>
                
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >

                    <div>
                        <Button
                            variant="outlined"
                            onClick={ openOptions }
                            // color="info"
                            sx={{ textTransform: 'capitalize', mr: '10px' }}
                            disabled={ !extension?.optionsUrl }
                        >
                            Options
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={ uninstall }
                            // color="error"
                            sx={{ textTransform: 'capitalize' }}
                        >
                            Uninstall
                        </Button>
                    </div>

                    <Switch 
                        checked={ enabled }
                        onChange={ ( event ) => {
                            setEnabled( event.target.checked );
                            onToggle( extension );
                        }}
                    />

                </div>
                


            </CardContent>
        </Card>        
    )
}