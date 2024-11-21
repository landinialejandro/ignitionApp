// utilities/generateUniqueCaption.js

/**
 * Genera un caption único verificando duplicados en un conjunto de nodos.
 * @param {string} caption - El caption original.
 * @param {Array<{ caption: string }>} nodes - Lista de nodos donde verificar duplicados.
 * @returns {string} - Un caption único.
 */
export function generateUniqueCaption(caption, nodes) {
    let sanitizedCaption = caption.trim().replace(/\s+/g, "_");
    let uniqueCaption = sanitizedCaption;
    let counter = 1;

    const isDuplicate = () => nodes.some(node => node.caption === uniqueCaption);

    while (isDuplicate()) {
        uniqueCaption = `${sanitizedCaption}_${counter}`;
        counter++;
    }

    return uniqueCaption;
}
