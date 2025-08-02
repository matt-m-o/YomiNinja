import OcrSettingsSlider from "../../../AppSettings/OcrSettings/OcrSettingsSlider";
import { ImagePreprocessingOperation, OcrTargetRegionJson } from "../../../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import { SetStateAction, useContext } from "react";
import { OcrTemplatesContext } from "../../../../context/ocr_templates.provider";
import { Slider, Typography } from "@mui/material";
import { Mark } from "@mui/base/useSlider";

export type PreprocessingOperationControlsProps = {
    operation: ImagePreprocessingOperation;
    selectedTargetRegion: OcrTargetRegionJson;
    setSelectedTargetRegion: (value: SetStateAction<OcrTargetRegionJson>) => void;
    onChange: ( newArgs: Record< string, any > ) => void;
    onChangeCommitted: ( newArgs: Record< string, any > ) => void;
}

export default function PreprocessingOperationControls( props: PreprocessingOperationControlsProps ) {

    const {
        operation,
        selectedTargetRegion,
        setSelectedTargetRegion
    } = props;

    const {
        updateTargetRegion,
    } = useContext( OcrTemplatesContext );

    let controls: JSX.Element = <></>;

    function createSlider( input: {
        argKey: string;
        min: number;
        max: number;
        step: number;
        marks?: Mark[];
        percentage?: boolean;
    }): JSX.Element {
        let { argKey, min, max, step, marks } = input;

        let value = operation.args?.[argKey] || 0;
        if ( input.percentage ) {
            value = Math.floor(value * 100);
            min *= 100;
            max *= 100;
            step *= 100;
            marks = marks?.map( mark => {
                mark.value *= 100;
                return mark;
            })
        }

        return <Slider min={min} max={max} step={step} defaultValue={100}
            value={ value }
            valueLabelDisplay="auto"
            marks={marks}
            style={{ marginRight: 8 }}
            onChange={ ( event, newValue ) => {
                if ( typeof newValue !== 'number' ) return;

                if ( input.percentage )
                    newValue = newValue / 100;

                props.onChange( { [argKey]: newValue } );
            }}
            onChangeCommitted={ ( event, newValue ) => {
                if ( typeof newValue !== 'number' ) return;

                if ( input.percentage )
                    newValue = newValue / 100;

                props.onChangeCommitted( { [argKey]: newValue } );
            }}
        />
    }

    if ( operation.name === "threshold" ) {

        controls = ( createSlider({
            argKey: 'threshold',
            min: 0,
            max: 255,
            step: 1
        }));
    }
    else if ( operation.name === 'blur' ) {
        controls = ( createSlider({
            argKey: 'sigma',
            min: 0.3,
            max: 5,
            step: 0.05
        }));
    }
    else if ( operation.name === 'resize' ) {
        controls = ( createSlider({
            argKey: 'scale_factor',
            min: 0.25,
            max: 5,
            step: 0.05,
            percentage: true,
            // marks:[
            //     {
            //         label: '100%',
            //         value: 1,
            //     }
            // ]
        }));
    }

    return  (
        <div
            style={{
                display: 'flex',
                width: '100%',
                maxWidth: '500px',
                marginRight: '50px',
                marginLeft: 'auto'
            }}
        >
            {controls}
        </div>
    );
}