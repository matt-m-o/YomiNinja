import { Autocomplete, Button, Divider, FormControlLabel, styled, Switch, TextField, Typography } from "@mui/material";
import { ImagePreprocessingOperation, OcrTargetRegionJson } from "../../../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import { SetStateAction, useContext, useState } from "react";
import { OcrTemplatesContext } from "../../../../context/ocr_templates.provider";
import OcrSettingsSlider from "../../../AppSettings/OcrSettings/OcrSettingsSlider";
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { List, ListItem, ListItemText, ListItemIcon, IconButton, ListItemSecondaryAction } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import Checkbox from '@mui/material/Checkbox';
import PreprocessingOperationControls from "./PreprocessingOperationControls";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';

export const MoveItemButton = styled(Button)( {
    variant: 'outlined',
    minWidth: '1px',
    width: '10px',
    marginLeft: '2px',
    marginRight: '2px'
});

const TextFieldCapitalize = styled(TextField)({
    '& input': {
        textTransform: 'capitalize'
    }
});


export type ImagePreprocessingOptionsProps = {
    selectedTargetRegion: OcrTargetRegionJson;
    setSelectedTargetRegion: (value: SetStateAction<OcrTargetRegionJson>) => void
};

export default function ImagePreprocessingOptions( props: ImagePreprocessingOptionsProps ) {

    const {
        selectedTargetRegion,
        setSelectedTargetRegion
    } = props;

    const {
        updateTargetRegion,
    } = useContext( OcrTemplatesContext );

    const preprocessingPipeline = selectedTargetRegion?.preprocessing_pipeline.filter(Boolean);

    const [ selectedOption, setSelectedOption ] = useState< string|undefined >('')
    
    const operationsSelectionOptions = [
        "grayscale",
        "resize",
        "invert colors",
        "threshold",
        "blur"
    ].sort( ( a, b ) => a < b ? -1 : 1 );


    const OperationSelector = (
        <Autocomplete
            disablePortal
            renderInput={(params) => (
                <TextFieldCapitalize {...params} label="Add Operation"/>
            )}
            sx={{
                mr: 5
            }}
            value={ selectedOption }
            options={ operationsSelectionOptions }
            onChange={ ( event, value ) => {

                if ( !value )
                    setSelectedOption( undefined );

                setSelectedOption( value )
            }}
        />
    );

    function moveOperation( operationIdx: number, direction: 'up' | 'down' ) {

        const offset = direction === 'up' ? -1 : 1;

        const operation = preprocessingPipeline[operationIdx];
        const newArr = [
            ...preprocessingPipeline.slice(0, operationIdx),
            ...preprocessingPipeline.slice(operationIdx+1),
        ];
        newArr.splice( operationIdx+offset, 0, operation );

        const updatedRegion: OcrTargetRegionJson = {
            ...selectedTargetRegion,
            preprocessing_pipeline: newArr
        };

        updateTargetRegion( updatedRegion );
        setSelectedTargetRegion( updatedRegion );

    }

    function moveOperationDown( operationIdx: number, direction: 'up' | 'down' ) {

        const idxOffset = direction === 'up' ? -1 : 1;

        const operation = preprocessingPipeline[operationIdx];
        const newArr = [
            ...preprocessingPipeline.slice(0, operationIdx),
            ...preprocessingPipeline.slice(operationIdx+1),
        ];
        newArr.splice( operationIdx+idxOffset, 0, operation );

        const updatedRegion: OcrTargetRegionJson = {
            ...selectedTargetRegion,
            preprocessing_pipeline: newArr
        };

        updateTargetRegion( updatedRegion );
        setSelectedTargetRegion( updatedRegion );

    }

    return ( <>
        <List >
            { preprocessingPipeline?.map( (op, idx) => {

                if ( !op?.name ) return;

                return ( <>
                    <ListItem
                        secondaryAction={
                            <IconButton edge="end" aria-label="delete"
                                onClick={() => {
                                    preprocessingPipeline.slice( idx, 1 );

                                    const updatedRegion: OcrTargetRegionJson = {
                                        ...selectedTargetRegion,
                                        preprocessing_pipeline: preprocessingPipeline?.filter( ( _, i ) => i != idx )
                                    };
                    
                                    updateTargetRegion( updatedRegion );
                                    setSelectedTargetRegion( updatedRegion );
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                    >   
                        <ListItemText
                            primary={ op.name }
                            sx={{
                                textTransform: 'capitalize'
                            }}
                        />

                        <PreprocessingOperationControls
                            operation={op}
                            selectedTargetRegion={selectedTargetRegion}
                            setSelectedTargetRegion={setSelectedTargetRegion}
                            onChange={ ( newArgs ) => {
                                setSelectedTargetRegion({
                                    ...selectedTargetRegion,
                                    preprocessing_pipeline: preprocessingPipeline.map( ( item, i ) => {
                                        if ( i !== idx ) return item;
                                        item.args = newArgs;
                                        return item
                                    })
                                });
                            }}

                            onChangeCommitted={ ( newArgs ) => {
                                const updatedRegion: OcrTargetRegionJson = {
                                    ...selectedTargetRegion,
                                    preprocessing_pipeline: preprocessingPipeline.map( ( item, i ) => {
                                        if ( i !== idx ) return item;
    
                                        item.args = newArgs;
    
                                        return item
                                    })
                                };
                                updateTargetRegion( updatedRegion );
                                setSelectedTargetRegion( updatedRegion );
                            }}
                        />

                        <Switch
                            checked={ Boolean( op.enabled ) }
                            onChange={ ( event, checked ) => {
                                const updatedRegion: OcrTargetRegionJson = {
                                    ...selectedTargetRegion,
                                    preprocessing_pipeline: preprocessingPipeline.map( ( item, i ) => {
                                    
                                        if ( i !== idx ) return item;
    
                                        item.enabled = checked;
    
                                        return item
                                    })
                                };
                
                                updateTargetRegion( updatedRegion );
                                setSelectedTargetRegion( updatedRegion );
                            }}
                        />

                        <IconButton title='Move Up'
                            disabled={ idx === 0 }
                            onClick={() => {
                                moveOperation( idx, 'up');
                            }}
                        >
                            <KeyboardArrowUpIcon/>
                        </IconButton>
                        <IconButton title='Move Down'
                            disabled={ idx+1 === preprocessingPipeline?.length }
                            sx={{
                                marginRight: 1
                            }}
                            onClick={() => {
                                moveOperation( idx, 'down');
                            }}
                        >
                            <KeyboardArrowDownIcon/>
                        </IconButton>

                    </ListItem>

                    <Divider/>
                </>)
            })}

            <ListItem
                secondaryAction={
                    <Button 
                        variant={ selectedOption ? 'contained' : 'outlined' }
                        style={{
                            height: '56px'
                        }}
                        onClick={()=> {

                            if ( !selectedOption )
                                return;

                            setSelectedOption( undefined );

                            const operation: ImagePreprocessingOperation = {
                                name: selectedOption,
                                enabled: true
                            };

                            if ( operation.name.toLowerCase() === 'resize' ) {
                                operation.args = {
                                    scale_factor: 1
                                };
                            }

                            const updatedRegion: OcrTargetRegionJson = {
                                ...selectedTargetRegion,
                                preprocessing_pipeline: [
                                    ...selectedTargetRegion.preprocessing_pipeline,
                                    operation
                                ]
                            };
            
                            updateTargetRegion( updatedRegion );
                            setSelectedTargetRegion( updatedRegion );
                        }}
                    >
                        <AddIcon />
                    </Button>
                }
            >
                <ListItemText
                    primary={ OperationSelector }
                    sx={{
                        textTransform: 'capitalize'
                    }}
                />
                
            </ListItem>
            
        </List>
    </> );
}