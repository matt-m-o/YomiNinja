import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { OcrTemplate } from "../../../electron-src/@core/domain/ocr_template/ocr_template";



export type OcrTemplatesTableProps = {
    templates: OcrTemplate[];
}

export default function OcrTemplatesTable( props: OcrTemplatesTableProps ) {

    const { templates } = props;


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
                            <TableCell align="left">{item.capture_source_name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
    
} 