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

export function validateNodeAddition(parentNode, nodeOptions, nodeTypeManager) {
    if (!isValidChild(nodeTypeManager, parentNode.type, nodeOptions.type)) {
        return { isValid: false, message: `El nodo de tipo '${nodeOptions.type}' no es un hijo válido para el nodo de tipo '${parentNode.type}'.` };
    }

    if (!canAddChildAtDepth(parentNode, nodeTypeManager)) {
        return { isValid: false, message: `No se puede añadir un nodo de tipo '${nodeOptions.type}' porque excede la profundidad máxima permitida para '${parentNode.type}'.` };
    }

    return { isValid: true };
}
