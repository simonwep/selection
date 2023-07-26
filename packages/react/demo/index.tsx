import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import SelectionArea, {SelectionEvent} from '../src';
import './index.css';

function SelectableArea({boxes, offset, className, withCustomViewport}: {
    boxes: number;
    offset: number;
    className: string;
    withCustomViewport?: boolean;
}) {
    const [selected, setSelected] = useState<Set<number>>(() => new Set());
    const viewportRef = React.useRef<HTMLDivElement>(null);

    const extractIds = (els: Element[]): number[] =>
        els.map(v => v.getAttribute('data-key'))
            .filter(Boolean)
            .map(Number);

    const onStart = ({event, selection}: SelectionEvent) => {
        if (!event?.ctrlKey && !event?.metaKey) {
            selection.clearSelection();
            setSelected(() => new Set());
        }
    };

    const onMove = ({store: {changed: {added, removed}}}: SelectionEvent) => {
        setSelected(prev => {
            const next = new Set(prev);
            extractIds(added).forEach(id => next.add(id));
            extractIds(removed).forEach(id => next.delete(id));
            return next;
        });
    };

    const content = (
      <SelectionArea
        className={`container ${className}`}
        onStart={onStart}
        onMove={onMove}
        viewportRef={withCustomViewport ? viewportRef : undefined}
        selectables=".selectable"
      >
        {new Array(boxes).fill(0).map((_, index) => (
          <div
            className={
              selected.has(index + offset)
                ? 'selected selectable'
                : 'selectable'
            }
            data-key={index + offset}
            key={index + offset}
          />
        ))}
      </SelectionArea>
    );

    return withCustomViewport ? (
      <div ref={viewportRef} className="viewport">
        {content}
      </div>
    ) : (
      content
    );

}

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <React.StrictMode>
        <h1>React</h1>
        <SelectableArea boxes={42} offset={0} className="green"/>
        <SelectableArea boxes={42} offset={42} className="blue"/>
        <SelectableArea boxes={252} offset={82} className="red"/>
        <SelectableArea boxes={252} offset={82} className="red" withCustomViewport/>
    </React.StrictMode>,
);
