import { get_data } from './common.js';  // Importamos el método para obtener datos de JSON

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
            const data = await get_data({ url: filePath, isJson: true });
            this.types = data;
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
     * Agregar un nuevo tipo de nodo.
     * 
     * @param {string} type - El nombre del tipo de nodo.
     * @param {NodeTypeAttributes} attributes - Atributos del tipo de nodo.
     * @throws {Error} Si el tipo de nodo ya existe.
     */
    addType(type, attributes) {
        if (this.types[type]) {
            throw new Error(`El tipo de nodo '${type}' ya existe.`);
        }
        this.types[type] = attributes;
    }

    /**
     * Modificar los atributos de un tipo de nodo existente.
     * 
     * @param {string} type - El nombre del tipo de nodo.
     * @param {Partial<NodeTypeAttributes>} updatedAttributes - Nuevos atributos para el tipo de nodo.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    updateType(type, updatedAttributes) {
        if (!this.types[type]) {
            throw new Error(`El tipo de nodo '${type}' no existe.`);
        }
        this.types[type] = { ...this.types[type], ...updatedAttributes };
    }

    /**
     * Eliminar un tipo de nodo.
     * 
     * @param {string} type - El nombre del tipo de nodo a eliminar.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    removeType(type) {
        if (!this.types[type]) {
            throw new Error(`El tipo de nodo '${type}' no existe.`);
        }
        delete this.types[type];
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
        return nodeType.maxDepth || Infinity;  // Retorna Infinity si no está especificado
    }

    /**
     * Obtener el ícono de un tipo de nodo.
     * 
     * @param {string} type - El tipo de nodo.
     * @returns {IconType} El ícono asociado al tipo de nodo.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getIcon(type) {
        const nodeType = this.getType(type);
        return nodeType.icon || { type: 'class', value: 'bi bi-file-earmark' };  // Ícono por defecto
    }

    /**
     * Obtener los atributos específicos de un tipo de nodo (por ejemplo, `a_attr`, `li_attr`).
     * 
     * @param {string} type - El tipo de nodo.
     * @param {string} attribute - El nombre del atributo a obtener.
     * @returns {Object} Los atributos solicitados.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    getAttribute(type, attribute) {
        const nodeType = this.getType(type);
        return nodeType[attribute] || {};
    }

    /**
     * Verificar si una acción está permitida en un nodo de un tipo específico.
     * 
     * @param {string} type - El tipo de nodo.
     * @param {string} action - La acción a verificar (por ejemplo, 'delete', 'rename').
     * @returns {boolean} True si la acción está permitida, false si no.
     * @throws {Error} Si el tipo de nodo no existe.
     */
    isActionAllowed(type, action) {
        const nodeType = this.getType(type);
        return nodeType[action] || false;  // Retorna `false` si no está permitido
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
