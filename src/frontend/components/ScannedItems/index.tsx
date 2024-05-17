import './ScannedItems.css';
import {JSX} from 'preact/compat';
import RenameItem from '../RenameItem';
import ManualEntry from '../ManualEntry';
import {RefreshPage} from '../RefreshButton';
import {BarcodeScanner} from '../BarcodeScanner';
import {useState, useEffect} from 'preact/hooks';
import {IAddedItem} from '../../../backend/landfill/API';
import {ProductCard, IProductCardProps} from '../ProductCard';
export interface IScannedItem extends IAddedItem {
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
  const [showAliasModal, setShowAliasModal] = useState<boolean>(false);
  const [productToRename, setProductToRename] = useState<IAddedItem['product'] | null>(null);

  const handleAddItem = async (data: any) => {
    data = {
      ...data,
      addedAt: new Date(Date.now()).toUTCString(),
    };
    setScannedItems(prevState => [...prevState, data]);
    await window.centralBridge.landFill.addItemToScannedList(data);
  };

  const handleManualEntryModalClose = () => props.setShouldShowManualEntryModal(false);

  const handleRenameItem = () => {
    (async () => {
      const updated = await window.centralBridge.landFill.getScannedList();
      if (updated) {
        setScannedItems(updated);
      }
    })();
  };

  useEffect(() => {
    setIsMounted(true);
    setShowAliasModal(false);
    (async () => {
      const existingItems = await window.centralBridge.landFill.getScannedList();
      if (existingItems) {
        setScannedItems(existingItems);
      }
    })();

    return () => {
      setIsMounted(null);
      setScannedItems([]);
      setShowAliasModal(false);
    };
  }, []);

  useEffect(() => {
    if (!props.shouldShowManualEntryModal) {
      setProductToRename(null);
    }
  }, [props.shouldShowManualEntryModal]);

  return isMounted ? (
    <>
      <div className={'refresh'}>
        <RefreshPage />
      </div>
      <ul className="list-container">
        <BarcodeScanner onData={handleAddItem} />
        {scannedItems
          .toSorted((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime())
          .map(item => {
            const props: IProductCardProps = {
              product: item,
              addedAt: item.addedAt,
              setShowAliasModal,
              setProductToRename,
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
        onAddItem={handleAddItem}
      />

      {/* Alias Modal */}
      <RenameItem
        title="Rename Item"
        setOpen={showAliasModal}
        onClose={() => setShowAliasModal(false)}
        setShow={setShowAliasModal}
        product={{...productToRename}}
        onRenamed={handleRenameItem}
      />
    </>
  ) : (
    <></>
  );
}
