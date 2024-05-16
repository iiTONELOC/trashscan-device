import './ScannedItems.css';
import {JSX} from 'preact/compat';
import {BarcodeScanner} from '../BarcodeScanner';
import {useState, useEffect} from 'preact/hooks';
import {ProductCard, IProductCardProps} from '../ProductCard';

export interface IScannedItem {
  addedAt: string;
  productAlias: string | null;
  productData: {
    barcode: string[];
    name: string;
    _id: string;
  };
}

const toDate = (stringDate: string): Date => new Date(stringDate);

export function ScannedItems(): JSX.Element {
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
    <section className="list-container">
      <BarcodeScanner onData={handleUpdate} />
      {scannedItems
        .toSorted((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime())
        .map((item, index) => {
          const props: IProductCardProps = {
            barcode: item.productData.barcode[0],
            scannedAt: item.addedAt,
            name: item.productAlias ?? item.productData.name,
          };
          return <ProductCard key={`${item.productData._id}-${index}`} {...props} />;
        })}
    </section>
  ) : (
    <></>
  );
}
