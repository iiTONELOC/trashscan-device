import './ProductCard.css';
import {JSX} from 'preact/compat';
import formatTime from '../../utils/formatTime';
import {useEffect, useState} from 'preact/hooks';
import {IAddedItem} from '../../../backend/landfill/API';

export interface IProductCardProps {
  product: IAddedItem['product'];
  addedAt: string;
  setShowAliasModal: (value: boolean) => void;
  setProductToRename: (value: IAddedItem['product']) => void;
}

export function ProductCard({
  product,
  addedAt,
  setShowAliasModal,
  setProductToRename,
}: IProductCardProps): JSX.Element {
  const scannedAt = addedAt;
  const {productData, productAlias} = product;
  const {name, barcode} = productData;
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState<boolean | null>(null);
  const _headerClass = () =>
    `card-header ${!productAlias && name.includes('not found') ? ' not-found' : ''}`;
  const [headerClass, setHeaderClass] = useState<string>(_headerClass());

  const handleEditButtonClick = () => {
    setShowAliasModal(true);
    setProductToRename && setProductToRename(product);
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(null);
      setFormattedTime('');
    };
  }, []);

  useEffect(() => {
    isMounted && setFormattedTime(formatTime(scannedAt));
  }, [isMounted]);

  useEffect(() => {
    setInterval(() => {
      setFormattedTime(formatTime(scannedAt));
    }, 500);
  }, [isMounted]);

  useEffect(() => {
    setHeaderClass(_headerClass());
  }, [name, productAlias]);

  return isMounted ? (
    <li className={'card'}>
      <header className={headerClass}>
        <h2 className="card-title">{productAlias ?? name}</h2>
      </header>

      <div className="card-body">
        <p className="card-description">Barcode: {barcode[0]} </p>
        <span className="card-action-span">
          <p className="card-created-at">Scanned: {formattedTime}</p>
          <button type={'button'} onClick={handleEditButtonClick}>
            Edit
          </button>
        </span>
      </div>
    </li>
  ) : (
    <></>
  );
}
