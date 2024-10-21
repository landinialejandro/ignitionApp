/**
 * @typedef {import('./types/IconType').IconType} IconType
 */
/**
 * @typedef {import('./types/NodeOptions').NodeOptions} NodeOptions
 */

// import typesData from '../settings/types.json';
import { NodeTypeManager } from './NodeTypeManager.js';


// const nodeTypeManager = new NodeTypeManager(typesData);


// ejemplos de usos

// const nodos = new Nodos();
// * Intentar agregar un nodo root
// const rootNode = new Node({ caption: "Root", type: "root" });
// nodos.addNode(rootNode); // Este se agregará correctamente porque es el primer nodo root

// * Intentar agregar otro nodo root (esto lanzará un error)
// const anotherRoot = new Node({ caption: "Another Root", type: "root" });
// try {
//     nodos.addNode(anotherRoot); // Error: Solo se permite un nodo de tipo root.
// } catch (error) {
//     console.error(error.message); // Muestra el error en la consola
// }

// * Agregar un nodo tipo group como hijo del root
// const groupNode = new Node({ caption: "Group 1", type: "group" });
// nodos.addNode(groupNode, rootNode.id); // Este se agregará correctamente como hijo del root




/**
 * @class Node
 * 
 * La clase `Node` permite crear nodos personalizados con propiedades predefinidas y establecer restricciones de los hijos
 * en función del tipo de nodo. El nodo `root` solo puede tener hijos del tipo `group`, `group` puede tener `table`, 
 * y `table` puede tener `field`.
 * 
 * @example
 * const rootNode = new Node({caption: "Root", type: "root"});
 * const groupNode = new Node({caption: "Group 1", type: "group"});
 * rootNode.addChild(groupNode); // Solo permite agregar nodos tipo 'group'
 */
export class Node {
    constructor(options) {
        this.id = options.id || this.#generateId(); // Generar ID si no se especifica
        this.caption = options.caption || "Default caption";
        this.icon = options.icon || this.#getDefaultIcon(options.type);
        this.li_attr = options.li_attr || { "data-id": this.id };
        this.a_attr = options.a_attr || { "href": "#", "id": `a-${this.id}` };
        this.state = options.state || { "node_open": true };
        this.data = options.data || {};
        this.children = (options.children || []).map(child => new Node(child)); // Convertir los hijos a nodos también
        this.type = options.type || "group"; // Por defecto será 'group'
    }

    // Métodos privados
    #generateId() {
        return `node-${Math.random().toString(36).substr(2, 9)}`;
    }

    #getDefaultIcon(type) {
        return nodeTypeManager.getIcon(type);
    }

    #allowedChildren(type) {
        return  nodeTypeManager.isValidChild(this.type, type);
    }

    addChild(childNode) {
        const allowedChildren = this.#allowedChildren();
        if (!allowedChildren.includes(childNode.type)) {
            throw new Error(`El nodo de tipo ${this.type} solo puede contener nodos de tipo: ${allowedChildren.join(', ')}`);
        }
        this.children.push(childNode);
    }

    toJSON() {
        return {
            id: this.id,
            caption: this.caption,
            icon: this.icon,
            li_attr: this.li_attr,
            a_attr: this.a_attr,
            state: this.state,
            data: this.data,
            children: this.children.map(child => child.toJSON()), // Convertir los hijos a JSON también
            type: this.type
        };
    }
}

/**
 * Clase `Nodos` para manejar una colección de nodos y operaciones relacionadas.
 */
export class Nodes {
    constructor() {
        this.nodes = []; // Lista de nodos raíz
        this.rootNode = null; // Solo puede haber un nodo root
    }

    /**
     * Agrega un nodo a la colección de nodos.
     * Si no tiene un `parentId`, lo agrega como un nodo raíz.
     * Solo permite un nodo `root`. Si ya existe uno, lanzará un error.
     * 
     * @param {Node} node - Nodo a agregar.
     * @param {string} [parentId] - ID del nodo padre, si se debe agregar como hijo de otro nodo.
     */
    addNode(node, parentId = null) {
        const nodeType = node.type;
    
        // Validar si el tipo de nodo es válido
        if (!nodeTypeManager.getType(nodeType)) {
            throw new Error(`El tipo de nodo '${nodeType}' no es válido.`);
        }
    
        if (nodeType === 'root') {
            if (this.rootNode) {
                throw new Error('Solo se permite un nodo de tipo root.');
            }
            if (parentId) {
                throw new Error('El nodo root no puede tener un nodo padre.');
            }
            this.rootNode = node;
            this.nodes.push(node); // Agregar el nodo root
        } else {
            if (!parentId) {
                throw new Error(`Un nodo de tipo '${nodeType}' debe tener un nodo padre.`);
            }
    
            const parentNode = this.findNodeById(parentId);
    
            if (!parentNode) {
                throw new Error(`Nodo con ID ${parentId} no encontrado.`);
            }
    
            // Validar si el nodo padre permite este tipo de hijos
            if (!nodeTypeManager.isValidChild(parentNode.type, nodeType)) {
                throw new Error(`El tipo de nodo '${nodeType}' no es un hijo válido de '${parentNode.type}'.`);
            }
    
            // Validar si se ha alcanzado el número máximo de hijos
            const maxChildren = nodeTypeManager.getMaxChildren(parentNode.type);
            if (parentNode.children.length >= maxChildren) {
                throw new Error(`El nodo padre '${parentNode.type}' ha alcanzado el número máximo de hijos (${maxChildren}).`);
            }
    
            // Añadir el nodo hijo al padre
            parentNode.addChild(node);
        }
    }
    

    /**
     * Busca un nodo en la colección por su ID.
     * 
     * @param {string} id - El ID del nodo a buscar.
     * @returns {Node|null} - Devuelve el nodo encontrado o `null` si no existe.
     */
    findNodeById(id) {
        return this.#findNodeRecursively(id, this.nodes);
    }

    /**
     * Busca un nodo de manera recursiva en la colección de nodos.
     * 
     * @private
     * @param {string} id - El ID del nodo a buscar.
     * @param {Node[]} nodes - Lista de nodos para buscar.
     * @returns {Node|null} - El nodo encontrado o `null` si no existe.
     */
    #findNodeRecursively(id, nodes) {
        for (const node of nodes) {
            if (node.id === id) {
                return node;
            }
            const foundInChildren = this.#findNodeRecursively(id, node.children);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
        return null;
    }

    /**
     * Devuelve todos los nodos en formato JSON.
     * 
     * @returns {Object[]} - Representación JSON de todos los nodos.
     */
    toJSON() {
        return this.nodes.map(node => node.toJSON());
    }
}
