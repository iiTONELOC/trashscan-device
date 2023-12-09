export interface IScannedData {
    recentlyScanned: {
        addedAt: string;
        productAlias: string | null;
        productData: {
            barcode: string[];
            name: string;
            _id: string;
        }
    }[]
}


