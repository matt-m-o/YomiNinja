import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { OcrTemplate, OcrTemplateJson } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { useContext } from "react";



export type OcrTemplatesTableProps = {
    templates: OcrTemplateJson[];
}

export default function OcrTemplatesTable( props: OcrTemplatesTableProps ) {

    const { templates } = props;

    const {
        deleteOcrTemplate,
        loadOcrTemplate,
    } = useContext( OcrTemplatesContext );


    return (
        <TableContainer component={Paper} sx={{ mt: 4, mb: 4 }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        <TableCell align="left" sx={{ fontWeight: 600 }}>
                            Name
                        </TableCell>
                        <TableCell align="left" sx={{ fontWeight: 600 }}>
                            Capture source
                        </TableCell>
                        <TableCell align="left" sx={{ fontWeight: 600 }}>
                            {/* Actions */}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    { templates?.map( (item) => (
                        <TableRow
                            key={item.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row" align="left"
                                sx={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                }}
                            >
                                {item.name}
                            </TableCell>
                            <TableCell align="right">{item.capture_source_name}</TableCell>
                            <TableCell align="right" width='220px'>
                                <Button variant="outlined" sx={{ mr: 1 }}
                                    onClick={ () => loadOcrTemplate( item.id ) }
                                >
                                    Load
                                </Button>
                                <Button variant="outlined"
                                    onClick={ () => deleteOcrTemplate( item.id ) }
                                >
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
    
} 