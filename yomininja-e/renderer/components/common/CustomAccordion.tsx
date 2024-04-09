import { Accordion, AccordionDetails, AccordionSummary, SxProps, Theme, Typography } from "@mui/material";
import { CSSProperties, ReactNode } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export function CustomAccordion(
    props: {
        summary: any,
        children: ReactNode,
        sx?: SxProps<Theme>,
        detailsSx?: SxProps<Theme>,
        style?: CSSProperties
    } )
{
    return(
        <Accordion sx={props.sx} style={props.style} >
            <AccordionSummary expandIcon={<ArrowDropDownIcon />}>
                <Typography fontSize={'1.1rem'}>
                    {props.summary}
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pl: 1, ...props.detailsSx }}>
                {props.children}
            </AccordionDetails>
        </Accordion>
    );
}