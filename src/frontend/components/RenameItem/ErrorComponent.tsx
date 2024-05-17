import React, {useEffect, useState} from 'preact/compat';

export default function RenameErrorComponent(
  props: Readonly<{
    error: string;
    setError: (value: string) => void;
    setHasError: (value: boolean) => void;
    resetAlias: () => void;
  }>,
): React.JSX.Element {
  const [secondsRemaining, setsecondsRemaining] = useState<number>(5);

  const handleClicked = () => {
    props.setError('');
    props.setHasError(false);
    props.resetAlias();
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
      <div className={'rename-error-container'}>
        <p className={'rename-error'}>Error: {props.error}</p>
      </div>

      <footer className={'rename-error-btn-container'}>
        <button
          type={'button'}
          className={'rename-action-button rename-close'}
          onClick={handleClicked}>
          Retry in {secondsRemaining} seconds
        </button>
      </footer>
    </>
  );
}
