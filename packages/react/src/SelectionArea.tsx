/* eslint-disable no-use-before-define */
import VanillaSelectionArea from '@viselect/vanilla';
import {SelectionEvents, SelectionOptions} from '@viselect/vanilla';
import React, {useEffect, createContext, useContext, useRef, useState} from 'react';

export interface SelectionAreaProps extends Partial<SelectionOptions>, React.HTMLAttributes<HTMLDivElement> {
    id?: string;
    className?: string;
    onBeforeStart?: SelectionEvents['beforestart'];
    onBeforeDrag?: SelectionEvents['beforedrag'];
    onStart?: SelectionEvents['start'];
    onMove?: SelectionEvents['move'];
    onStop?: SelectionEvents['stop'];
}

const SelectionContext = createContext<VanillaSelectionArea  | undefined>(undefined);

export const useSelection = () => useContext(SelectionContext);

export const SelectionArea: React.FunctionComponent<SelectionAreaProps> = props => {
    const [selectionState, setSelection] = useState<VanillaSelectionArea | undefined>(undefined);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {boundaries, onBeforeStart, onBeforeDrag, onStart, onMove, onStop, ...opt} = props;
        const areaBoundaries = boundaries ? boundaries : (root.current as HTMLElement);

        const selection = new VanillaSelectionArea({
            boundaries: areaBoundaries,
            ...opt
        });

        selection.on('beforestart', evt => props.onBeforeStart?.(evt));
        selection.on('beforedrag', evt => props.onBeforeDrag?.(evt));
        selection.on('start', evt => props.onStart?.(evt));
        selection.on('move', evt => props.onMove?.(evt));
        selection.on('stop', evt => props.onStop?.(evt));

        setSelection(selection);

        return () => {
            selection.destroy();
            setSelection(undefined);
        };
    }, []);

    return (
        <SelectionContext.Provider value={selectionState}>
            {props.boundaries ? (
                props.children
            ) : (
                <div ref={root} className={props.className} id={props.id}>
                    {props.children}
                </div>
            )}
        </SelectionContext.Provider>
    );
};
