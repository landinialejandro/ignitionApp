// * file: src/shared/utils/getUserInput.js

import  toastmaster  from '../../core/ToastMaster/toastMaster.js';

/**
 * Procesa un texto para sanitizarlo según las reglas especificadas.
 * @param {string} input - Texto a procesar.
 * @param {boolean} replaceSpaces - Si es true, reemplaza espacios por '_'.
 * @param {boolean} toLowerCase - Si es true, convierte el texto a minúsculas.
 * @returns {string} - Texto procesado.
 */
export const sanitizeInput = (input, replaceSpaces = false, toLowerCase = false) => {
    let sanitized = input.trim();

    if (replaceSpaces) {
        sanitized = sanitized.replace(/\s+/g, '_');
    }

    if (toLowerCase) {
        sanitized = sanitized.toLowerCase();
    }

    return sanitized;
};

/**
 * Valida un texto genérico (por ejemplo, para nombres de archivo o datos genéricos).
 * @param {string} input - Texto a validar.
 * @returns {boolean} - True si es válido, False si no.
 */
export const validateGenericInput = (input) => {
    const invalidChars = /[<>:"/\\|?*]/; // Caracteres problemáticos
    const maxLength = 255; // Longitud máxima
    return !invalidChars.test(input) && input.length <= maxLength;
};

/**
 * Solicita un dato al usuario con validación opcional.
 * @param {string} promptMessage - Mensaje a mostrar al usuario.
 * @param {function} validateFn - Función de validación opcional.
 * @returns {string|null} - Entrada válida del usuario o null si se cancela.
 */
export const getUserInput = (promptMessage, validateFn = null) => {
    try {
        const userInput = prompt(promptMessage);

        if (!userInput || userInput.trim() === '') {
            toastmaster.warning(`Entrada inválida: el campo no puede estar vacío.`);
            return null;
        }

        const trimmedInput = userInput.trim();

        // Validación personalizada
        if (validateFn && !validateFn(trimmedInput)) {
            toastmaster.warning(`Entrada inválida: no cumple los criterios.`);
            return null;
        }

        return trimmedInput;
    } catch (error) {
        console.error(`Error al solicitar entrada:`, error);
        toastmaster.error(`Se produjo un error al procesar la entrada.`);
        return null;
    }
};

// ** Ejemplo de uso **
// const type = 'archivo'; // Puede ser dinámico
// const name = getUserInput(`Ingrese el nombre del ${type}:`, validateGenericInput);

// if (name) {
//     const sanitized = sanitizeInput(name, true, true); // Reemplazar espacios y convertir a minúsculas
//     console.log(`Nombre procesado: ${sanitized}`);
// } else {
//     console.log('Operación cancelada o entrada inválida.');
// }
