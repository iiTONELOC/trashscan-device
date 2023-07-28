export interface IScannedData {
    recentlyScanned: {
        _id: string;
        addedAt: string;
        productAlias: string | null;
        productData: {
            barcode: string[];
            name: string;
            _id: string;
        }
    }[]
}


