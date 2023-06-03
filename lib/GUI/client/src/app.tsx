import React from 'react';
import { SocketProvider, Header } from './components';



export function App() {
    return (
        <SocketProvider>
            <Header />
            <h1>Hello World</h1>
        </SocketProvider>
    )
}
