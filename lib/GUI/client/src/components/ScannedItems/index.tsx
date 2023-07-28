import React from 'react';
import './ScannedItems.css';
import { useScannedItemHooks } from './hooks';
import { ProductCard, IProductCardProps } from '../ProductCard';

const toDate = (stringDate: string): Date => new Date(stringDate);

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
