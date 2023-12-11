import { useRef } from "react";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Moveable from "react-moveable";
import { Box } from "@mui/material";


export type OcrTargetRegionProps = {
    region: OcrTargetRegionJson;
};


export default function OcrTargetRegion( props: OcrTargetRegionProps  ) {

    const targetRef = useRef<HTMLDivElement>(null);

    const { region } = props;

    const { position, size } = region;

    function toCssPercentage( value: number ): string {
        return ( value * 100 ) + "%";
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
            <div className="target">
                Region
            </div>

        </Box>
        
        <Moveable
            target={targetRef}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}
            onDrag={e => {
                e.target.style.transform = e.transform;
                console.log(e.transform);
            }}

            useResizeObserver={true}

            resizable={true}
            throttleResize={1}
            renderDirections={["nw","n","ne","w","e","sw","s","se"]}
            onResize={ e => {
                // e.target.style.width = `${e.width}px`;
                // e.target.style.height = `${e.height}px`;
                // e.target.style.transform = e.drag.transform;

                console.log(e.transform);

                e.target.style.cssText += `width: ${e.width}px; height: ${e.height}px`;
                e.target.style.transform = e.drag.transform;
            }}
        />
    </> )
}