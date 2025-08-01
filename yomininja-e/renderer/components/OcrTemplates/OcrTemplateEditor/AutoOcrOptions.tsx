import { FormControlLabel, Switch, Typography } from "@mui/material";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { CaptureSource } from "../../../../electron-src/ocr_recognition/common/types";
import { OcrTargetRegionJson } from "../../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import { SetStateAction, useContext, useState } from "react";
import { OcrTemplatesContext } from "../../../context/ocr_templates.provider";
import OcrSettingsSlider from "../../AppSettings/OcrSettings/OcrSettingsSlider";
import { ipcRenderer } from "../../../utils/ipc-renderer";

export type AutoOcrOptionsProps = {
    activeCaptureSource: CaptureSource;
    selectedTargetRegion: OcrTargetRegionJson;
    setSelectedTargetRegion: (value: SetStateAction<OcrTargetRegionJson>) => void
};

export default function AutoOcrOptions( props: AutoOcrOptionsProps ) {

    const {
        activeCaptureSource,
        selectedTargetRegion,
        setSelectedTargetRegion
    } = props;

    const {
        activeOcrTemplate,
        addTargetRegion,
        removeTargetRegion,
        updateTargetRegion,
        updateOcrTemplate
    } = useContext( OcrTemplatesContext );

    const motionSensitivity = selectedTargetRegion?.auto_ocr_options?.motion_sensitivity || 0;
    const frameSampleSize = selectedTargetRegion?.auto_ocr_options?.frame_sample_size || 0;
    const intervalBetweenFrames = activeOcrTemplate?.capturer_options?.interval_between_frames || 0;

    const [ maximumFrameRate, setMaximumFrameRate ] = useState(
        intervalBetweenFrames ? Math.floor( 1000 / intervalBetweenFrames ) : 3
    );
    

    return ( <>
        <Typography mb={1}>
            <strong>Note:</strong> This feature is experimental and will only become active when a <strong>Capture Source</strong> is manually selected.
            To avoid potential issues, it’s currently recommended to enable this feature for a <strong>single region at a time</strong>.
        </Typography>

        { (activeCaptureSource?.type !== 'window') &&
            <Typography mb={1}>
                <WarningRoundedIcon color="warning" style={{
                    marginBottom: '-2px',
                    marginRight: '4px', 
                    width: '17px',
                    height: '17px',
                }}/>
                The selected capture source is not a window! Please select a window as the capture source!
            </Typography>
        }

        <FormControlLabel label='Enable Auto OCR'
            sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
            control={
                <Switch
                    checked={ Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
                    onChange={ ( event ) => {
                        console.log( event.target.checked )

                        const updatedRegion = {
                            ...selectedTargetRegion,
                            auto_ocr_options: {
                                ...selectedTargetRegion.auto_ocr_options,
                                enabled: event.target.checked,
                            }
                        }

                        updateTargetRegion( updatedRegion );
                        setSelectedTargetRegion( updatedRegion );
                    }}
                /> 
            }
        />

        <FormControlLabel label='Refresh All Regions'
            sx={{ ml: 0,  mt: 0, mb: 1, width: '100%' }}
            disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
            control={
                <Switch
                    checked={ Boolean( selectedTargetRegion?.auto_ocr_options?.refresh_all_regions ) }
                    onChange={ ( event ) => {
                        console.log( event.target.checked )

                        const updatedRegion = {
                            ...selectedTargetRegion,
                            auto_ocr_options: {
                                ...selectedTargetRegion.auto_ocr_options,
                                refresh_all_regions: event.target.checked,
                            }
                        }

                        updateTargetRegion( updatedRegion );
                        setSelectedTargetRegion( updatedRegion );
                    }}
                /> 
            }
        />

        <OcrSettingsSlider
            label="Motion Sensitivity"
            title="A higher value means the system will respond to smaller changes, while a lower value means only larger changes will be detected"
            disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
            min={0}
            max={100}
            value={ motionSensitivity ? motionSensitivity * 100 : 0 }
            step={0.01}
            leftLabel="Low"
            rightLabel="High"
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {
                    setSelectedTargetRegion({
                        ...selectedTargetRegion,
                        auto_ocr_options: {
                            ...selectedTargetRegion.auto_ocr_options,
                            motion_sensitivity: newValue > 0 ? newValue / 100 : 0
                        }
                    })
                }
            }}
            onChangeCommitted={ () => {
                updateTargetRegion({
                    ...selectedTargetRegion,
                    auto_ocr_options: {
                        ...selectedTargetRegion.auto_ocr_options,
                    }
                });
            }}
            reset={ () => {
                const data = {
                    ...selectedTargetRegion,
                    auto_ocr_options: {
                        ...selectedTargetRegion.auto_ocr_options,
                        motion_sensitivity: 0.5
                    }
                };
                setSelectedTargetRegion(data);
                updateTargetRegion(data);
            }}
        />

        <OcrSettingsSlider
            label="Number of Frames"
            title="Number of frames used for motion detection. Higher values can filter out slow and gradual changes."
            disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
            min={3}
            max={30}
            value={ frameSampleSize }
            step={1}
            leftLabel="Low"
            rightLabel="High"
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {
                    setSelectedTargetRegion({
                        ...selectedTargetRegion,
                        auto_ocr_options: {
                            ...selectedTargetRegion.auto_ocr_options,
                            frame_sample_size: newValue 
                        }
                    })
                }
            }}
            onChangeCommitted={ () => {
                updateTargetRegion({
                    ...selectedTargetRegion,
                    auto_ocr_options: {
                        ...selectedTargetRegion.auto_ocr_options,
                    }
                });
            }}
            reset={ () => {
                const data = {
                    ...selectedTargetRegion,
                    auto_ocr_options: {
                        ...selectedTargetRegion.auto_ocr_options,
                        frame_sample_size: 8
                    }
                };
                setSelectedTargetRegion(data);
                updateTargetRegion(data);
            }}
        />

        <OcrSettingsSlider
            label="Capture Maximum framerate"
            title="Maximum number of frames per second. This parameter is shared"
            disabled={ !Boolean( selectedTargetRegion?.auto_ocr_options?.enabled ) }
            min={1}
            max={10}
            value={ maximumFrameRate }
            step={1}
            onChange={ ( event, newValue ) => {
                if (typeof newValue === 'number') {

                    setMaximumFrameRate( newValue );

                    newValue = 1000 / newValue;
                }
            }}
            onChangeCommitted={ () => {
                const intervalBetweenFrames = 1000 / maximumFrameRate;
                ipcRenderer.invoke('screen_capturer:set_interval', intervalBetweenFrames );
                updateOcrTemplate({
                    ...activeOcrTemplate,
                    capturer_options: {
                        ...activeOcrTemplate.capturer_options,
                        interval_between_frames: intervalBetweenFrames
                    }
                });
            }}
            reset={ () => {
                const interval_between_frames = 1000 / 3;
                updateOcrTemplate({
                    ...activeOcrTemplate,
                    capturer_options: {
                        ...activeOcrTemplate.capturer_options,
                        interval_between_frames
                    }
                });
                ipcRenderer.invoke('screen_capturer:set_interval', interval_between_frames );
                setMaximumFrameRate(3);
            }}
        />
    </> );
}