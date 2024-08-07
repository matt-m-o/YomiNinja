
export type InAppNotification = {
    type: 'info' | 'error';
    message: string;
    autoHideDuration?: number;
};