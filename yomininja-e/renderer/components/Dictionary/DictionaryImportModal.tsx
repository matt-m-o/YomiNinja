import { Box, Button, FormControl, InputLabel, LinearProgress, LinearProgressProps, MenuItem, Modal, Select, SelectChangeEvent, Typography, styled } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { DictionaryContext } from "../../context/dictionary.provider";
import { DictionaryFormats } from "../../../electron-src/dictionaries/dictionaries.controller";
import { LanguagesContext } from "../../context/languages.provider";

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
};

  
function LinearProgressWithLabel( props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
            
            { props.value == 0 && 
                <LinearProgress />
            }
            { props.value > 0 && 
                <LinearProgress variant="determinate" {...props} />            
            }
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary" textAlign='right'>
                    {`${Math.round(
                        props.value,
                    )}%`}
                </Typography>
            </Box>
        </Box>
    );
}

export type DictionaryImportModalProps = {
    open: boolean;
    handleClose: () => void;
};

export default function DictionaryImportModal( props: DictionaryImportModalProps ) {

    const { open, handleClose } = props;

    const [ dictFormat, setDictFormat ] = useState< DictionaryFormats >();
    const [ importing, setImporting ] = useState(false);
    const [ sourceLanguage, setSourceLanguage ] = useState('ja');
    const [ targetLanguage, setTargetLanguage ] = useState('en');

    const [ fileName, setFileName ] = useState('');

    const { importDictionary, importProgress } = useContext( DictionaryContext );
    const { languages } = useContext( LanguagesContext );
    

    const handleFormatChange = ( event: SelectChangeEvent ) => {
        setDictFormat( event.target.value as DictionaryFormats );
    };

    function handleModalClose() {

        if ( !importing )
            handleClose();
    }

    function handleImport() {

        const sourceLanguageJson = languages.find( item => {
            return item.two_letter_code === sourceLanguage;
        });

        const targetLanguageJson = languages.find( item => {
            return item.two_letter_code === targetLanguage;
        });

        importDictionary( {
            format: dictFormat,
            sourceLanguage: sourceLanguageJson,
            targetLanguage: targetLanguageJson
        } )
            .then( file_name => {

                if ( !file_name ) {
                    setFileName( '' );
                    setImporting( false );
                    return;
                }

                setFileName( file_name );
                setImporting( true );
            });
    }

    function handleSourceLanguageChange( event: SelectChangeEvent< string > ) {

        const { value } = event.target;
        if ( !value ) return;

        setSourceLanguage( value );
    }

    function handleTargetLanguageChange( event: SelectChangeEvent< string > ) {

        const { value } = event.target;
        if ( !value ) return;

        setTargetLanguage( value );
    }

    useEffect( () => {

        if ( !importProgress ) return;

        const { status } = importProgress;

        if ( status == 'importing' )
            setImporting( true );
        else
            setImporting( false );

    }, [ importProgress ]);

    return (
        <Modal
            open={open}            
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2" mb={4}>
                    Dictionary Import
                </Typography>
                
                <FormControl fullWidth>
                    <InputLabel>Dictionary format</InputLabel>
                    <Select
                        disabled={ importing }
                        value={ dictFormat || '' }
                        label="Dictionary format"
                        onChange={handleFormatChange}                        
                    >
                        <MenuItem value='yomichan'>Yomichan (zip)</MenuItem>
                        <MenuItem value='jmdictFurigana'>JmdictFurigana (txt)</MenuItem>
                    </Select>
                    
                </FormControl>

                { dictFormat === 'yomichan' && <>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Source language</InputLabel>
                        <Select
                            disabled={ importing }
                            value={sourceLanguage}
                            label="Source language"
                            onChange={ handleSourceLanguageChange }
                            defaultValue="ja"
                        >
                            <MenuItem value='ja'>Japanese</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Target language</InputLabel>
                        <Select
                            disabled={ importing }
                            value={targetLanguage}
                            label="Target language"
                            onChange={ handleTargetLanguageChange }
                            defaultValue="en"
                        >
                            <MenuItem value='en'>English</MenuItem>
                        </Select>
                    </FormControl>
                </> }
                
                

                
                { importing && <>

                    <Typography mt={5}>
                        Importing: { fileName }
                    </Typography>

                    <Box sx={{ width: '100%' }}>
                        <LinearProgressWithLabel value={ importProgress?.progress || 0 } />
                    </Box>
                </> }

                { importProgress?.status === 'completed' &&
                    <Box display='flex' justifyContent='center'>
                        <Typography mt={5} fontSize='1.2rem'>
                            Import process is complete!
                        </Typography>
                    </Box>
                }

                <Box display='flex' justifyContent='end' mt={4}>
                    <Button variant='contained' size="medium"
                        disabled={ !Boolean(dictFormat) || importing }
                        sx={{ m: 1 }}
                        onClick={ () => handleImport() }
                    >
                        Import
                    </Button>
                    <Button variant='outlined' size="medium"
                        disabled={ importing }
                        sx={{ m: 1, backgroundColor: '' }}
                        onClick={ handleClose }
                    >
                        Close
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}