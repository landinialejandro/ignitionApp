/**
 * @typedef {import('./IconType').IconType} IconType
 */
/**
 * @typedef {import('./ActionType').ActionType} ActionType
 * Un objeto de acciones, donde la clave es el nombre de la acción (ej. "rename", "delete").
 */

/**
 * @typedef {Object} NodeTypeAttributes
 * @property {number} maxChildren - El número máximo de hijos permitidos.
 * @property {number} maxDepth - La profundidad máxima permitida para el nodo.
 * @property {IconType} icon - El ícono asociado con el nodo.
 * @property {ActionType} actions - Un mapa de acciones que se pueden realizar en el nodo.
 * @property {string[]} validChildren - Lista de tipos de nodos hijos permitidos.
 * @property {string} description - Descripción del nodo.
 */

// Exportar la definición de NodeTypeAttributes
export { };
