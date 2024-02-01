import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export type AlertDialogProps = {
    open: boolean;
    handleClose: () => void;
    title: string;
    message: string;
    okButtonText: string;
    cancelButtonText: string;
    handleOk: () => void;
    handleCancel: () => void;
}

export default function AlertDialog( props: AlertDialogProps ) {

    const {
        title,
        message,
        open,
        handleClose,
        okButtonText,
        cancelButtonText,
    } = props;

    function handleOk() {
        props.handleOk();
        handleClose();
    }

    function handleCancel() {
        props.handleCancel();
        handleClose();
    }
  
    return (
        <Dialog
            open={ open }
            onClose={ handleClose }
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>

            { message &&
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </DialogContent>
            }
            
            <DialogActions>
                <Button onClick={ handleCancel }>
                    {cancelButtonText}
                </Button>
                <Button onClick={ handleOk } autoFocus>
                    {okButtonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}