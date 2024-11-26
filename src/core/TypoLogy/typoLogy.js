// * file: src/core/TypoLogy/typoLogy.js

import './types/index.js'; // Importa el archivo donde están definidos los typedefs (no se transpila, pero permite la referencia).
import { isValidDepth, isValidChildrenCount } from './utils/index.js';

/**
 * Clase para gestionar y validar los tipos de nodos.
 */
export class Typology {
    /**
     * Constructor de la clase Typology.
     * @param {NodeTypes} typesData - Un objeto que contiene los tipos de nodos.
     */
    constructor(typesData) {
        /** @type {NodeTypes} */
        this.types = typesData || {};
    }

    /**
     * Obtener las reglas de un tipo de nodo.
     * 
     * @param {string} type - El tipo de nodo.
     * @returns {NodeTypeAttributes} Las reglas del tipo de nodo.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getType(type) {
        if (!this.types[type]) {
            throw new Error(`El tipo de nodo '${type}' no existe.`);
        }
        return this.types[type];
    }

    /**
     * Validar si un nodo puede tener una cantidad específica de hijos.
     * 
     * @param {string} type - Tipo del nodo.
     * @param {number} currentChildrenCount - Número actual de hijos.
     * @returns {boolean} True si la cantidad es válida, false si no.
     */
    isValidChildrenCount(type, currentChildrenCount) {
        return isValidChildrenCount(type, currentChildrenCount, this.types);
    }

    /**
     * Validar si la profundidad de un nodo es válida.
     * 
     * @param {string} type - Tipo del nodo.
     * @param {number} currentDepth - Profundidad actual.
     * @returns {boolean} True si la profundidad es válida, false si no.
     */
    isValidDepth(type, currentDepth) {
        return isValidDepth(type, currentDepth, this.types);
    }

    /**
     * Validar una estructura de árbol para cumplir con restricciones de profundidad y número de hijos.
     * 
     * @param {TreeNode} treeNode - Nodo de árbol a validar.
     * @param {string} type - Tipo del nodo raíz.
     * @param {number} currentDepth - Profundidad actual.
     * @returns {boolean} True si cumple con las restricciones, false si no.
     */
    validateTreeStructure(treeNode, type, currentDepth = 1) {
        if (!this.isValidDepth(type, currentDepth)) return false;

        const currentChildrenCount = treeNode.children?.length || 0;
        if (!this.isValidChildrenCount(type, currentChildrenCount)) return false;

        if (treeNode.children) {
            for (const child of treeNode.children) {
                if (!this.validateTreeStructure(child, child.type, currentDepth + 1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Exportar todos los tipos de nodos como una cadena JSON.
     * 
     * @returns {string} - Una cadena JSON con los tipos de nodos.
     */
    exportToJSON() {
        return JSON.stringify(this.types, null, 2);
    }

    /**
     * Obtener un arreglo con los nombres de todos los tipos de nodos.
     * 
     * @returns {string[]} Un arreglo con los nombres de los tipos de nodos.
     */
    getTypeNames() {
        return Object.keys(this.types);
    }
}
