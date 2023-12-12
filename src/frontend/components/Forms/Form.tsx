import './Form.css';
import { PropsWithChildren, JSX } from 'preact/compat';


export default function Form({ children }: Readonly<PropsWithChildren>): JSX.Element {
    return (
        <form className='Form-base'>
            {children}
        </form>
    );
}
