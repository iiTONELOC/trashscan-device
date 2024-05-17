import './renameItem.css';
import Modal from '../Modal';
import {IAddedItem} from '../../../backend/landfill/API';
import ErrorComponent from '../ManualEntry/ErrorComponent';
import React, {useRef, useEffect, useState} from 'preact/compat';
import {handleEscape, handleClose, handleInput} from '../ManualEntry/helpers';

export type RenameItemProps = {
  title: string;
  setOpen: boolean;
  onClose?: () => void;
  setShow: (value: boolean) => void;
  onRenamed?: () => void;
  product: IAddedItem['product'];
};

export default function RenameItem(props: RenameItemProps): React.JSX.Element {
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [alias, setAlias] = useState<string | null>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  /**
   * Handle the submit button click
   */
  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    if (alias.trim().length === 0) {
      setHasError(true);
      setError('Alias is required');
      return;
    }

    // only allow a basic set of characters
    const regex = /^[a-zA-Z0-9 -_\\.,;!?]*$/;
    if (!regex.test(alias)) {
      setHasError(true);
      setError('Invalid characters in alias');
      return;
    }

    await window.centralBridge.landFill
      .editItemInScannedList({...props.product, productAlias: alias})
      .then(() => {
        setLoading(false);
        props.setShow(false);
        props?.onRenamed();
      })
      .catch((e: Error) => {
        setHasError(true);
        setError(e.message);
        setLoading(false);
      });

    return;
  };

  const resetComponentState = (): void => {
    setError('');
    setAlias('');
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

  const handleEnter = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' && alias.trim().length > 0) {
      handleSubmit();
    }
  };

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
            <label htmlFor="barcode">Rename Product</label>
            <input
              type="text"
              ref={inputRef}
              value={alias}
              placeholder="Enter Barcode"
              onInput={(e: React.ChangeEvent<HTMLInputElement>) => handleInput(e, setAlias)}
              onKeyDown={handleEnter}
            />

            {alias.length > 0 && (
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
