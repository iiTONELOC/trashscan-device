import React, { useEffect } from 'react';
import formatTime from '../../utils/formatTime';


export interface IProductCardProps {
    barcode: string;
    scannedAt: string;
    name: string;
}



export function ProductCard({ barcode, scannedAt, name }: IProductCardProps): React.ReactElement<IProductCardProps> {
    const [isMounted, setIsMounted] = React.useState<boolean | null>(null);
    const headerClass = `card-header ${name.includes('not found') ? ' not-found' : ''}`

    useEffect(() => {
        setIsMounted(true);

        return () => {
            setIsMounted(null);
        }
    }, []);

    return isMounted ? (

        <div className="card text-shadow">
            <header className={headerClass}>
                <h2 className="card-title">
                    {name}
                </h2>
            </header>

            <div className="card-body">
                <p className="card-description">Barcode:{barcode} </p>
                <p className="card-created-at">Scanned: {scannedAt}</p>
            </div>
        </div>

    ) : <></>;
}