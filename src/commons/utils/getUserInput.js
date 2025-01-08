// * file: src/shared/utils/getUserInput.js

import toastmaster from '../../core/ToastMaster/ToastMaster.js';

/**
 * Procesa un texto para sanitizarlo según las reglas especificadas.
 * @param {string} input - Texto a procesar.
 * @param {boolean} replaceSpaces - Si es true, reemplaza espacios por '_'.
 * @param {boolean} toLowerCase - Si es true, convierte el texto a minúsculas.
 * @returns {string} - Texto procesado.
 */
const sanitizeInput = (input, replaceSpaces = false, toLowerCase = false) => {
    let sanitized = input.trim();

    if (replaceSpaces) {
        sanitized = sanitized.replace(/\s+/g, '_');
        toastmaster.warning('Espacios en blanco reemplazados por "_"');
    }

    if (toLowerCase) {
        sanitized = sanitized.toLowerCase();
        toastmaster.warning('Texto convertido a minúsculas');
    }

    return sanitized;
};

/**
 * Valida un texto genérico (por ejemplo, para nombres de archivo o datos genéricos).
 * @param {string} input - Texto a validar.
 * @returns {boolean} - True si es válido, False si no.
 */
const validateGenericInput = (input) => {
    const invalidChars = /[<>:"/\\|?*\[\]]/; // Caracteres problemáticos
    const maxLength = 255; // Longitud máxima
    return !invalidChars.test(input) && input.length <= maxLength;
};

/**
 * Solicita un dato al usuario con validación opcional.
 * @param {string} promptMessage - Mensaje a mostrar al usuario.
 * @param {function} validateFn - Función de validación opcional. tipo callback
 * @returns {string|null} - Entrada válida del usuario o null si se cancela.
 */
export const getUserInput = (promptMessage, validateFn = true, replaceSpaces = false, toLowerCase = false) => {
    try {
        const userInput = prompt(promptMessage);

        if (!userInput || userInput.trim() === '') {
            toastmaster.warning(`Entrada inválida: el campo no puede estar vacío.`);
            return null;
        }

        // Validación personalizada
        if (validateFn && !validateGenericInput(trimmedInput)) {
            toastmaster.warning(`Entrada inválida: no cumple los criterios.`);
            return null;
        }

        return sanitizeInput(trimmedInput, replaceSpaces, toLowerCase);

    } catch (error) {
        console.error(`Error al solicitar entrada:`, error);
        toastmaster.error(`Se produjo un error al procesar la entrada.`);
        return null;
    }
};
