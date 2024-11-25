/**
 * @typedef {import('../../../js/types/NodeOptions.js').NodeOptions} NodeOptions
 */

import { uniqueId } from '../../commons/utils/uniqueId.js';
import { generateUniqueCaption } from './utils/generateUniqueCaption.js';
import { validateNode } from './utils/validationHelpers.js';
import { findInChildren, findParentInChildren } from './utils/treeSearchHelpers.js';
import { nodeToJSON } from './utils/treeUtils.js';
import { renderTemplateToContainer } from '../../index.js';

export class NodeForest {
    /**
     * @param {string} container - ID del contenedor HTML donde se renderizará el árbol.
     * @param {NodeTypeManager} nodeTypeManager - Instancia de NodeTypeManager para controlar las validaciones de tipos.
     */
    constructor(container, nodeTypeManager) {
        this.container = container;
        this.nodes = [];
        this.template = "templates/treeview.hbs"; // Plantilla predeterminada
        this.file = "";
        this.nodeTypeManager = nodeTypeManager; // Instancia de NodeTypeManager
    }

    /**
     * Setter para establecer la colección de nodos.
     * @param {NodeOptions[]} nodeOptionsArray - Array de nodos que deben agregarse al árbol.
     */
    setNodes(nodeOptionsArray) {
        if (!nodeOptionsArray || nodeOptionsArray.length === 0) {
            console.warn("No se proporcionó ningún nodo válido. Creando un nodo raíz predeterminado.");
            const defOptions = this.nodeTypeManager.getType('root');
            if (!defOptions) {
                throw new Error("NodeTypeManager no pudo proporcionar un tipo de nodo raíz.");
            }
            const rootOptions = {
                id: defOptions.id || 'root',
                caption: defOptions.caption || 'New Project',
                type: 'root',
                children: [],
                icon: defOptions.icon || ""
            };
            this.nodes = [NodeForest.#createNode(rootOptions)];
            console.info("Se creó un nodo raíz predeterminado:", rootOptions);
        } else {
            this.nodes = nodeOptionsArray.map(nodeOptions => NodeForest.#createNode(nodeOptions));
        }
    }

    /**
     * Método privado para crear un nodo individual con sus propiedades y nodos hijos.
     * @param {NodeOptions} options - Opciones para crear el nodo.
     * @returns {NodeForest} - Nodo creado.
     * @private
     */
    static #createNode(options) {
        const node = new NodeForest('');
        node.id = options.id || uniqueId('node');
        node.caption = options.caption || 'Untitled';
        node.icon = options.icon || {};
        node.li_attr = options.li_attr || {};
        node.a_attr = options.a_attr || {};
        node.state = options.state || {};
        node.properties = options.properties || [];
        node.children = (options.children || []).map(childOptions => NodeForest.#createNode(childOptions));
        node.type = options.type || 'field';
        return node;
    }

    /**
     * Busca un nodo en todo el árbol recursivamente por su ID.
     * @param {string} nodeId - El ID del nodo a buscar.
     * @returns {NodeForest|null} - Retorna el nodo encontrado o null si no se encuentra.
     */
    findChildById(nodeId) {
        for (const node of this.nodes) {
            const found = findInChildren(node, nodeId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Busca el nodo padre de un nodo con un ID específico.
     * @param {string} nodeId - El ID del nodo del cual queremos encontrar el padre.
     * @returns {NodeForest|null} - Retorna el nodo padre o null si no se encuentra.
     */
    findParentById(nodeId) {
        for (const node of this.nodes) {
            const parent = findParentInChildren(node, nodeId);
            if (parent) return parent;
        }
        return null;
    }

    /**
     * Elimina un nodo identificado por su ID del árbol.
     * @param {string} nodeId - El ID del nodo a eliminar.
     * @returns {boolean} - Retorna true si el nodo fue encontrado y eliminado, false si no.
     */
    removeNode(nodeId) {
        const parentNode = this.findParentById(nodeId);
        if (parentNode) {
            const index = parentNode.children.findIndex(child => child.id === nodeId);
            if (index !== -1) {
                parentNode.children.splice(index, 1);
                return true;
            }
        } else {
            const index = this.nodes.findIndex(node => node.id === nodeId);
            if (index !== -1) {
                this.nodes.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
    * Agrega un nuevo nodo como hijo de un nodo existente identificado por su ID, con validaciones de NodeTypeManager y reglas específicas.
    * @param {string} parentId - El ID del nodo padre al que se agregará el nuevo nodo.
    * @param {NodeOptions} nodeOptions - Opciones del nodo nuevo.
    * @returns {boolean} - Retorna true si se agregó el nodo, false si no.
    */
    addChild(parentId, nodeOptions) {
        const parentNode = this.findChildById(parentId);
        if (!parentNode) {
            console.error(`No se encontró el nodo padre con ID: ${parentId}`);
            return false;
        }

        // Generar un caption único
        nodeOptions.caption = generateUniqueCaption(nodeOptions.caption, parentNode.children);
    
        // Validaciones centralizadas
        const validation = validateNode(parentNode, nodeOptions, this.nodeTypeManager);
        if (!validation.isValid) {
            console.error(validation.message);
            return false;
        }
    
        const newNode = NodeForest.#createNode(nodeOptions);
        parentNode.children.push(newNode);
        return true;
    }

    /**
     * Actualiza una o varias propiedades de un nodo identificado por su ID.
     * @param {string} nodeId - El ID del nodo a actualizar.
     * @param {Object} nodeOptions - Objeto con las propiedades y sus valores para actualizar.
     * @returns {boolean} - Retorna true si el nodo fue encontrado y actualizado, false si no.
     */
    updateNode(nodeId, nodeOptions) {
        
        const node = this.findChildById(nodeId);
        if (node) {
            Object.assign(node, nodeOptions);
            return true;
        }
        return false;
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
                nodes: this.nodes.map(nodeToJSON)
            };
        }

    }

    /**
     * Renderiza el árbol de nodos en una plantilla HTML y lo inserta en el contenedor especificado.
     * @returns {Promise<void>} - Realiza la operación de renderizado.
     */
    async render() {
        await renderTemplateToContainer(this.template, this.toJSON(), this.container);
    }

    /**
     * Obtiene un arreglo de los tipos de todos los nodos hijos directos de un nodo específico.
     * @param {string} parentId - El ID del nodo padre.
     * @returns {string[]} - Un arreglo con los tipos de los nodos hijos.
     */
    getChildrenTypes(parentId) {
        const parentNode = this.findChildById(parentId);
        if (!parentNode) return [];
        return parentNode.children.map(child => child.type);
    }

    /**
     * Obtiene el breadcrumb (ruta de navegación) desde un nodo específico hasta la raíz.
     * @param {string} nodeId - El ID del nodo para el cual se generará el breadcrumb.
     * @returns {Object[]} - Un arreglo con los objetos del breadcrumb en el formato { label: <caption>, id: <id> }.
     */
    getBreadcrumb(nodeId) {
        const breadcrumb = [];
        let currentNode = this.findChildById(nodeId);

        while (currentNode) {
            breadcrumb.unshift({ label: currentNode.caption, id: currentNode.id });
            currentNode = this.findParentById(currentNode.id);
        }

        return breadcrumb;
    }

    validate(parentNode, nodeOptions, nodeTypeManager) {
        return validateNode(parentNode, nodeOptions, nodeTypeManager);
    }

}
