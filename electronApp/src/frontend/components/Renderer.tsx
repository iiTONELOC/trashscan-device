import TrashScanner from '../app/index';
import { getUserProfile } from '../utils';
import ConfigureApp from './configureApp';




export function HandleRender() {
    const userProfile = getUserProfile();
    if (userProfile) {
        return <TrashScanner />;
    } else {
        return <ConfigureApp />;
    }
}
