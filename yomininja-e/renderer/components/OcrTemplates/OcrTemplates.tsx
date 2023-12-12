import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import OcrTemplatesTable from "./OcrTemplatesTable";
import { useContext, useEffect, useRef, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import CreateOcrTemplateModal from "./CreateOcrTemplateModal";
import Moveable from "react-moveable";
import OcrTargetRegion from "./OcrTargetRegion";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";

export type Size = { // Pixels
    width: number;
    height: number;
};

export default function OcrTemplates() {

    const {
        ocrTemplates,
        activeOcrTemplate,
        addTargetRegion,
        updateTargetRegion,
        saveOcrTemplate
    } = useContext( OcrTemplatesContext );

    const [
        openCreateOcrTemplateModal,
        setOpenCreateOcrTemplateModal
    ] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);
    const [ templateSize, setTemplateSize ] = useState<Size>();


    useEffect(() => {
        const handleResize = ( entries: ResizeObserverEntry[] ) => {
            if ( entries && entries.length > 0 ) {
                const firstEntry = entries[0];
                const { width, height } = firstEntry.contentRect;
                setTemplateSize({ width, height });
            }
        };
    
        const resizeObserver = new ResizeObserver(handleResize);
    
        if ( imgRef.current ) {
            resizeObserver.observe(imgRef.current);
            setTemplateSize({
                width: imgRef.current.clientWidth,
                height: imgRef.current.clientHeight
            });
        }
    
        return () => {
            if ( imgRef.current ) 
                resizeObserver.unobserve(imgRef.current);
        };
    }, []);
    

    function onImageLoad() {
        if ( imgRef?.current ) {
            setTemplateSize({
                width: imgRef.current.clientWidth,
                height: imgRef.current.clientHeight
            });
        }
    }


    return <>
        <Card variant="elevation" sx={{ borderRadius: 4, userSelect: 'none', width: '100%' }}>

            <CreateOcrTemplateModal
                open={openCreateOcrTemplateModal}
                handleClose={ () => setOpenCreateOcrTemplateModal(false) }
            />

            <CardContent>
                <Container maxWidth='xl'>

                    <Box sx={{ flexGrow: 1, margin: 1, mb: 2 }}>

                        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }} m={2} ml={0} mr={0}>
                            <Typography gutterBottom variant="h6" component="div" margin={0} ml={0} mb={4}>
                                OCR Templates
                            </Typography>
                        </Box> */}

                        <Button variant="outlined"
                            onClick={ () => setOpenCreateOcrTemplateModal( true ) }
                            sx={{ mb: 2 }}
                        >
                            New Template
                        </Button>

                        <Button
                            onClick={ () => addTargetRegion({
                                ocr_template_id: activeOcrTemplate.id,
                                position: {
                                    top: 0.25,
                                    left: 0.25,
                                },
                                size: {
                                    width: 0.25,
                                    height: 0.25,
                                },
                                angle: 0,
                            }) }
                        >
                            Add region
                        </Button>

                        <Button
                            onClick={ () => {
                                saveOcrTemplate();
                            }}
                        >
                            Save
                        </Button>

                        <Box display='flex' justifyContent='center' flexDirection='column'>

                            <Typography
                                visibility={ activeOcrTemplate ? 'unset' : 'hidden' }
                                textAlign='center'
                            >
                                {activeOcrTemplate?.name}
                            </Typography>

                            { activeOcrTemplate &&
                                <div className='container'
                                    style={{
                                        position: 'relative',
                                        // width: 'max-content',
                                        maxWidth: '100%',
                                        boxSizing: 'border-box',
                                        overflow: 'hidden',
                                        margin: 'auto',
                                    }}>

                                    { templateSize &&
                                        activeOcrTemplate?.target_regions.map( region => {
                                            return <OcrTargetRegion
                                                key={region.id} 
                                                region={region}
                                                templateSize={templateSize}
                                                onChange={ updateTargetRegion }
                                            />
                                        }) 
                                    }
                                    

                                    <img src={ 'data:image/png;base64,' + activeOcrTemplate?.image_base64 }
                                        ref={imgRef}
                                        alt="template background image"
                                        draggable={false}
                                        onLoad={onImageLoad}
                                        style={{
                                            top: 0,
                                            left: 0,
                                            maxWidth: '100%',
                                            userSelect: 'none',
                                            objectFit: 'cover', 
                                        }}
                                    />
                                </div>
                                
                            }
                        </Box>

                        <OcrTemplatesTable templates={ocrTemplates} />

                    </Box>

                </Container>
            </CardContent>
        </Card>
    </>
}