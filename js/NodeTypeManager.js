import { get_data } from '../src/index.js';  // Importamos el método para obtener datos de JSON

/**
 * @typedef {import('./types/IconType').IconType} IconType
 */
/**
 * @typedef {import('./types/NodeTypeAttributes').NodeTypeAttributes} NodeTypeAttributes
 */
/**
 * @typedef {Object.<string, NodeTypeAttributes>} NodeTypes
 */

/**
 * Clase para gestionar los tipos de nodos.
 */
export class NodeTypeManager {
    /**
     * Constructor de la clase NodeTypeManager.
     * @param {NodeTypes} typesData - Un objeto que contiene los tipos de nodos.
     */
    constructor(typesData) {
        /** @type {NodeTypes} */
        this.types = typesData || {};
    }

    /**
     * Cargar tipos de nodos desde un archivo JSON y actualizar el manager.
     * 
     * @param {string} filePath - La ruta del archivo JSON que contiene los tipos de nodos.
     * @returns {Promise<void>} - Retorna una promesa que se resuelve cuando los tipos se cargan exitosamente.
     * @throws {Error} - Lanza un error si no se puede cargar el archivo JSON.
     */
    async loadFromFile(filePath) {
        try {
            this.types = await get_data({ url: filePath, isJson: true });
            console.log(`Tipos de nodos cargados desde ${filePath}`);
        } catch (error) {
            console.error(`Error al cargar tipos de nodos desde ${filePath}:`, error);
            throw new Error('No se pudo cargar los tipos de nodos desde el archivo JSON.');
        }
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
     * Verificar si se puede agregar un nuevo hijo sin exceder el máximo permitido.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {number} currentChildrenCount - Número actual de hijos.
     * @returns {boolean} True si se puede agregar un hijo, false si no.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    canAddChild(type, currentChildrenCount) {
        const maxChildren = this.getMaxChildren(type);
        return currentChildrenCount < maxChildren;
    }

    /**
     * Verificar si se puede agregar un nodo en una profundidad específica sin exceder la profundidad máxima.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {number} currentDepth - La profundidad actual.
     * @returns {boolean} True si se puede agregar en esa profundidad, false si no.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    canAddAtDepth(type, currentDepth) {
        const maxDepth = this.getMaxDepth(type);
        return currentDepth <= maxDepth;
    }

    /**
     * Obtener los hijos válidos para un tipo de nodo específico.
     * 
     * @param {string} type - El nombre del tipo de nodo.
     * @returns {string[]} Lista de tipos de nodos válidos como hijos.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getValidChildren(type) {
        const nodeType = this.getType(type);
        return nodeType.validChildren || [];
    }

    /**
     * Verificar si un tipo de nodo puede ser hijo de otro tipo.
     * 
     * @param {string} parentType - El tipo de nodo padre.
     * @param {string} childType - El tipo de nodo hijo.
     * @returns {boolean} True si el nodo hijo es válido para el padre.
     * @throws {Error} Si el tipo de nodo padre no existe.
     */
    isValidChild(parentType, childType) {
        const validChildren = this.getValidChildren(parentType);
        return validChildren.includes(childType);
    }

    /**
     * Obtener el número máximo de hijos permitidos para un tipo de nodo.
     * 
     * @param {string} type - El tipo de nodo.
     * @returns {number} Número máximo de hijos permitidos.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getMaxChildren(type) {
        const nodeType = this.getType(type);
        return nodeType.maxChildren || Infinity;
    }

    /**
     * Obtener el número máximo de profundidad permitida para un tipo de nodo.
     * 
     * @param {string} type - El tipo de nodo.
     * @returns {number} Número máximo de profundidad permitida.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getMaxDepth(type) {
        const nodeType = this.getType(type);
        return nodeType.maxDepth || Infinity;
    }

    /**
     * Obtener el ícono de un tipo de nodo, usando un ícono por defecto si no se especifica.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {IconType} [defaultIcon={ type: 'class', value: 'bi bi-file-earmark' }] - Un ícono por defecto opcional.
     * @returns {IconType} El ícono asociado al tipo de nodo.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getIcon(type, defaultIcon = { type: 'class', value: 'bi bi-file-earmark' }) {
        const nodeType = this.getType(type);
        return nodeType.icon || defaultIcon;
    }

    /**
     * Obtener detalles de una acción específica de un tipo de nodo.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {string} action - La acción a obtener (por ejemplo, 'delete', 'add').
     * @returns {Object|null} Los detalles de la acción o null si no existe.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getActionDetails(type, action) {
        const nodeType = this.getType(type);
        return nodeType.actions && nodeType.actions[action] ? nodeType.actions[action] : null;
    }

    /**
     * Verificar si un nodo debe contener al menos un tipo específico de hijo.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {string} requiredChildType - El tipo de hijo que se necesita verificar.
     * @returns {boolean} True si el nodo debe contener al menos un hijo de ese tipo, false si no.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    requiresChildType(type, requiredChildType) {
        const nodeType = this.getType(type);
        return nodeType.validChildren.includes(requiredChildType);
    }

    /**
     * Validar una estructura de árbol para asegurarse de que cumple con las restricciones de maxChildren y maxDepth.
     * 
     * @param {Object} treeNode - Nodo de árbol a validar.
     * @param {string} type - El tipo de nodo raíz.
     * @param {number} currentDepth - La profundidad actual de la validación.
     * @returns {boolean} True si la estructura cumple con las restricciones, false si no.
     */
    validateTreeStructure(treeNode, type, currentDepth = 1) {
        if (!this.canAddAtDepth(type, currentDepth)) {
            return false;
        }
        
        const currentChildrenCount = treeNode.children ? treeNode.children.length : 0;
        if (!this.canAddChild(type, currentChildrenCount)) {
            return false;
        }
        
        if (treeNode.children) {
            for (const child of treeNode.children) {
                if (!this.isValidChild(type, child.type) || 
                    !this.validateTreeStructure(child, child.type, currentDepth + 1)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Obtener todas las descripciones de tipos de nodos.
     * 
     * @returns {Object.<string, string>} Un objeto con los tipos de nodos y sus descripciones.
     */
    getAllDescriptions() {
        const descriptions = {};
        for (const [type, attributes] of Object.entries(this.types)) {
            descriptions[type] = attributes.description || 'Sin descripción';
        }
        return descriptions;
    }

    /**
     * Verificar si una acción está permitida en un nodo de un tipo específico.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {string} action - La acción a verificar (por ejemplo, 'delete', 'rename', 'add').
     * @returns {boolean} True si la acción está permitida, false si no.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    isActionAllowed(type, action) {
        const nodeType = this.getType(type);
        return !!(nodeType.actions && nodeType.actions[action]);
    }

    /**
     * Obtener un arreglo con los nombres de todos los tipos de nodos.
     * 
     * @returns {string[]} Un arreglo con los nombres de los tipos de nodos.
     */
    getTypeNames() {
        return Object.keys(this.types);
    }

    /**
     * Exportar todos los tipos de nodos como una cadena JSON.
     * 
     * @returns {string} - Una cadena JSON de los tipos de nodos.
     */
    exportToJSON() {
        return JSON.stringify(this.types, null, 2);
    }
}
