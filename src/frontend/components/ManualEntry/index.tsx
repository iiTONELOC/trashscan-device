import './manualEntry.css';
import Modal from '../Modal';
import ErrorComponent from './ErrorComponent';
import {IAddedItem} from '../../../backend/landfill/API';
import React, {useRef, useEffect, useState} from 'preact/compat';
import {handleClose, handleInput, handleEnter, handleEscape, handleManualSubmit} from './helpers';

export type ManualEntryProps = {
  title: string;
  setOpen: boolean;
  onClose?: () => void;
  setShow: (value: boolean) => void;
  onAddItem?: (item: IAddedItem['product']) => void;
};

export default function ManualEntry(props: ManualEntryProps): React.JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Handle the submit button click
   */
  const handleSubmit = (): void => {
    barcode.length > 0 &&
      handleManualSubmit({
        barcode,
        resetComponentState,
        setError,
        setLoading,
        setHasError,
        onAdded: props.onAddItem,
      });
  };

  const resetComponentState = (): void => {
    setError('');
    setBarcode('');
    setLoading(false);
    setHasError(false);
    // the input may not exist just yet when this is called
    setTimeout(() => {
      if (props.setOpen) {
        const input = inputRef.current;
        input && input.focus();
      }
    }, 75);
  };

  // Listen for the key combo to open the modal from the keyboard
  useEffect(() => {
    const listenForKeyCombo = (e: KeyboardEvent): void => {
      //cmd + shift + m
      if (e.metaKey && e.shiftKey && (e.key === 'm' || e.key === 'M')) {
        props.setShow(!props.setOpen);
      }
    };

    window.addEventListener('keydown', listenForKeyCombo);

    return () => {
      window.removeEventListener('keydown', listenForKeyCombo);
    };
  }, []);

  // When the component is being shown, reset the state
  // and add an event listener for the escape key
  useEffect(() => {
    const escapeHandler = (e: KeyboardEvent): void =>
      handleEscape(e, resetComponentState, props.onClose);

    if (props.setOpen === true) {
      resetComponentState();

      window.addEventListener('keydown', escapeHandler);
    }
    return () => {
      resetComponentState();
      window.removeEventListener('keydown', escapeHandler);
    };
  }, [props.setOpen]);

  return (
    <Modal
      title={props.title}
      setOpen={props.setOpen}
      onClose={() => handleClose({resetComponentState, onClose: props.onClose})}
      toggleModal={() => props.setShow(!props.setOpen)}
      _ref={modalRef}>
      <>
        {loading ? (
          <div>Loading...</div>
        ) : hasError ? ( //NOSONAR
          <ErrorComponent
            error={error}
            setError={setError}
            setHasError={setHasError}
            resetBarcode={resetComponentState}
          />
        ) : (
          <>
            <label htmlFor="barcode">Barcode</label>
            <input
              type="text"
              ref={inputRef}
              value={barcode}
              placeholder="Enter Barcode"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setBarcode)}
              onKeyDown={(e: KeyboardEvent) =>
                handleEnter(
                  e,
                  barcode,
                  {
                    barcode,
                    resetComponentState,
                    setError,
                    setLoading,
                    setHasError,
                    onAdded: props.onAddItem,
                  },
                  handleManualSubmit,
                )
              }
            />

            {barcode.length > 0 && (
              <span className={'manual-action-buttons-container'}>
                <button
                  type={'button'}
                  onClick={handleSubmit}
                  className={'manual-action-button manual-submit'}>
                  Submit
                </button>

                <button
                  type={'button'}
                  onClick={resetComponentState}
                  className={'manual-action-button manual-cancel'}>
                  Cancel
                </button>
              </span>
            )}
          </>
        )}
      </>
    </Modal>
  );
}
