import { Accordion, AccordionDetails, AccordionSummary, SxProps, Theme, Typography } from "@mui/material";
import { CSSProperties, ReactNode, useEffect, useState } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export function CustomAccordion(
    props: {
        summary: any,
        children?: ReactNode,
        sx?: SxProps<Theme>,
        detailsSx?: SxProps<Theme>,
        style?: CSSProperties,
        title?: string,
        disabled?: boolean,
    } )
{
    const [ expanded, setExpanded ] = useState(false);

    useEffect( () => {

        if ( props.disabled === true )
            setExpanded( false );

    }, [ props.disabled ]);
        
    return(
        <Accordion sx={props.sx}
            style={props.style}
            title={props.title}
            disabled={props.disabled}
            expanded={expanded}
        >
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}
                onClick={ () => {
                    if ( props.disabled !== true )
                        setExpanded( !expanded )   
                }}
            >
                <Typography fontSize={'1.1rem'}>
                    {props.summary}
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ ...props.detailsSx }}>
                {props.children}
            </AccordionDetails>
        </Accordion>
    );
}