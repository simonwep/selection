import { Modifier, Trigger } from "../types";

type MouseEventModifierProperty = Extract<keyof MouseEvent, "altKey" | "ctrlKey" | "metaKey" | "shiftKey">;

/**
 * Determines whether a MouseEvent should execute until completion depending on 
 * which button and modifier(s) are active for the MouseEvent. 
 * The Event will execute to completion if ANY of the triggers "matches"
 * @param event MouseEvent that should be checked
 * @param triggers A list of Triggers that signify that the event should execute until completion
 * @returns Whether the MouseEvent should execute until completion
 */
export function shouldTrigger(event: MouseEvent, triggers: Trigger[]): boolean {
    for (const trigger of triggers) {
        // The trigger requires only a specific button to be pressed
        if (typeof trigger === "number") {
            if (event.button === trigger) return true;
        }

        // The trigger requires a specific button to be pressed AND some modifiers
        if (typeof trigger === "object") {
            const reqButtonIsPressed = trigger.button === event.button;
            const allReqModifiersArePressed = trigger.modifiers.reduce((doActivate, modifier) => {
                const prop = modifierToMouseEventProperty(modifier);

                if (prop === null) return false;

                const modifierIsPressed = event[prop];
                
                return doActivate && modifierIsPressed;
            }, true);

            if (reqButtonIsPressed && allReqModifiersArePressed) return true;
        }
    }

    // By default we do not process the event
    return false;
}

function modifierToMouseEventProperty(modifier: Modifier): MouseEventModifierProperty | null {
    if (modifier === "alt") return "altKey";
    if (modifier === "ctrl") return "ctrlKey";
    if (modifier === "meta") return "metaKey";
    if (modifier === "shift") return "shiftKey";

    return null;
}