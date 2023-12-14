import { MutableRefObject, useRef } from "react";
import { OcrTargetRegionJson } from "../../../electron-src/@core/domain/ocr_template/ocr_target_region/ocr_target_region";
import Moveable, { OnDrag, OnDragEnd, OnResize, OnResizeEnd } from "react-moveable";
import { Box, debounce } from "@mui/material";
import { Size } from "electron";


export type OcrTargetRegionProps = {
    ocrTemplateElementId: string;
    region: OcrTargetRegionJson;
    templateSize: Size;
    onChange: ( region: OcrTargetRegionJson ) => void;
    onClick?: () => void;
    moveableRef: MutableRefObject<Moveable<{}>>;
    isSelected: boolean;
};


export default function OcrTargetRegion( props: OcrTargetRegionProps  ) {

    const targetRef = useRef<HTMLDivElement>(null);

    const {
        region,
        ocrTemplateElementId,
        templateSize,
        onChange,
        onClick,
        moveableRef,
        isSelected
    } = props;

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

    const handleChange = debounce( ( input: {
        width?: number;
        height?: number;
        top?: number;
        left?: number;
    }) => {
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
    }, 250 );

    return ( <>
        <div id={region.id} ref={targetRef} className='ocr-region'
            onClick={ onClick }
            style={{
                position: 'absolute', // relative
                top: toCssPercentage(position.top),
                left: toCssPercentage(position.left),
                width: toCssPercentage(size.width),
                height: toCssPercentage(size.height),
                // border: 'solid 2px rgba(50, 147, 227, 1)',
                zIndex: 10,
                maxWidth: "auto",
                maxHeight: "auto",
                minWidth: "auto",
                minHeight: "auto",
                backgroundColor: isSelected ? 'rgb(50 147 227 / 66%)' : 'transparent'
            }}
        />
        <Moveable
            ref={moveableRef}
            target={targetRef}
            draggable={true}
            throttleDrag={1}
            edgeDraggable={false}
            startDragRotate={0}
            throttleDragRotate={0}          
            bounds={{ "left": 0, "top": 0, "right": 0, "bottom": 0, "position": "css" }}
            hideDefaultLines={false}
            snappable={true}
            scrollable={true}
            origin={false}
            onDrag={ ( e: OnDrag ) => {

                const top = handlePercentageOverflow( e.top / templateSize.height );
                const left = handlePercentageOverflow( e.left / templateSize.width );

                e.target.style.top = toCssPercentage( top );
                e.target.style.left = toCssPercentage( left );
            }}
            onDragEnd={ ( e: OnDragEnd ) => {

                const { lastEvent } = e;

                if ( !lastEvent ) return;

                handleChange({
                    top: handlePercentageOverflow( lastEvent.top / templateSize.height ),
                    left: handlePercentageOverflow( lastEvent.left / templateSize.width ),
                });

                // console.log(templateSize);
                // console.log( region );
            }}

            useMutationObserver={true}
            useResizeObserver={true}

            resizable={{
                edge: ["nw","n","ne","w","e","sw","s","se"],
                renderDirections: ["nw","n","ne","w","e","sw","s","se"],
            }}
            controlPadding={20}
            throttleResize={1}
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

                if ( region.size.width !== width )
                    e.target.style.width = `${widthPx}px`;

                if ( region.size.height !== height )
                    e.target.style.height = `${heightPx}px`;

                const top = e.drag.top / templateSize.height;
                const left = e.drag.left / templateSize.width;

                // console.log({ top, left });
                
                e.target.style.top = toCssPercentage( top );
                e.target.style.left = toCssPercentage( left );

                // console.log(region);
                // console.log(templateSize);
                
            }}

            onResizeEnd={ ( e: OnResizeEnd ) => {

                const { lastEvent } = e;

                if ( !lastEvent ) return;

                let width = lastEvent.width / templateSize.width;
                let height = lastEvent.height / templateSize.height;

                width = handlePercentageOverflow( lastEvent.width / templateSize.width );
                height = handlePercentageOverflow( lastEvent.height / templateSize.height );

                // console.log({
                //     width,
                //     height
                // });

                const top = lastEvent.drag.top / templateSize.height;
                const left = lastEvent.drag.left / templateSize.width;

                // console.log({ top, left });
                // console.log(region);
                // console.log(templateSize);
                
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