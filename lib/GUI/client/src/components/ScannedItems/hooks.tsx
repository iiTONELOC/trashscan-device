import { useState, useEffect, useRef } from 'react';

export interface IScannedItem {
    addedAt: string;
    productAlias: string | null;
    productData: {
        barcode: string[];
        name: string;
        _id: string;
    }
}



const fetchScannedItems = async (): Promise<IScannedItem[]> => {
    try {
        const res = await fetch('/api/scanned-items/all', {
            method: 'GET',
            cache: 'no-store'
        });
        const data = await res.json();
        return data.recentlyScanned;
    } catch (error) {
        console.error(error);
        return [];
    }
}

const fetchUpdatedScannedItems = async (): Promise<IScannedItem[]> => {
    try {
        const res = await fetch(`/api/scanned-items/updated`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        return data.recentlyScanned;
    } catch (error) {
        console.error(error);
        return [];
    }
};


export const useScannedItemHooks = () => {
    const [scannedItems, setScannedItems] = useState<IScannedItem[]>([]);
    const [isMounted, setIsMounted] = useState<boolean | null>(false);
    const [updateInterval, setUpdateInterval] = useState<any>(null);
    const [updaterStarted, setUpdaterStarted] = useState<boolean>(false);

    // required since we are updating state inside an interval, this ensures that
    // we are always using the most recent state. This has to be a design flaw with
    // React since we are using the useState hook and effects. If the reference to the
    // variable goes stale, it doesn't seem like react properly handles it. I shouldn't
    // need to use a ref to get around this. Just like concurrent rendering is only needed
    // in react because of a design flaw, this is also a design flaw.
    const updatedScannedRef = useRef<IScannedItem[]>([]);

    useEffect(() => {
        fetchScannedItems().then(data => {
            setScannedItems(data);
            updatedScannedRef.current = data;
        });
        setIsMounted(true);
        return () => {
            setIsMounted(null);
            updateInterval && clearInterval(updateInterval);
            updaterStarted && setUpdaterStarted(false);
        }
    }, []);

    if (isMounted && updatedScannedRef.current.length > 0 && !updaterStarted) {
        // run our updater every second to look for newly scanned items
        const interval = setInterval(async () => await handleUpdate(), 500);
        setUpdateInterval(interval);
        setUpdaterStarted(true);
    }

    async function handleUpdate() {
        const _scannedItems = await fetchUpdatedScannedItems();

        if (_scannedItems.length > 0) {
            setScannedItems([..._scannedItems, ...updatedScannedRef.current]);
            updatedScannedRef.current = [..._scannedItems, ...updatedScannedRef.current];
        }
    };

    return {
        scannedItems,
        isMounted
    }
}