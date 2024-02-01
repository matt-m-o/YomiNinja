import { Box, Button, Card, CardActions, Container, Typography } from "@mui/material";
import Image  from 'next/image';
import { BrowserExtension } from "../../../electron-src/extensions/browser_extension";
import { CardContent } from "@mui/material";
import { useEffect } from "react";


export type ExtensionItemProps = {
    extension: BrowserExtension;
    openOptions: () => void;
    uninstall: () => void;
}

export default function ExtensionItem( props: ExtensionItemProps ) {

    const { extension, openOptions, uninstall } = props;

    return (

        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#202124',
                borderRadius: '8px',
                width: '465px',
                height: '100%'
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

                <Box display='flex' mb={4}>

                    <Image
                        src={'data:image/png;base64,'+extension.icon}
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
                    </Box>

                </Box>
                
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

            </CardContent>
        </Card>        
    )
}