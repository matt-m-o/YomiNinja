import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, InputAdornment, SxProps, TextField, Theme, Typography, createTheme } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from'@mui/lab/TabPanel';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { CaptureSource } from '../../../electron-src/ocr_recognition/common/types';
import { CaptureSourceContext } from "../../context/capture_source.provider";
import { ipcRenderer } from "../../utils/ipc-renderer";

const defaultTheme = createTheme({
    palette: {
      mode: 'dark'
    }
});


export default function CaptureSourceMenu() {

    const {
        activeCaptureSource,
        captureSources,
        updateActiveCaptureSource,
        refreshCaptureSources,
    } = useContext( CaptureSourceContext );

    const [ searchValue, setSearchValue ] = useState< string >('');

    useEffect( () => {
        refreshCaptureSources();
    }, []);    
    
    const [ tab, setTab ] = useState('1');

    function tabHandleChange(event: React.SyntheticEvent, newValue: string) {
        setTab(newValue);
    };

    function handleSourceClick( source: CaptureSource ) {
        updateActiveCaptureSource( source );

        setTimeout( () => {
            ipcRenderer.invoke( 'main:close_capture_source_selection' );            
        }, 500 );
    }

    async function getMediaStream( input: { mediaSourceId: string, maxWidth: number }): Promise<MediaStream> {

        const stream: MediaStream = await ( navigator.mediaDevices as any).getUserMedia({
            audio: false,
            video: {               
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: input.mediaSourceId,
                    maxWidth: input.maxWidth,
                    maxFrameRate: 1,
                    minAspectRatio: 0.1,
                    // maxAspectRatio: 20
                }
            }
        });

        return stream;
    }

    function VideoElement( props: { mediaSourceId: string, maxWidth: number } ) {
        const { mediaSourceId, maxWidth } = props;
        return (
            <video style={{ maxWidth }}
                ref={ (videoElement) => {
                    if ( !videoElement ) return;
                    getMediaStream({ mediaSourceId, maxWidth })
                        .then( stream => {
                            if ( !stream ) return;
                            videoElement.srcObject = stream;
                        })
                }}
                autoPlay
            />
        )
    }

    function CaptureSourceButton( props: { captureSource: CaptureSource } ) {

        const { captureSource } = props;

        const sx: SxProps<Theme> = captureSource.id === activeCaptureSource?.id ?
            {
                border: 'solid 1px',
                borderColor: defaultTheme.palette.action.active
            } : {};


        return <>
            <Button title={captureSource.name}
                onClick={ () => handleSourceClick(captureSource) } 
                sx={{ ...sx, width: 'max-content' }}
            >
                <Box display='flex' flexDirection='column' alignItems='center'
                    key={captureSource.id}
                    sx={{
                        height: '130px',
                    }}
                >
                    <VideoElement mediaSourceId={captureSource.id} maxWidth={180} />
                    <Typography align="center" mt={2}                
                        sx={{ 
                            textTransform: 'initial',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: '180px',
                            mt: 'auto'
                        }}>
                        { captureSource?.name }
                    </Typography>
                </Box>
            </Button>
        </> 
    }

    function CaptureSourceList( { items }: {items: CaptureSource[]} ) {

        const sort = ( a, b ) => {
            return a.name < b.name ? -1 : 1
        };

        return (<>
            { items?.sort(sort)
                .filter( item => item.name.toLowerCase().includes( searchValue.toLowerCase() ) )
                .map( ( item, idx ) => (
                <Grid item key={idx}
                    // sx={{ display: 'flex', justifyContent: 'center' }}
                >
                    <CaptureSourceButton captureSource={item}/>
                </Grid>
            ))}
        </>)
    }    


    return (
        <Box display='flex' justifyContent='center' flexDirection='column' 
            p={2} pt={3} height={'100vh'}
        >
            <Typography mb={2} fontSize={'1.1rem'} > Choose the OCR capture source </Typography>

            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
                    <TabList onChange={tabHandleChange} aria-label="lab API tabs example">
                        <Tab label="Entire screen" value="1" />
                        <Tab label="Window" value="2" />
                    </TabList>
                    <TextField type="search"
                        placeholder="Search"
                        variant="standard"
                        size="small"
                        autoFocus
                        value={searchValue}
                        onChange={ (event: ChangeEvent< HTMLInputElement >) => {
                            setSearchValue( event.target.value );
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchRoundedIcon />
                                </InputAdornment>
                            ),
                            autoFocus: true
                        }}
                        sx={{
                            minWidth: '45%',
                            mt: 1.5,
                            ml: 'auto'
                        }}
                    />
                </Box>

                <Box
                    sx={{              
                        pr: '24px', // keep right padding when drawer closed
                        backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                          ? theme.palette.grey[100]
                          : '#2b2b2d',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        height: '100%',
                    }}
                >
                    <TabPanel value="1" >
                        <Grid container spacing={{ xs: 2, md: 8 }} columns={{ xs: 1, sm: 4, md: 12 }}>
                            <CaptureSourceList
                                items={ captureSources?.filter( item => item.type === 'screen' ) }
                            />
                        </Grid>
                    </TabPanel>
                    <TabPanel value="2">
                        <Grid container spacing={{ xs: 2, md: 8 }} columns={{ xs: 1, sm: 4, md: 12 }} >
                            <CaptureSourceList
                                items={ captureSources?.filter( item => item.type === 'window' ) }
                            />
                        </Grid>
                    </TabPanel>
                </Box>
                

            </TabContext>            
            
        </Box>
    )
}