import { useRef } from "react";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Moveable, { OnDrag, OnResize } from "react-moveable";
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

    function toCssPercentage( value: number ): string {

        let result = ( value * 100 )

        if ( result > 100 )
            result = 100;

        else if ( result < 0)
            result = 0;

        return result + "%";
    }

    function handleChange( input: {
        width?: number;
        height?: number;
        top?: number;
        left?: number;
    }) {
        const { width, height, top, left } = input;
        onChange({
            ...region,
            size: {
                ...region.size,
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
                e.target.style.top = toCssPercentage( e.top / templateSize.height );
                e.target.style.left = toCssPercentage( e.left / templateSize.width ); 
            }}

            useResizeObserver={true}

            resizable={true}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={ ( e: OnResize ) => {
                e.target.style.width = `${e.width}px`;
                e.target.style.height = `${e.height}px`;
                // e.target.style.transform = e.drag.transform;

                // console.log({
                //     top: e.drag.top,
                //     left: e.drag.left,
                // });

                // e.target.style.width = toCssPercentage( e.width / templateSize.width );
                // e.target.style.height = toCssPercentage( e.height / templateSize.height ); 
                
                e.target.style.top = toCssPercentage( e.drag.top / templateSize.height );
                e.target.style.left = toCssPercentage( e.drag.left / templateSize.width ); 
                
                handleChange({
                    width: e.width / templateSize.width,
                    height: e.height / templateSize.height,
                    top: e.drag.top / templateSize.height,
                    left: e.drag.left / templateSize.width,
                });
            }}
        />
    </> )
}