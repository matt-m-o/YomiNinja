import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Dictionary } from "../../../electron-src/@core/domain/dictionary/dictionary";
import { LanguagesContext } from "../../context/languages.provider";
import { useContext } from "react";



export type DictionaryTableProps = {
    dictionaries: Dictionary[];
}

export default function DictionariesTable( props: DictionaryTableProps ) {

    const { dictionaries } = props;

    const { languages } = useContext( LanguagesContext );

    function getLanguageName( twoLetterCode: string ): string {
        return languages?.find( item => item.two_letter_code === twoLetterCode ).name || '';
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 4, mb: 4 }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell align="right">Version</TableCell>
                        <TableCell align="right">Source Language</TableCell>
                        <TableCell align="right">Target Language</TableCell>                    
                    </TableRow>
                </TableHead>
                <TableBody>
                    { dictionaries?.map( (item) => (
                        <TableRow
                            key={item.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row"
                                sx={{
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                }}
                            >
                                {item.name}
                            </TableCell>
                            <TableCell align="right">{item.version}</TableCell>
                            <TableCell align="right" sx={{ textTransform: 'capitalize' }}>
                                { getLanguageName(item.source_language) }
                            </TableCell>
                            <TableCell align="right" sx={{ textTransform: 'capitalize' }}>
                                { getLanguageName(item.target_language) }
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
    
} 