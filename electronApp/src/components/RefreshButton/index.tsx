import React from 'react';
import './RefreshButton.css';
import { RefreshIcon } from '../Icons';


export function RefreshPage(): React.ReactElement {

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
