// Determines if the device's primary input supports touch
// See this article: https://css-tricks.com/touch-devices-not-judged-size/
export const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
