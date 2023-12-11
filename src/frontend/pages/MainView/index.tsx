import './MainView.css';
import React from 'preact/compat';
import TrashScanner from '../../app';

export default function MainViewPage(): React.JSX.Element {
    return (
        <section className='MainView'>
            <TrashScanner />
        </section>
    )
}
