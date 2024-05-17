import './ScannedItems.css';
import {JSX} from 'preact/compat';
import ManualEntry from '../ManualEntry';
import {RefreshPage} from '../RefreshButton';
import {BarcodeScanner} from '../BarcodeScanner';
import {useState, useEffect} from 'preact/hooks';
import {ProductCard, IProductCardProps} from '../ProductCard';

export interface IScannedItem {
  addedAt: string;
  productAlias: string | null;
  productData: {
    barcode: string[];
    name: string;
  };
  _id: string;
}

export type ScannedItemsProps = {
  shouldShowManualEntryModal: boolean;
  setShouldShowManualEntryModal: (value: boolean) => void;
};

const toDate = (stringDate: string): Date => new Date(stringDate);

export function ScannedItems(props: ScannedItemsProps): JSX.Element {
  const [isMounted, setIsMounted] = useState<boolean | null>(false);
  const [scannedItems, setScannedItems] = useState<IScannedItem[]>([]);

  const handleUpdate = async (data: any) => {
    data = {
      ...data,
      addedAt: new Date(Date.now()).toUTCString(),
    };
    setScannedItems(prevState => [...prevState, data]);
    await window.centralBridge.landFill.addItemToScannedList(data);
  };

  const handleManualEntryModalClose = () => props.setShouldShowManualEntryModal(false);

  useEffect(() => {
    setIsMounted(true);
    (async () => {
      const existingItems = await window.centralBridge.landFill.getScannedList();
      if (existingItems) {
        setScannedItems(existingItems);
      }
    })();

    return () => {
      setIsMounted(null);
    };
  }, []);

  return isMounted ? (
    <>
      <div className={'refresh'}>
        <RefreshPage />
      </div>
      <ul className="list-container">
        <BarcodeScanner onData={handleUpdate} />
        {scannedItems
          .toSorted((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime())
          .map(item => {
            const props: IProductCardProps = {
              barcode: item.productData.barcode[0],
              scannedAt: item.addedAt,
              name: item.productAlias ?? item.productData.name,
            };
            return <ProductCard key={`${item._id}-${item.addedAt}`} {...props} />;
          })}
      </ul>
      {/* Manual Entry Modal */}
      <ManualEntry
        title="Manual Entry"
        setOpen={props.shouldShowManualEntryModal}
        onClose={handleManualEntryModalClose}
        setShow={props.setShouldShowManualEntryModal}
        onAddItem={handleUpdate}
      />
    </>
  ) : (
    <></>
  );
}
