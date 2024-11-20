/**
 * @typedef {import('../../../js/types/NodeOptions.js').NodeOptions} NodeOptions
 */
import { renderTemplate } from '../../../js/libraries/helpers.js';
import { $$ } from '../../../js/libraries/selector.js';

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
        node.id = options.id || node.#generateUniqueId();
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
     * Genera un ID único para el nodo si no se proporciona uno.
     * @returns {string}
     * @private
     */
    #generateUniqueId() {
        return 'node-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Busca un nodo en todo el árbol recursivamente por su ID.
     * @param {string} nodeId - El ID del nodo a buscar.
     * @returns {NodeForest|null} - Retorna el nodo encontrado o null si no se encuentra.
     */
    findChildById(nodeId) {
        for (const node of this.nodes) {
            const found = node.#findInChildren(nodeId);
            if (found) return found;
        }
        return null;
    }

    /**
     * Método privado para buscar recursivamente en `this.children` dentro de un nodo individual.
     * @param {string} nodeId - El ID del nodo a buscar.
     * @returns {NodeForest|null} - Retorna el nodo encontrado o null si no se encuentra.
     * @private
     */
    #findInChildren(nodeId) {
        if (this.id === nodeId) {
            return this;
        }
        for (const child of this.children || []) {
            const found = child.#findInChildren(nodeId);
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
            const parent = this.#findParentInChildren(node, nodeId);
            if (parent) return parent;
        }
        return null;
    }

    /**
     * Método privado para buscar recursivamente el nodo padre dentro de `children`.
     * @param {NodeForest} parentNode - Nodo actual desde el cual se inicia la búsqueda.
     * @param {string} nodeId - El ID del nodo del cual queremos encontrar el padre.
     * @returns {NodeForest|null} - Retorna el nodo padre o null si no se encuentra.
     * @private
     */
    #findParentInChildren(parentNode, nodeId) {
        for (const child of parentNode.children || []) {
            if (child.id === nodeId) {
                return parentNode;
            }
            const foundParent = this.#findParentInChildren(child, nodeId);
            if (foundParent) return foundParent;
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
     * Genera un caption único verificando duplicados en un conjunto de nodos.
     * @param {string} caption - El caption original.
     * @param {NodeForest[]} nodes - Lista de nodos donde verificar duplicados.
     * @returns {string} - Un caption único.
     */
    generateUniqueCaption(caption, nodes) {
        let sanitizedCaption = caption.trim().replace(/\s+/g, "_");
        let uniqueCaption = sanitizedCaption;
        let counter = 1;

        // Verificar si el caption ya existe
        const isDuplicate = () => nodes.some(node => node.caption === uniqueCaption);

        while (isDuplicate()) {
            uniqueCaption = `${sanitizedCaption}_${counter}`;
            counter++;
        }

        return uniqueCaption;
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

        // Generar un caption único según las reglas específicas
        if (nodeOptions.type === "table") {
            // Unicidad global para `table`
            const allNodes = this.getCaptionsByType("table").map(caption => ({ caption }));
            nodeOptions.caption = this.generateUniqueCaption(nodeOptions.caption, allNodes);
        } else if (nodeOptions.type === "group") {
            // Unicidad local para `group`
            nodeOptions.caption = this.generateUniqueCaption(nodeOptions.caption, parentNode.children);
        } else if (parentNode.type === "table" && nodeOptions.type === "field") {
            // Unicidad local para `field` dentro de `table`
            nodeOptions.caption = this.generateUniqueCaption(nodeOptions.caption, parentNode.children);
        }

        // Verificar si el tipo de hijo es válido para el padre
        if (!this.nodeTypeManager.isValidChild(parentNode.type, nodeOptions.type)) {
            console.error(`El nodo de tipo '${nodeOptions.type}' no es un hijo válido para el nodo de tipo '${parentNode.type}'.`);
            return false;
        }

        // Verificar si se puede agregar el nodo en el nivel actual (mirando hacia abajo)
        if (!this.canAddChildAtDepth(parentNode)) {
            console.error(`No se puede añadir un nodo de tipo '${nodeOptions.type}' porque excede la profundidad máxima permitida para '${parentNode.type}'.`);
            return false;
        }

        // Crear el nodo y agregarlo como hijo
        const newNode = NodeForest.#createNode(nodeOptions);
        parentNode.children.push(newNode);
        return true;
    }

    /**
     * Calcula la profundidad máxima alcanzada desde un nodo específico hacia sus descendientes.
     * @param {NodeForest} node - El nodo desde el cual calcular la profundidad.
     * @returns {number} - La profundidad máxima hacia los hijos desde este nodo.
     */
    calculateMaxDepth(node) {
        if (!node.children || node.children.length === 0) {
            return 1; // Un nodo sin hijos tiene una profundidad de 1
        }

        let maxDepth = 0;
        for (const child of node.children) {
            maxDepth = Math.max(maxDepth, this.calculateMaxDepth(child));
        }
        return maxDepth + 1; // +1 para incluir el nodo actual en el cálculo
    }

    /**
    * Verifica si un nodo puede agregar un hijo sin exceder el `maxDepth` permitido.
    * @param {NodeForest} node - Nodo donde se quiere agregar el nuevo hijo.
    * @returns {boolean} - True si se puede agregar el nodo, false si no.
    */
    canAddChildAtDepth(node) {
        // Calcula la profundidad máxima actual desde el nodo hacia abajo
        const currentDepth = this.calculateMaxDepth(node);

        // Obtiene el maxDepth permitido para este nodo desde `types.json`
        const maxDepthAllowed = this.nodeTypeManager.getMaxDepth(node.type);

        // Verifica si la profundidad actual es menor que el máximo permitido
        return currentDepth < maxDepthAllowed;
    }

    /**
     * Obtener la profundidad de un nodo a partir de su ID.
     * @param {string} nodeId - El ID del nodo.
     * @returns {number} - La profundidad del nodo en el árbol.
     */
    getDepth(nodeId) {
        let depth = 0;
        let currentNode = this.findChildById(nodeId);
        while (currentNode) {
            depth++;
            currentNode = this.findParentById(currentNode.id);
        }
        return depth;
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
            Object.assign(node, properties);
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

    /**
     * Devuelve una lista de captions de los nodos que coinciden con un tipo específico.
     * @param {string} type - El tipo de nodo a buscar.
     * @returns {string[]} - Lista de captions de los nodos encontrados.
     */
    getCaptionsByType(type) {
        const captions = [];

        /**
         * Recorre recursivamente los nodos para encontrar los que coinciden con el tipo.
         * @param {NodeForest[]} nodes - Lista de nodos a recorrer.
         */
        const traverse = (nodes) => {
            for (const node of nodes) {
                if (node.type === type) {
                    captions.push(node.caption);
                }
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            }
        };

        // Iniciar la búsqueda en los nodos raíz
        traverse(this.nodes);

        return captions;
    }

}
