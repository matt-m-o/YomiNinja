import { Box, Button, Card, CardActions, Container, SxProps, Theme, Typography, styled } from "@mui/material";
import Image  from 'next/image';
import { CardContent } from "@mui/material";
import { CSSProperties, useEffect } from "react";
import { OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { OcrTargetRegionDiv, toCssPercentage } from "./OcrTargetRegion";
import { TemplateDiv } from "./OcrTemplateEditor";

const TemplateActionBtn = styled( Button )({
    minWidth:'fit-content',
    padding: 5,
    marginLeft: 2,
    marginBottom: 2
});

export type OcrTemplateItemProps = {
    template: OcrTemplateJson;
    isActive: boolean;
    loadItem: () => void;
    editItem: () => void;
    deleteItem: () => void;
}

export default function OcrTemplateItem( props: OcrTemplateItemProps ) {

    const {
        template,
        isActive,
        loadItem,
        editItem,
        deleteItem
    } = props;

    const iconStyle: CSSProperties = {
        width: '28px',
        height: '28px',
        margin: 1,
        marginRight: 4,
        marginLeft: 4,
    };

    const actionButtonSx: SxProps< Theme > = {
        width: '100%',
        m: 0.5,
        pl: 1,
        pr: 1
    };

    const regions = template.target_regions.map( region => {
        const { position, size } = region;
        return (
            <OcrTargetRegionDiv key={ region.id }
                style={{
                    border: 'solid 1px red',
                    top: toCssPercentage( position.top ),
                    left: toCssPercentage( position.left ),
                    width: toCssPercentage( size.width ),
                    height: toCssPercentage( size.height ),
                }}
            />
        );
    });

    return (

        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#202124',
                borderRadius: '8px',
                width: '352px',
                height: '100%',
                border: 'solid',
                borderColor: '#90caf9',
                borderWidth: isActive ? '1px' : '0px',
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

                <Box display='flex'
                    flexDirection='column'
                    alignItems='center'
                    mb={1}
                >
                    <TemplateDiv style={{ cursor: 'auto' }}>
                        {regions}
                        <img
                            src={'data:image/png;base64,'+template.image_base64}
                            alt={template.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '20vh',
                                userSelect: 'none',
                                objectFit: 'cover', 
                            }}
                        />
                    </TemplateDiv>
                    

                    <Box style={{ marginLeft: '16px' }} overflow='hidden'>

                        <Box display='flex' mt={1} >
                            <Typography
                                title={ template.name }
                                fontSize={'1rem'}
                                fontWeight={600}
                                noWrap
                                color={ isActive ? '#90caf9' : 'inherit' }
                            >
                                {template.name}
                            </Typography>
                        </Box>
                    </Box>

                </Box>
                
                <Box display='flex'>
                    <TemplateActionBtn variant="outlined"
                        onClick={ loadItem }
                        title='Load'
                        sx={ actionButtonSx }
                    >
                        <OpenInNewRoundedIcon style={iconStyle}/>
                    </TemplateActionBtn>
                    <TemplateActionBtn variant="outlined"
                        onClick={ deleteItem }
                        title='Edit'
                        sx={actionButtonSx}
                    >
                        <DeleteRoundedIcon style={iconStyle}/>
                    </TemplateActionBtn>
                </Box>

            </CardContent>
        </Card>        
    )
}