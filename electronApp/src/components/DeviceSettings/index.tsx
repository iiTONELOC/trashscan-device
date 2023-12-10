import './DeviceSettings.css'
import { getUserProfile, generateUUID } from '../../../src/utils';
import { Setting } from './Setting';

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
