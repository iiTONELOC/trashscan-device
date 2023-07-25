import { Socket } from 'socket.io-client';
import { socket } from '../../utils/socket';
import React, {
    useState, useEffect, PropsWithChildren,
    ReactElement, createContext, Context
} from 'react';


export interface ISocketContext {
    isConnected: boolean;
    mySocket: Socket | null;
}

//  create the context
const SocketContext: Context<ISocketContext> = createContext<ISocketContext>({
    isConnected: false,
    mySocket: null
});

//  access the Provider component from the context
const { Provider }: Context<ISocketContext> = SocketContext;

const fourMinutes = 240000;

function SocketProvider({ ...props }: PropsWithChildren<{}>): ReactElement {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [mySocket, setMySocket] = useState<Socket | null>(socket);

    const onConnect = (): void => {
        setIsConnected(true);
        setMySocket(socket);
        socket.connect();
    }

    const onDisconnect = (): void => {
        setIsConnected(false);
        socket.disconnect();
    }

    const refreshSocket = () => {
        return setInterval(() => {
            socket.disconnect();
            socket.connect();
        }, fourMinutes);
    };


    useEffect(() => {
        // register our connect/disconnect events and their handlers
        mySocket?.on('connect', onConnect);
        mySocket?.on('disconnect', onDisconnect);

        // refresh the socket connection every 4 minutes so it
        // doesn't get stale
        const refreshInterval = refreshSocket();

        // clean up registered events and intervals when the component unmounts
        return () => {
            mySocket?.off('connect', onConnect);
            mySocket?.off('disconnect', onDisconnect);
            setMySocket(null);
            clearInterval(refreshInterval);
        };
    }, []);

    return (
        <Provider value={{ isConnected, mySocket }} {...props} />
    );
}

// create a consumer to access the context
const useSocketContext = (): ISocketContext => React.useContext(SocketContext);

// export the provider and the consumer
export { useSocketContext, SocketProvider };
