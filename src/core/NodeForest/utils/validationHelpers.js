// * file: src/core/NodeForest/utils/validationHelpers.js
import { Typology } from "../../TypoLogy/typoLogy.js";
import { canAddChildAtDepth } from "./treeUtils.js";
/**
 * Verificar si un tipo de nodo es un hijo válido para otro tipo de nodo.
 * 
 * @param {Typology} Typology - Instancia de Typology.
 * @param {string} parentType - El tipo de nodo padre.
 * @param {string} childType - El tipo de nodo hijo.
 * @returns {boolean} True si el nodo hijo es válido para el padre.
 * @throws {Error} Si el tipo de nodo padre no existe.
 */
export function isValidChild(Typology, parentType, childType) {
    return Typology.isValidChild(parentType, childType);
}

/**
 * Verifica si un caption está duplicado en un conjunto de nodos.
 * @param {string} caption - El caption a verificar.
 * @param {Array<{ caption: string }>} nodes - Lista de nodos donde buscar duplicados.
 * @returns {boolean} - `true` si el caption está duplicado, de lo contrario `false`.
 */
export function isDuplicate(caption, nodes) {
    // Validar que caption es un string válido
    if (typeof caption !== 'string' || caption.trim() === '') {
        throw new Error("El caption debe ser una cadena de texto no vacía.");
    }

    // Validar que nodes es un array válido
    if (!Array.isArray(nodes)) {
        throw new Error("El parámetro nodes debe ser un arreglo.");
    }

    return nodes.some(node => {
        // Verifica en el nivel actual
        if (node.caption === caption) {
            return true;
        }

        // Verifica en los hijos (si existen)
        if (node.children && Array.isArray(node.children)) {
            return isDuplicate(caption, node.children);
        }

        return false; // No encontrado en este nodo
    });
}


export function validateNode(parentNode, nodeOptions, Typology) {
    if (!isValidChild(Typology, parentNode.type, nodeOptions.type)) {
        return { isValid: false, message: `El nodo de tipo '${nodeOptions.type}' no es un hijo válido para el nodo de tipo '${parentNode.type}'.` };
    }

    if (!canAddChildAtDepth(parentNode, Typology)) {
        return { isValid: false, message: `No se puede añadir un nodo de tipo '${nodeOptions.type}' porque excede la profundidad máxima permitida para '${parentNode.type}'.` };
    }

    if (isDuplicate(nodeOptions.caption, parentNode.children)) {
        return { isValid: false, message: `El caption '${nodeOptions.caption}' ya existe en el nodo de tipo '${parentNode.type}'.` };
    }

    return { isValid: true };
}
