// treeUtils.js
export function calculateMaxDepth(node) {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(calculateMaxDepth));
}

export function canAddChildAtDepth(node, typology) {

    return typology.validateTreeStructure(node, node.type);

    // const currentDepth = calculateMaxDepth(node);
    // const maxDepthAllowed = typology.getMaxDepth(node.type);
    // return currentDepth < maxDepthAllowed;
}

export function getDepth(node, findParentById) {
    let depth = 0;
    let currentNode = node;
    while (currentNode) {
        depth++;
        currentNode = findParentById(currentNode.id);
    }
    return depth;
}

export function nodeToJSON(node) {
    return {
        id: node.id,
        caption: node.caption,
        icon: node.icon,
        li_attr: node.li_attr,
        a_attr: node.a_attr,
        state: node.state,
        properties: node.properties,
        children: node.children.map(nodeToJSON),
        type: node.type
    };
}
