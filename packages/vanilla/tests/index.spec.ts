import {default as SelectionArea} from "../src";
import "./index.css";

import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent} from "@vitest/browser/context";
import { fireEvent } from "@testing-library/dom";
import { aw } from "vitest/dist/chunks/reporters.DAfKSDh5.js";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const OFFSET = 10;

const boxes: [string, number][] = [
  ["section.green", 42],
  ["section.blue", 42],
  ["section.red", 252],
];

const buildBoxes = function () {
  for (const [sel, items] of boxes) {
    const container = document.querySelector(sel);
    for (let i = 0; i < items; i++) {
      let element = document.createElement("div");
      if (i == 0) {
        element.classList.add("first");
      } else if (i == items - 1) {
        element.classList.add("last");
      }
      container?.appendChild(element);
    }
  }
};

describe("Simple selection", async () => {
  beforeEach(() => {
    document.body.id = 'root';
    document.body.innerHTML =
      '<h1>Vanilla</h1><section class="container green"></section><section class="container blue"></section><section class="container red"></section>';
    buildBoxes();
  });

  it("Should create selection area", async () => {
    const selection = new SelectionArea({
      selectables: ['body > section > div'],
      boundaries: ['body > section'],
      behaviour: {
        startThreshold: 0,
      },
      features: {
          singleTap: {allow: true},
          deselectOnBlur: true,
      }
    }).on('start', ({store, event}) => {

      if (!(event as MouseEvent).ctrlKey && !(event as MouseEvent).metaKey) {
  
          for (const el of store.stored) {
              el.classList.remove('selected');
          }
  
          selection.clearSelection();
      }
  
  }).on('move', ({store: {changed: {added, removed}}}) => {

    for (const el of added) {
        el.classList.add('selected');
    }

    for (const el of removed) {
        el.classList.remove('selected');
    }
});

    // Find green container
    const greenContainer = document.querySelector('.green');
    const greenRect = greenContainer?.getBoundingClientRect();
   
    // Find start of green container, and middle X
    const startX = greenRect?.left + OFFSET, startY = greenRect?.top + OFFSET, middleX = startX + greenRect?.width / 2;
    const endX = greenRect?.left + greenRect?.width;
    const endY = greenRect?.top + greenRect?.height;

    const firstGreen = document.querySelector('.green > .first');
    const lastGreen = document.querySelector('.green > .last');
   
    fireEvent.mouseDown(greenContainer, { clientX: startX, clientY: startY });
    await sleep(100);

    // Moving the mouse to middle x
    fireEvent(document, new MouseEvent('mousemove', { clientX: middleX, clientY: endY,  bubbles: true,
         cancelable: true, }));
    await sleep(100);

    // Moving to end x & y
    fireEvent(document, new MouseEvent('mousemove', { clientX: endX, clientY: endY,  bubbles: true,
      cancelable: true, }));
      
    // Releasing mouse down
    fireEvent.mouseUp(greenContainer, { clientX: endX, clientY: endY });

    expect(selection.getSelection().length).eq(24, 'Not matching selected elements');
  });

});

// Should
