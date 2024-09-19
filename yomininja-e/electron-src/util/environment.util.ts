export const isMacOS = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
export const isWindows = process.platform === 'win32';

export const isWaylandDisplay = (
    process.platform === 'linux' &&
    Boolean( process.env.WAYLAND_DISPLAY )
);