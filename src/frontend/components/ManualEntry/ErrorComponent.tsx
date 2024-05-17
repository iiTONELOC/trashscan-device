import React, {useEffect, useState} from 'preact/compat';

export default function ErrorComponent(
  props: Readonly<{
    error: string;
    setError: (value: string) => void;
    setHasError: (value: boolean) => void;
    resetBarcode: () => void;
  }>,
): React.JSX.Element {
  const [secondsRemaining, setsecondsRemaining] = useState<number>(5);

  const handleClicked = () => {
    props.setError('');
    props.setHasError(false);
    props.resetBarcode();
    setsecondsRemaining(5);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setsecondsRemaining(prevState => prevState - 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });

  useEffect(() => {
    if (secondsRemaining === 0) {
      handleClicked();
    }
  }, [secondsRemaining]);

  return (
    <>
      <div className={'manual-error-container'}>
        <p className={'manual-error'}>Error: {props.error}</p>
      </div>

      <footer className={'manual-error-btn-container'}>
        <button
          type={'button'}
          className={'manual-action-button manual-close'}
          onClick={handleClicked}>
          Retry in {secondsRemaining} seconds
        </button>
      </footer>
    </>
  );
}
