import React, { useState, useEffect, PropsWithChildren, ReactElement, createContext, Context } from 'react';
import { socket } from '../../utils/socket';
import { Socket } from 'socket.io-client';


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


function SocketProvider({ ...props }: PropsWithChildren<{}>): ReactElement {
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
    const [mySocket, setMySocket] = useState<Socket | null>(socket);


    useEffect(() => {
        const onConnect = (): void => {
            setIsConnected(true);
            setMySocket(socket);
            socket.connect();
        }

        const onDisconnect = (): void => {
            setIsConnected(false);
            socket.disconnect();
        }

        mySocket?.on('connect', onConnect);
        mySocket?.on('disconnect', onDisconnect);


        return () => {
            mySocket?.off('connect', onConnect);
            mySocket?.off('disconnect', onDisconnect);
            setMySocket(null)
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
