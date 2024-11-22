// utilities/generateUniqueCaption.js

import { sanitizeInput } from '../../../index.js';
import { isDuplicate } from './validationHelpers.js';

/**
 * Genera un caption único verificando duplicados en un conjunto de nodos.
 * @param {string} caption - El caption original.
 * @param {Array<{ caption: string }>} nodes - Lista de nodos donde verificar duplicados.
 * @returns {string} - Un caption único.
 */
export function generateUniqueCaption(caption, nodes) {
    let sanitizedCaption = sanitizeInput(caption, true); // Reemplaza espacios por '_'.
    let uniqueCaption = sanitizedCaption;
    let counter = 1;

    while (isDuplicate(uniqueCaption, nodes)) {
        uniqueCaption = `${sanitizedCaption}_${counter}`;
        counter++;
    }

    return uniqueCaption;
}
