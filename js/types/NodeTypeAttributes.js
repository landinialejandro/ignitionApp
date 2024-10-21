/**
 * @typedef {import('./types/IconType').IconType} IconType
 */
/**
 * @typedef {Object} NodeTypeAttributes
 * @property {number} maxChildren - Número máximo de hijos permitidos.
 * @property {number} maxDepth - Número máximo de profundidad permitida.
 * @property {IconType} icon - Ícono asociado al tipo de nodo, puede ser una clase de ícono o un SVG.
 * @property {boolean} rename - Si el nodo puede ser renombrado.
 * @property {boolean} delete - Si el nodo puede ser eliminado.
 * @property {string[]} validChildren - Lista de tipos de nodos válidos como hijos.
 * @property {string} description - Texto con descripción del tipo.
 */
// Exportar la definición de NodeTypeAttributes
export {};