import React from 'react';
import { SocketProvider, Header, ScannedItems } from './components';



export function App() {
    return (
        <SocketProvider>
            <Header />
            <ScannedItems />
        </SocketProvider>
    )
}
