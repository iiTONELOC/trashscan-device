import './ScannedItems.css';
import React, { useState, useEffect } from 'react';
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

const fetchScannedItems = async (): Promise<IScannedItem[]> => {
    try {
        const res = await fetch('/api/scanned-items');
        const data = await res.json();
        return data.recentlyScanned;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const useScannedItemHooks = () => {
    const [scannedItems, setScannedItems] = useState<IScannedItem[]>([]);
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [isIntervalSet, setIsIntervalSet] = useState<boolean>(false);
    const [wasUpdated, setWasUpdated] = useState<boolean>(false);


    const handleData = (data: any) => {
        setScannedItems(data);
    };

    useEffect(() => {
        setIsMounted(true);
        fetchScannedItems().then(data => handleData(data));

        return () => {
            setIsMounted(null);
        }
    }, []);

    async function handleUpdate() {
        const _scannedItems = await fetchScannedItems()
        const numberOfScannedItems = _scannedItems.length;
        const currentNumberOfScannedItems = scannedItems.length;


        if (isMounted && currentNumberOfScannedItems < numberOfScannedItems && !wasUpdated) {
            setScannedItems(_scannedItems);
            setWasUpdated(true);
        } else {
            setWasUpdated(false);
        }
    };

    useEffect(() => {
        let interval: any;

        if (isMounted && !isIntervalSet && scannedItems.length > 0) {
            setIsIntervalSet(true);
            interval && clearInterval(interval);
            // polls every second for new product scans
            interval = setInterval(() => {
                handleUpdate().then().catch(console.error);
            }, 1000);
        } else {
            setIsIntervalSet(false);
        }
        return () => {
            clearInterval(interval);
            setIsIntervalSet(false);
        }
    }, [isMounted, scannedItems]);


    return {
        scannedItems,
        isMounted
    }
}

export function ScannedItems(): React.ReactElement {
    const { scannedItems, isMounted } = useScannedItemHooks();

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
