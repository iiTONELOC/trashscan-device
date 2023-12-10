import { getUserProfile, UserProfile } from '../../utils';

export type ISettingProps = {
    label: string;
}



export function Setting(props: Readonly<ISettingProps>) {
    const userProfile = getUserProfile() ?? {
        username: 'null',
        password: 'null',
        deviceKey: 'null'
    };
    const setting = userProfile[props.label as keyof UserProfile ?? null]
    return (
        <div className={'setting'}>
            <label className={'setting-label'}>{props.label}</label>
            <div className={'setting-input-container'}>
                <input className={'setting-input'} />
            </div>
        </div>
    )
}
