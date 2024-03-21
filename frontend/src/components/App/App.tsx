import React, { useEffect, useReducer, useState } from 'react';

import { Intent, Overlay, Position, Spinner, Toaster } from '@blueprintjs/core';

import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/features/theme/themeSlice';
import VisualizerSmtDrawer from '../VisualizerSmtDrawer/VisualizerSmtDrawer';
import Cvc5Output from '../Cvc5Output/Cvc5Output';

const App: React.FC = () => {
    const [dialogIsOpen, setDialogIsOpen] = useState(true);
    const [inTutorial, setInTutorial] = useState(false);
    const [drawerIsOpen, setDrawerOpenState] = useState(true);
    const [smtDrawerIsOpen, setSmtDrawerIsOpen] = useState(true);
    const [, disableAllDrawers] = useReducer(() => {
        if (dialogIsOpen) setDialogIsOpen(false);
        if (inTutorial) setInTutorial(false);
        if (drawerIsOpen) setDrawerOpenState(false);
        if (smtDrawerIsOpen) setSmtDrawerIsOpen(true);
        return null;
    }, null);
    const [smtOptions, setSmtOptions] = useState({ argsType: true, customArgs: '' });
    const darkTheme = useAppSelector(selectTheme);


    // Toaster
    let toaster: Toaster;
    const refHandlers = {
        toaster: (ref: Toaster) => (toaster = ref),
    };

    const addErrorToast = (err: string) => {
        toaster.show({ icon: 'warning-sign', intent: Intent.DANGER, message: err });
    };

    return (
        <div className={darkTheme ? ' bp3-dark' : ''} style={
            { 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flex:'1', 
                justifyContent: 'center', 
                alignItems: 'center'
            }
        }>
            <Toaster position={Position.TOP} ref={refHandlers.toaster} />
            <VisualizerSmtDrawer
                isOpen={true}
                setDrawerIsOpen={setSmtDrawerIsOpen}
                addErrorToast={addErrorToast}
                // smtOptions={smtOptions}
                // setSmtOptions={setSmtOptions}
            />
        </div>
    );
};

export default App;
