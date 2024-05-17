import './Header.css';
import {VscSettingsGear} from 'react-icons/vsc';
import {JSX, useState, useEffect} from 'preact/compat';

export type HeaderProps = {
  setShouldShowSettingsModal: (value: boolean) => void;
  shouldShowSettingsModal: boolean;
  shouldShowManualEntryModal: boolean;
  setShouldShowManualEntryModal: (value: boolean) => void;
};

export function Header(props: Readonly<HeaderProps>): JSX.Element {
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }),
  );
  const [currentDate, setCurrentDate] = useState<string>(
    // format the date as Day of the Week, Month, Year
    new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: '2-digit',
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });
      setCurrentTime(newTime);
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const newDate = new Date().toLocaleDateString('en-US');
      setCurrentDate(newDate);
    };

    const timer = setInterval(() => {
      updateDate();
    }, 1000 * 60 * 60);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="header">
      <p className={'current-date'}>{currentDate}</p>
      <p className="current-time">{currentTime}</p>

      <section className="header-section">
        <button
          type={'button'}
          className={'manual-entry-btn'}
          onClick={() => props.setShouldShowManualEntryModal(!props.shouldShowManualEntryModal)}>
          Manual Entry
        </button>
        <VscSettingsGear
          /** eslint-disable-next-line @typescript-eslint/ban-ts-comment
           * @ts-ignore */
          className="App-Settings-icon"
          onClick={() => props.setShouldShowSettingsModal(!props.shouldShowSettingsModal)}
        />
      </section>
    </div>
  );
}
