/**
 * Genera un ID único.
 * @param {string} [prefix=""] - Prefijo opcional que se añadirá al inicio del ID.
 * @returns {string} - Un ID único generado.
 */
export function uniqueId(prefix = "") {
    const randomPart = Math.random().toString(36).substring(2, 11); // Parte aleatoria
    const timestampPart = Date.now().toString(36); // Marca de tiempo para mayor unicidad
    return prefix ? `${prefix}-${randomPart}-${timestampPart}` : `${randomPart}-${timestampPart}`;
}

