import { Accordion, AccordionDetails, AccordionSummary, SxProps, Theme, Typography } from "@mui/material";
import { CSSProperties, ReactNode } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export function CustomAccordion(
    props: {
        summary: any,
        children?: ReactNode,
        sx?: SxProps<Theme>,
        detailsSx?: SxProps<Theme>,
        style?: CSSProperties,
        title?: string,
    } )
{
    return(
        <Accordion sx={props.sx} style={props.style} title={props.title}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
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