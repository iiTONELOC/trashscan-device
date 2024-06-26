import {VscEye, VscEyeClosed} from 'react-icons/vsc';
import SaveAndCancelButtons from '../SaveAndCancelButtons';
import {useEffect, useRef} from 'preact/hooks';

export interface ISettingInputProps {
  name: string;
  editorValue: string;
  showEditorValue: boolean;
  handleCancelSetting: () => void;
  handleSaveSetting: (e: Event) => Promise<void>;
  handleEditorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleShowEditorValue: (e: Event) => void;
}

export default function SettingInput(props: ISettingInputProps): React.JSX.Element {
  const {
    name,
    editorValue,
    showEditorValue,
    handleCancelSetting,
    handleSaveSetting,
    handleEditorChange,
    handleShowEditorValue,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="Setting-editor">
      <span>
        <label htmlFor={name}>Enter your {name} here:</label>
        <span className="Setting-input-control">
          {
            <>
              {showEditorValue ? (
                <button className="Setting-view-btn" onClick={handleShowEditorValue}>
                  <VscEye />
                </button>
              ) : (
                <button className="Setting-view-btn" onClick={handleShowEditorValue}>
                  <VscEyeClosed />
                </button>
              )}
              <input
                id={name}
                ref={inputRef}
                type={showEditorValue ? 'text' : 'password'}
                value={editorValue}
                required
                onChange={handleEditorChange}
              />
            </>
          }
        </span>
      </span>
      <SaveAndCancelButtons onSave={handleSaveSetting} onCancel={handleCancelSetting} />
    </div>
  );
}
