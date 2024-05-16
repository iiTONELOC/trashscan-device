import '../index.css';
import {useState, useEffect} from 'preact/hooks';
import {VscSettingsGear} from 'react-icons/vsc';
import {checkForAddedSettings} from '../utils/API';
import {Header, ScannedItems, RefreshPage, Settings} from '../components';

const App = () => {
  const [shouldShowModal, setShouldShowModal] = useState<boolean>(false);
  const [lastSettingAdded, setLastSettingAdded] = useState<string>('');
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  const checkForSettings = async (): Promise<boolean> => {
    const settings = await checkForAddedSettings();
    setShouldShowModal(!settings.found);
    setMissingKeys(settings.missing);

    return settings.found;
  };

  // On close, check if all settings have been added
  // If they haven't the model will automagically reopen
  const handleModalClose = () => {
    setTimeout(() => {
      checkForSettings();
    }, 250);
  };

  useEffect(() => {
    checkForSettings();
  }, []);

  // check if the modal should be shown when a new setting is added
  useEffect(() => {
    if (lastSettingAdded && lastSettingAdded.length > 0) {
      checkForSettings();
    }
  }, [lastSettingAdded]);

  return (
    <>
      <Header />
      <RefreshPage />
      <ScannedItems />
      <Settings
        title={'Settings'}
        setOpen={shouldShowModal}
        onClose={handleModalClose}
        setShow={() => setShouldShowModal(!shouldShowModal)}
        missingSettings={{
          missing: missingKeys,
          found: missingKeys.length === 0,
          handleSettingAdded: (setting: string) => setLastSettingAdded(setting),
        }}
      />

      <VscSettingsGear
        /** eslint-disable-next-line @typescript-eslint/ban-ts-comment
         * @ts-ignore */
        className="App-Settings-icon"
        onClick={() => setShouldShowModal(!shouldShowModal)}
      />
    </>
  );
};

export default App;
