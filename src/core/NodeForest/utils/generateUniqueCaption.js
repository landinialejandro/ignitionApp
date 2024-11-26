// utilities/generateUniqueCaption.js

import { sanitizeInput } from '../../../index.js';
import { isDuplicate } from './validationHelpers.js';

/**
 * Genera un caption único verificando duplicados en un conjunto de nodos.
 * @param {string} caption - El caption original.
 * @param {Array<{ caption: string }>} nodes - Lista de nodos donde verificar duplicados.
 * @param {boolean} [sanitize=true] - Indica si el caption debe ser sanitizado.
 * @returns {string} - Un caption único.
 */
export function generateUniqueCaption(caption, nodes, sanitize = true) {
    if (!caption || typeof caption !== 'string') {
        throw new Error("El caption debe ser una cadena de texto válida.");
    }
    if (!Array.isArray(nodes)) {
        throw new Error("El parámetro nodes debe ser un arreglo.");
    }

    // Declarar variables iniciales
    let sanitizedCaption = sanitize ? sanitizeInput(caption, true) : caption;
    let uniqueCaption = sanitizedCaption;

    // Garantizar que sanitizedCaption no sea undefined o vacío
    if (!sanitizedCaption) {
        sanitizedCaption = "default_caption";
        uniqueCaption = sanitizedCaption;
    }

    let counter = 1;

    // Verificar duplicados y ajustar el caption
    while (isDuplicate(uniqueCaption, nodes)) {
        uniqueCaption = `${sanitizedCaption}_${counter}`;
        counter++;
    }

    return uniqueCaption;
}


