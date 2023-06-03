import React from 'react';
import { SocketProvider, ConnectionState } from './components';



export function App() {
    return (
        <SocketProvider>
            <ConnectionState />
            <h1>Hello World</h1>
        </SocketProvider>
    )
}
