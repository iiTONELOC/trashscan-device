import './BarcodeScanner.css';
import {IAddedItem} from '../../../backend/landfill/API';
import React, {useState, useEffect, useRef} from 'preact/compat';

export function BarcodeScanner(props: {
  onData: (data: IAddedItem['product']) => void;
}): React.JSX.Element {
  const [stopCapTimeout, setStopCapTimeout] = useState<NodeJS.Timeout | null>(null);
  const [stopCapture, setStopCapture] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState<boolean | null>(false);
  const [barcode, setBarcode] = useState<string>('');
  const barcodeRef = useRef<HTMLInputElement>(null);
  const {onData} = props;

  const handleBarcode = (barcode: string) => {
    setBarcode(barcode);
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(null);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      barcodeRef.current?.focus();
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted && barcode.length > 0) {
      if (stopCapTimeout) {
        clearTimeout(stopCapTimeout);
      }
      setStopCapTimeout(
        setTimeout(() => {
          setStopCapture(true);
        }, 250),
      );
    }
  }, [barcode]);

  useEffect(() => {
    if (isMounted && stopCapture) {
      (async () => {
        const added = await window.centralBridge.landFill.addItemToUsersDefaultList(barcode);

        added &&
          (() => {
            onData(added.product);
            setBarcode('');
            setStopCapture(false);
          })();
      })();
      setBarcode('');
      setStopCapture(null);
    }
  }, [stopCapture]);

  return isMounted ? (
    <input
      type="text"
      hidden={true}
      value={barcode}
      ref={barcodeRef}
      title={'Barcode Input'}
      className="Barcode-scanner"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onInput={(e: Event) => handleBarcode(e.currentTarget.value)}
    />
  ) : (
    <></>
  );
}
