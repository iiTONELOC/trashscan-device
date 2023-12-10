import './DeviceSettings.css'
import { Setting } from './Setting';
import { getUserProfile } from '../../utils';
import { generateUUID } from '../../../../src/utils/uuid';

export function DeviceSettings() {
    const userProfile = getUserProfile() ?? {
        username: 'null',
        password: 'null',
        deviceKey: 'null'
    };
    const settings = [...Object.keys(userProfile)]
    console.log(settings);

    return (
        <div className={'configure-container'}>
            <h1>TrashScanner Configuration Settings</h1>

            <section className={'configure-settings'}>
                {settings?.map(setting => {
                    return (
                        <Setting
                            key={generateUUID()}
                            label={setting} />
                    )
                })}
            </section>
        </div>
    )
}
