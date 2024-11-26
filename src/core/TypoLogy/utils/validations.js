// * file: src/core/TypoLogy/utils/index.js

/**
 * Validar si la profundidad actual es válida para un nodo.
 * 
 * @param {string} type - Tipo del nodo.
 * @param {number} depth - Profundidad actual.
 * @param {Object} types - Lista de tipos de nodos.
 * @returns {boolean} True si la profundidad es válida.
 */
export function isValidDepth(type, depth, types) {
    if (!types[type]) throw new Error(`Tipo de nodo '${type}' no encontrado.`);
    const maxDepth = types[type].maxDepth || Infinity;
    return depth <= maxDepth;
}

/**
 * Validar si el número de hijos es válido.
 * 
 * @param {string} type - Tipo del nodo.
 * @param {number} childrenCount - Número actual de hijos.
 * @param {Object} types - Lista de tipos de nodos.
 * @returns {boolean} True si el número de hijos es válido.
 */
export function isValidChildrenCount(type, childrenCount, types) {
    if (!types[type]) throw new Error(`Tipo de nodo '${type}' no encontrado.`);
    const maxChildren = types[type].maxChildren || Infinity;
    return childrenCount <= maxChildren;
}
