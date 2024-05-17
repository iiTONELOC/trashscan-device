import '../index.css';
import {useState, useEffect} from 'preact/hooks';
import {checkForAddedSettings} from '../utils/API';
import {Header, ScannedItems, Settings} from '../components';

const App = () => {
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [lastSettingAdded, setLastSettingAdded] = useState<string>('');
  const [shouldShowSettingsModal, setShouldShowSettingsModal] = useState<boolean>(false);
  const [shouldShowManualEntryModal, setShouldShowManualEntryModal] = useState<boolean>(false);

  /**
   * Check if all settings have been added
   */
  const checkForSettings = async (): Promise<boolean> => {
    const settings = await checkForAddedSettings();

    setMissingKeys(settings.missing);
    setShouldShowSettingsModal(!settings.found);

    return settings.found;
  };

  /**
   * Handle the settings modal close event
   */
  const handleSettingsModalClose = () => {
    setTimeout(() => {
      checkForSettings();
    }, 250);
  };

  /**
   * When the component mounts check for settings
   */
  useEffect(() => {
    checkForSettings();
  }, []);

  /**
   * When a setting is added, check for settings
   */
  useEffect(() => {
    if (lastSettingAdded && lastSettingAdded.length > 0) {
      checkForSettings();
    }
  }, [lastSettingAdded]);

  return (
    <>
      <Header
        setShouldShowSettingsModal={setShouldShowSettingsModal}
        shouldShowSettingsModal={shouldShowSettingsModal}
        shouldShowManualEntryModal={shouldShowManualEntryModal}
        setShouldShowManualEntryModal={setShouldShowManualEntryModal}
      />
      {/* Main Content */}
      <ScannedItems
        shouldShowManualEntryModal={shouldShowManualEntryModal}
        setShouldShowManualEntryModal={setShouldShowManualEntryModal}
      />

      {/* Modals */}
      <Settings
        title={'Settings'}
        setOpen={shouldShowSettingsModal}
        onClose={handleSettingsModalClose}
        setShow={() => setShouldShowSettingsModal(!shouldShowSettingsModal)}
        missingSettings={{
          missing: missingKeys,
          found: missingKeys.length === 0,
          handleSettingAdded: (setting: string) => setLastSettingAdded(setting),
        }}
      />
    </>
  );
};

export default App;
