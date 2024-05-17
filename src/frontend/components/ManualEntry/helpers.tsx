import {IAddedItem} from '../../../backend/landfill/API';

export const handleError = (
  error: string,
  setError: (value: string) => void,
  setHasError: (value: boolean) => void,
): void => {
  setError(error);
  setHasError(true);
};

export type HandleCloseProps = {
  resetComponentState: () => void;
  onClose?: () => void;
};
/**
 * Close the modal and reset the state
 */
export const handleClose = (props: HandleCloseProps): void => {
  props.resetComponentState();
  props.onClose && props.onClose();
};

/**
 * Handle input to the barcode field
 * @param e Input event
 */
export const handleInput = (
  e: React.ChangeEvent<HTMLInputElement>,
  setBarcode: (value: string) => void,
): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  setBarcode(e.target?.value);
};

/**
 * Close the modal on escape key press
 * @param e Keyboard event
 */
export const handleEscape = (
  e: KeyboardEvent,
  resetComponentState: () => void,
  onClose: () => void,
): void => {
  if (e.key === 'Escape') {
    handleClose({resetComponentState, onClose});
  }
};

/**
 * If data exists in the barcode field, listen for enter key press
 * @param e Keyboard event
 */
export const handleEnter = (
  e: KeyboardEvent,
  barcode: string,
  submitProps: HandleManualSubmitProps,
  handleManualSubmit: (submitProps: HandleManualSubmitProps) => Promise<void>,
): Promise<void> => {
  if (e.key === 'Enter' && barcode.length > 0) {
    // do nothing
    return handleManualSubmit(submitProps);
  }
};

export type HandleManualSubmitProps = {
  barcode: string;
  resetComponentState: () => void;
  setError: (error: string) => void;
  setLoading: (isLoading: true) => void;
  setHasError: (hasError: boolean) => void;
  onAdded: (data: IAddedItem['product']) => void;
};
/**
 * Handle the manual submit event
 */
export const handleManualSubmit = async (props: HandleManualSubmitProps): Promise<void> => {
  const {barcode, resetComponentState, setError, setLoading, setHasError} = props;
  // check that the barcode is not empty, and it is an alphanumeric string
  if (barcode.length === 0) {
    handleError('Barcode cannot be empty', setError, setHasError);
    return;
  }

  if (!/^[a-zA-Z0-9]+$/.test(barcode)) {
    handleError('Barcode must be alphanumeric', setError, setHasError);
    return;
  }

  setLoading(true);

  (async () => {
    await window.centralBridge.landFill
      .addItemToUsersDefaultList(barcode.toUpperCase())
      .then(data => {
        resetComponentState();
        data && props.onAdded(data.product);
        !data &&
          (() => {
            throw new Error('No data returned!');
          })();
      })
      .catch((error: Error) => {
        handleError(error.message, setError, setHasError);
      });
  })();
};
