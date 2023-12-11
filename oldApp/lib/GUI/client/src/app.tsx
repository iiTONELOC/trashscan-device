
import { SocketProvider, Header, ScannedItems, RefreshPage } from './components';



export function App() {
    return (
        <SocketProvider>
            <Header />
            <ScannedItems />
            <RefreshPage />
        </SocketProvider>
    )
}
