import { useSocketContext } from '../socketIO';
import React, { useState, useEffect } from 'react';
import { ProductCard, IProductCardProps } from '../ProductCard';
import formatTime from '../../utils/formatTime';


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

export function ScannedItems(): React.ReactElement {
    const { mySocket, isConnected } = useSocketContext();
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [scannedItems, setScannedItems] = useState<IScannedItem[]>([]);


    const handleUpdate = (data: any) => {
        if (Array.isArray(data)) {
            for (const item of data) {
                setScannedItems(prevState => [...prevState, item]);
            }
        } else {
            setScannedItems(prevState => [...prevState, data]);
        }
    };


    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(null);
        }
    }, []);



    useEffect(() => {
        if (isConnected) {

            mySocket?.on('data', handleUpdate);
        }

        return () => {
            mySocket?.off('data', handleUpdate);
        }
    }, [isConnected]);



    return isMounted ? (
        <section className="list-container">
            {scannedItems
                .sort((a, b) => toDate(b.addedAt).getTime() - toDate(a.addedAt).getTime())
                .map((item, index) => {
                    const props: IProductCardProps = {
                        barcode: item.productData.barcode[0],
                        scannedAt: formatTime(item.addedAt),
                        name: item.productData.name
                    }
                    return (
                        <ProductCard
                            key={index}
                            {...props}
                        />
                    )
                })}

        </section>
    ) : <></>
}