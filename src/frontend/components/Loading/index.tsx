import Spinner from '../Spinner';
import { JSX } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

const SpinnerStyles = {
    greenText: 'Spinner-green-text',
    yellowText: 'Spinner-yellow-text',
    orangeText: 'Spinner-orange-text',
    redText: 'Spinner-red-text'
};

const THREE_SECONDS = 3000;

export type LoadingProps = {
    label?: string;
}

export default function Loading(props: Readonly<LoadingProps>): JSX.Element {
    const [spinnerColor, setSpinnerColor] = useState<string>(SpinnerStyles.greenText);

    const threeSecTimeout = (): NodeJS.Timeout => setTimeout(() => {
        setSpinnerColor(SpinnerStyles.yellowText);
        sixSecTimeout();
    }, THREE_SECONDS);

    const sixSecTimeout = (): NodeJS.Timeout => setTimeout(() => {
        setSpinnerColor(SpinnerStyles.orangeText);
        nineSecTimeout();
    }, THREE_SECONDS);

    const nineSecTimeout = (): NodeJS.Timeout => setTimeout(() => {
        setSpinnerColor(SpinnerStyles.redText);
    }, THREE_SECONDS);

    const updateLoader = (): NodeJS.Timeout => threeSecTimeout();

    const clearTimeouts = (): void => {
        clearTimeout(threeSecTimeout());
        clearTimeout(sixSecTimeout());
        clearTimeout(nineSecTimeout());
    };

    useEffect(() => {
        updateLoader();
        return () => clearTimeouts();
    }, []);

    return (
        <Spinner textColor={spinnerColor} label={props.label} />
    );
}
