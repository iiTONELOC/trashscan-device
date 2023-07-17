import './ScannedItems.css';
import { useSocketContext } from '../socketIO';
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

export function ScannedItems(): React.ReactElement {
    const { mySocket, isConnected } = useSocketContext();
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
        fetchScannedItems().then(data => {
            setScannedItems(data);
        });
        return () => {
            setIsMounted(null);
        }
    }, []);


    useEffect(() => {
        if (isConnected) {

            mySocket?.on('update', handleUpdate);
            mySocket?.on('data', handleData);
        }

        return () => {
            mySocket?.off('update', handleUpdate);
            mySocket?.off('data', handleData);
        }
    }, [isConnected]);



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
