/* eslint-disable no-use-before-define */
import VanillaSelectionArea from '@viselect/vanilla';
import {SelectionEvents, SelectionOptions} from '@viselect/vanilla';
import React, {createRef, useEffect, createContext, useContext, useState} from 'react';

export interface SelectionAreaProps extends Omit<Partial<SelectionOptions>, 'boundaries'>, React.HTMLAttributes<HTMLDivElement> {
    id?: string;
    className?: string;
    onBeforeStart?: SelectionEvents['beforestart'];
    onBeforeDrag?: SelectionEvents['beforedrag'];
    onStart?: SelectionEvents['start'];
    onMove?: SelectionEvents['move'];
    onStop?: SelectionEvents['stop'];
    viewportRef?: React.RefObject<HTMLDivElement>;
}

const SelectionContext = createContext<VanillaSelectionArea  | undefined>(undefined);

export const useSelection = () => useContext(SelectionContext);

export const SelectionArea: React.FunctionComponent<SelectionAreaProps> = props => {
    const [selectionState, setSelection] = useState<VanillaSelectionArea | undefined>(undefined);
    const root = props.viewportRef ?? createRef<HTMLDivElement>();

    useEffect(() => {
        const {onBeforeStart, onBeforeDrag, onStart, onMove, onStop, viewportRef, ...opt} = props;
        const areaBoundaries = root.current;

        if (!areaBoundaries) {
            return;
        }

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
    }, [root.current]);

    return (
        <SelectionContext.Provider value={selectionState}>
            <div ref={root} className={props.className} id={props.id}>
                {props.children}
            </div>
        </SelectionContext.Provider>
    );
};
