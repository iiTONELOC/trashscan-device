import './ScannedItems.css';
import { JSX } from 'preact/compat';
import { useState, useEffect } from 'preact/hooks';
import { ProductCard, IProductCardProps } from '../ProductCard';





export interface IScannedItem {
    addedAt: string;
    productAlias: string | null;
    productData: {
        barcode: string[];
        name: string;
        _id: string;
    }
}

const toDate = (stringDate: string): Date => new Date(stringDate);

export function ScannedItems(): JSX.Element {
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [scannedItems, setScannedItems] = useState<IScannedItem[]>([]);


    const handleUpdate = (data: any) => {
        data = {
            ...data,
            createdAt: new Date(Date.now()).toUTCString()
        }
        setScannedItems(prevState => [...prevState, data]);
    };

    const handleData = (data: any) => {
        for (const item of data) {
            setScannedItems(prevState => [...prevState, item]);
        }
    }



    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(null);
        }
    }, []);


    return isMounted ? (
        <section className="list-container">
            {scannedItems
                .sort((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime())
                .map((item, index) => {
                    const props: IProductCardProps = {
                        barcode: item.productData.barcode[0],
                        scannedAt: item.addedAt,
                        name: item.productData.name
                    }
                    return (
                        <ProductCard
                            key={`${item.addedAt}-${Date.now()}=${index}`}
                            {...props}
                        />
                    )
                })}

        </section>
    ) : <></>
}