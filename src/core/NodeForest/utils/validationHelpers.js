// * file: src/core/NodeForest/utils/validationHelpers.js
import { canAddChildAtDepth } from "./treeUtils.js";
/**
 * Verificar si un tipo de nodo es un hijo válido para otro tipo de nodo.
 * 
 * @param {NodeTypeManager} nodeTypeManager - Instancia de NodeTypeManager.
 * @param {string} parentType - El tipo de nodo padre.
 * @param {string} childType - El tipo de nodo hijo.
 * @returns {boolean} True si el nodo hijo es válido para el padre.
 * @throws {Error} Si el tipo de nodo padre no existe.
 */
export function isValidChild(nodeTypeManager, parentType, childType) {
    return nodeTypeManager.isValidChild(parentType, childType);
}

/**
 * Verifica si un caption está duplicado en un conjunto de nodos.
 * @param {string} caption - El caption a verificar.
 * @param {Array<{ caption: string }>} nodes - Lista de nodos donde buscar duplicados.
 * @returns {boolean} - `true` si el caption está duplicado, de lo contrario `false`.
 */
export function isDuplicate(caption, nodes) {
    return nodes.some(node => node.caption === caption);
}


export function validateNode(parentNode, nodeOptions, nodeTypeManager) {
    if (!isValidChild(nodeTypeManager, parentNode.type, nodeOptions.type)) {
        return { isValid: false, message: `El nodo de tipo '${nodeOptions.type}' no es un hijo válido para el nodo de tipo '${parentNode.type}'.` };
    }

    if (!canAddChildAtDepth(parentNode, nodeTypeManager)) {
        return { isValid: false, message: `No se puede añadir un nodo de tipo '${nodeOptions.type}' porque excede la profundidad máxima permitida para '${parentNode.type}'.` };
    }

    if (isDuplicate(nodeOptions.caption, parentNode.children)) {
        return { isValid: false, message: `El caption '${nodeOptions.caption}' ya existe en el nodo de tipo '${parentNode.type}'.` };
    }

    return { isValid: true };
}
