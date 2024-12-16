import { toastmaster } from "../../index.js";

export const handleError = (message, error,) => {
    if (toastmaster) {
        toastmaster.handleError(message, error);
    } else if (error instanceof Error) {
        console.error(`${message}:`, error);
    } else {
        console.error(`${message}`);
    }
    throw error;
}   