import React, { useEffect, useRef } from 'react';
import CursorWhiteSvg from './cursor-no-padding-left-white.svg'
import CursorBlackSvg from './cursor-no-padding-left-black.svg'
import Image  from 'next/image';
import { styled } from '@mui/material';

const CursorImage = styled(Image)({
  position: 'absolute',
  zIndex: -20,
  pointerEvents: 'none'
});

export default function CustomCursor() {

  const windows = navigator.userAgent
    .toLowerCase()
    .includes('windows');

  const CursorSvg = windows ? CursorWhiteSvg : CursorBlackSvg;

  useEffect(() => {
      const cursor = document.getElementById('custom-cursor');
  
      const handleMouseMove = (e: MouseEvent) => {
        if (cursor) {
          cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      };
  
      window.addEventListener('mousemove', handleMouseMove);
  
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
  }, []);

  return (
    <CursorImage id='custom-cursor'
      priority
      src={CursorSvg}
      alt="custom cursor"
      height={100}
    />
  );
}
