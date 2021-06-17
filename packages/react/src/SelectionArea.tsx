import VanillaSelectionArea from '@vanilla/index';
import {SelectionEvents, SelectionOptions} from '@vanilla/types';
import React, {createRef, useEffect} from 'react';

export interface SelectionAreaProps extends Omit<Partial<SelectionOptions>, 'container'> {
    onBeforeStart?: SelectionEvents['beforestart'];
    onStart?: SelectionEvents['start'];
    onMove?: SelectionEvents['move'];
    onStop?: SelectionEvents['stop'];
}

export const SelectionArea: React.FunctionComponent<SelectionAreaProps> = props => {
    const root = createRef<HTMLDivElement>();

    useEffect(() => {
        const {onBeforeStart, onStart, onMove, onStop, ...opt} = props;
        const selection = new VanillaSelectionArea({
            container: root.current as HTMLElement,
            ...opt
        });

        onBeforeStart && selection.on('beforestart', onBeforeStart);
        onStart && selection.on('start', onStart);
        onMove && selection.on('move', onMove);
        onStop && selection.on('stop', onStop);

        return () => {

        };
    }, [props]);

    return (
        <div ref={root}>
            {props.children}
        </div>
    );
};
