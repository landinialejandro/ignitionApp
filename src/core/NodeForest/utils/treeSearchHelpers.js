// * src/core/NodeForest/helpers/treeSearchHelpers.js

/**
 * Función genérica para recorrer recursivamente un árbol y ejecutar una acción personalizada en cada nodo.
 * @param {Object|Object[]} nodes - Nodo o lista de nodos a recorrer.
 * @param {function} callback - Función que se ejecutará en cada nodo. Debe retornar true para detener la búsqueda.
 * @returns {any} - Retorna el resultado de la primera ejecución de callback que sea true, o null si no hay coincidencias.
 */
function traverseTree(nodes, callback) {
    // Normalizar el input a un array de nodos
    const nodeList = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of nodeList) {
        const result = callback(node);
        if (result) return result;

        if (node.children && node.children.length > 0) {
            const childResult = traverseTree(node.children, callback);
            if (childResult) return childResult;
        }
    }
    return null;
}

/**
 * Busca recursivamente un nodo dentro de una estructura de árbol por su ID.
 * @param {Object[]} nodes - Lista de nodos a recorrer.
 * @param {string} nodeId - El ID del nodo a buscar.
 * @returns {Object|null} - Retorna el nodo encontrado o null si no se encuentra.
 */
export function findInChildren(nodes, nodeId) {
    return traverseTree(nodes, (node) => (node.id === nodeId ? node : null));
}

/**
 * Busca recursivamente el nodo padre de un nodo con un ID específico.
 * @param {Object[]} nodes - Lista de nodos a recorrer.
 * @param {string} nodeId - El ID del nodo del cual queremos encontrar el padre.
 * @returns {Object|null} - Retorna el nodo padre o null si no se encuentra.
 */
export function findParentInChildren(nodes, nodeId) {
    return traverseTree(nodes, (parent) => {
        if (parent.children?.some((child) => child.id === nodeId)) {
            return parent;
        }
        return null;
    });
}

/**
 * Recorre recursivamente los nodos para recolectar los captions de un tipo específico.
 * @param {Object[]} nodes - Lista de nodos a recorrer.
 * @param {string} type - Tipo de nodo a buscar.
 * @returns {string[]} - Lista de captions de los nodos encontrados.
 */
export function traverseAndCollectCaptionsByType(nodes, type) {
    const captions = [];
    traverseTree(nodes, (node) => {
        if (node.type === type) captions.push(node.caption);
        return null; // Continúa la búsqueda
    });
    return captions;
}
