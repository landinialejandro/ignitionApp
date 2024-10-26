/**
 * @typedef {import('./types/NodeOptions.js').NodeOptions} NodeOptions
 */
import { renderTemplate } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';

export class Nodes {
    /**
     * @param {string} container - ID del contenedor HTML donde se renderizará el árbol.
     */
    constructor(container) {
        this.container = container;
        this.nodes = [];
        this.template = "templates/project_tree.hbs"; // Plantilla predeterminada
        this.file = "";
    }

    /**
     * Setter para establecer la colección de nodos.
     * @param {NodeOptions[]} nodeOptionsArray - Array de nodos que deben agregarse al árbol.
     */
    setNodes(nodeOptionsArray) {
        this.nodes = nodeOptionsArray.map(nodeOptions => Nodes._createNode(nodeOptions));
    }

    /**
     * Método privado para crear un nodo individual con sus propiedades y nodos hijos.
     * @param {NodeOptions} options - Opciones para crear el nodo.
     * @returns {Nodes} - Nodo creado.
     * @private
     */
    static _createNode(options) {
        const node = new Nodes('');
        node.id = options.id || node._generateUniqueId();
        node.caption = options.caption || 'Untitled';
        node.icon = options.icon || {};
        node.li_attr = options.li_attr || {};
        node.a_attr = options.a_attr || {};
        node.state = options.state || {};
        node.properties = options.properties || [];
        node.children = (options.children || []).map(childOptions => Nodes._createNode(childOptions));
        node.type = options.type || 'field';
        return node;
    }

    /**
     * Genera un ID único para el nodo si no se proporciona uno.
     * @returns {string}
     * @private
     */
    _generateUniqueId() {
        return 'node-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Busca un nodo en todo el árbol recursivamente por su ID.
     * @param {string} nodeId - El ID del nodo a buscar.
     * @returns {Nodes|null} - Retorna el nodo encontrado o null si no se encuentra.
     */
    findChildById(nodeId) {
        for (const node of this.nodes) {
            const found = node._findInChildren(nodeId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Método privado para buscar recursivamente en `this.children` dentro de un nodo individual.
     * @param {string} nodeId - El ID del nodo a buscar.
     * @returns {Nodes|null} - Retorna el nodo encontrado o null si no se encuentra.
     * @private
     */
    _findInChildren(nodeId) {
        if (this.id === nodeId) {
            return this;
        }
        for (const child of this.children || []) {
            const found = child._findInChildren(nodeId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Actualiza una o varias propiedades de un nodo identificado por su ID.
     * @param {string} nodeId - El ID del nodo a actualizar.
     * @param {Object} properties - Objeto con las propiedades y sus valores para actualizar.
     * @returns {boolean} - Retorna true si el nodo fue encontrado y actualizado, false si no.
     */
    updateNode(nodeId, properties) {
        const node = this.findChildById(nodeId);
        if (node) {
            Object.assign(node, properties); // Actualiza las propiedades especificadas
            return true;
        }
        return false; // Nodo no encontrado
    }

    /**
     * Convierte el árbol de nodos o el nodo actual a un objeto JSON.
     * @returns {Object}
     */
    toJSON() {
        if (this.nodes && this.nodes.length) {
            return {
                container: this.container,
                file: this.file,
                nodes: this.nodes.map(node => node.toJSON())
            };
        }
        return {
            id: this.id,
            caption: this.caption,
            icon: this.icon,
            li_attr: this.li_attr,
            a_attr: this.a_attr,
            state: this.state,
            properties: this.properties,
            children: this.children.map(child => child.toJSON()),
            type: this.type
        };
    }

    /**
     * Renderiza el árbol de nodos en una plantilla HTML y lo inserta en el contenedor especificado.
     * @returns {Promise<void>} - Realiza la operación de renderizado.
     */
    async render() {
        const content = this.toJSON();
        const html = await renderTemplate(this.template, content);
        $$(`${this.container}`).html(html);
    }
}
