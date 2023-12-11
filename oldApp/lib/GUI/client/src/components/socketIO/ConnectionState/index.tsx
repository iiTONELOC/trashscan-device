
import './ConnectionState.css';
import { useSocketContext, ISocketContext } from '../SocketProvider';

export function ConnectionState() {
    const { isConnected }: ISocketContext = useSocketContext();

    return (
        <div className='status'>
            <p>{isConnected ? 'Online' : 'Offline'}</p>
            <span className={`status-circle ${isConnected ? 'online' : 'offline'}`} />
        </div>
    );
}
