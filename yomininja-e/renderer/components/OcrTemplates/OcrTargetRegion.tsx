import { useRef } from "react";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Moveable, { OnDrag, OnResize, OnResizeEnd } from "react-moveable";
import { Box } from "@mui/material";
import { Size } from "electron";


export type OcrTargetRegionProps = {
    region: OcrTargetRegionJson;
    templateSize: Size;
    onChange: ( region: OcrTargetRegionJson ) => void;
};


export default function OcrTargetRegion( props: OcrTargetRegionProps  ) {

    const targetRef = useRef<HTMLDivElement>(null);

    const { region, templateSize, onChange } = props;

    const { position, size } = region;

    function handlePercentageOverflow( value: number ) {

        if ( value > 1 )
            return 1;

        else if ( value < 0)
            return 0;

        return value;
    }

    function toCssPercentage( value: number ): string {

        value = handlePercentageOverflow( value );

        let result = ( value * 100 )        

        return result + "%";
    }

    function handleChange( input: {
        width?: number;
        height?: number;
        top?: number;
        left?: number;
    }) {
        const { width, height, top, left } = input;

        // console.log({ width, height });

        onChange({
            ...region,
            size: {
                width,
                height
            },
            position: {
                ...region.position,
                top,
                left,
            },
        });
    }


    return ( <>
        <Box ref={targetRef}
            style={{
                position: 'absolute', // relative
                top: toCssPercentage(position.top),
                left: toCssPercentage(position.left),
                width: toCssPercentage(size.width),
                height: toCssPercentage(size.height),
                border: 'solid 2px purple',
                zIndex: 10,
                maxWidth: "auto",
                maxHeight: "auto",
                minWidth: "auto",
                minHeight: "auto",
            }}
        >
        </Box>
        <Moveable
            target={targetRef}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}
            onDrag={ ( e: OnDrag ) => {

                const top = handlePercentageOverflow( e.top / templateSize.height );
                const left = handlePercentageOverflow( e.left / templateSize.width );

                e.target.style.top = toCssPercentage( top );
                e.target.style.left = toCssPercentage( left );

                // console.log( region );

                handleChange({
                    top,
                    left,
                });
            }}

            useMutationObserver={true}
            useResizeObserver={true}

            resizable={true}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={ ( e: OnResize ) => {

                let width = e.width / templateSize.width;
                let height = e.height / templateSize.height;
                
                const widthPx = width < 1 ?
                    e.width :
                    (1 / width) * e.width;
                                
                const heightPx = height < 1 ?
                    e.height :
                    (1 / height) * e.height;

                width = handlePercentageOverflow( e.width / templateSize.width );
                height = handlePercentageOverflow( e.height / templateSize.height );

                // console.log({
                //     width,
                //     height
                // });

                e.target.style.width = `${widthPx}px`;
                e.target.style.height = `${heightPx}px`;

                const top = e.drag.top / templateSize.height;
                const left = e.drag.left / templateSize.width;

                // console.log({ top, left });
                
                e.target.style.top = toCssPercentage( top );
                e.target.style.left = toCssPercentage( left );

                // console.log(region);

                // console.log({ width, height });
                
                handleChange({
                    width,
                    height,
                    top,
                    left,
                });
            }}
            
        />
    </> )
}