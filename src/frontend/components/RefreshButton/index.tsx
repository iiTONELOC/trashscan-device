import './RefreshButton.css';
import { JSX } from 'preact/compat';
import { RefreshIcon } from '../Icons';


export function RefreshPage(): JSX.Element {

    const refreshPage = () => {
        window.location.reload();
    }

    return (
        <button
            className="refresh-button"
            type="button"
            onClick={refreshPage}
        >
            <RefreshIcon />
        </button>
    );
}
