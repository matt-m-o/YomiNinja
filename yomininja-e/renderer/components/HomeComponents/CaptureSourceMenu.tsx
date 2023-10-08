import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, SxProps, Theme, Typography, createTheme } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from'@mui/lab/TabPanel';
import { useContext, useEffect, useState } from "react";

import { CaptureSource } from '../../../electron-src/ocr_recognition/common/types';
import { CaptureSourceContext } from "../../context/capture_source.provider";

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

    // const [ selectedSource, setSelectedSource ] = useState<CaptureSource>();
    
    const [ tab, setTab ] = useState('1');
    const [ accordionExpanded, setAccordionExpanded ] = useState(false);

    function accordionHandleChange( event: React.SyntheticEvent, newValue: boolean ) {

        setAccordionExpanded(newValue);

        if ( newValue )
            refreshCaptureSources();
    };

    function tabHandleChange(event: React.SyntheticEvent, newValue: string) {
        setTab(newValue);
    };

    function handleSourceClick( source: CaptureSource ) {        
        setAccordionExpanded( false );
        updateActiveCaptureSource( source );
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
                    if ( !accordionExpanded || !videoElement ) return;
                    getMediaStream({ mediaSourceId, maxWidth })
                        .then( stream => {
                            if ( !stream ) return;
                            videoElement.srcObject = stream;
                        })
                }}
                autoPlay={accordionExpanded}
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
            <Button onClick={ () => handleSourceClick(captureSource) } sx={{ ...sx, width: 'max-content' }}>
                <Box display='flex' flexDirection='column' alignItems='center' key={captureSource.id}>
                    <VideoElement mediaSourceId={captureSource.id} maxWidth={180} />
                    <Typography align="center" 
                        sx={{ 
                            textTransform: 'initial',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            width: '180px'
                        }}>
                        { captureSource?.name }
                    </Typography>
                </Box>
            </Button>
        </> 
    }

    function CaptureSourceList( { items }: {items: CaptureSource[]} ) {        

        return (<>
            { items?.map( ( item, idx ) => (
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
            // m='auto'
            mt={5}
            // minWidth={'700px'}
            // width={'min-content'}
        >
            
            <Accordion expanded={accordionExpanded} onChange={accordionHandleChange}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ height: 60 }}>
                    <Typography sx={{ fontSize: '1.15rem', mr: 1 }}>
                        Capture source:
                    </Typography>
                    <Typography color='#90caf9' sx={{ fontSize: '1.15rem', mr: 1 }} >
                        { activeCaptureSource?.name }
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>

                    <TabContext value={tab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={tabHandleChange} aria-label="lab API tabs example">
                                <Tab label="Entire screen" value="1" />
                                <Tab label="Window" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel value="1" >
                            <Grid container spacing={{ xs: 2, md: 8 }} columns={{ xs: 1, sm: 4, md: 12 }}>
                                <CaptureSourceList
                                    items={ captureSources?.filter( item => item?.displayId ) }
                                />
                            </Grid>
                        </TabPanel>
                        <TabPanel value="2">
                            <Grid container spacing={{ xs: 2, md: 8 }} columns={{ xs: 1, sm: 4, md: 12 }} >
                                <CaptureSourceList
                                    items={ captureSources?.filter( item => !item?.displayId ) }
                                />
                            </Grid>
                        </TabPanel>

                    </TabContext>

                </AccordionDetails>

                

            </Accordion>
            
        </Box>
    )
}