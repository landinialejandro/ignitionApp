// * file: src/core/ChopTree/chopTree.js

/**
 * ChopTree - Módulo para convertir estructuras de nodos jerárquicos (NodeForest)
 * en esquemas SQL. Este módulo analiza nodos y genera scripts SQL basados en 
 * estructuras como tablas, campos y propiedades específicas.
 *
 * @module ChopTree
 */

/**
 * Convierte un NodeForest en un script SQL.
 *
 * @param {Array} nodeForest - Array de nodos jerárquicos (NodeForest).
 * @returns {string} Script SQL generado.
 */
export function chopTree(nodeForest) {
    let sqlScript = '';

    // Buscar el nodo raíz para el nombre de la base de datos
    const rootNode = nodeForest.find(node => node.type === 'root');
    if (!rootNode) {
        throw new Error("No se encontró un nodo raíz ('root') en el NodeForest.");
    }
    const databaseName = rootNode.caption;

    // Crear la base de datos
    sqlScript += `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;\nUSE \`${databaseName}\`;\n\n`;

    // Función recursiva para procesar nodos
    function processNodes(nodeList) {
        let tableSQL = '';
        nodeList.forEach(node => {
            if (node.type === 'table') {
                const tableName = node.caption;
                tableSQL += `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;

                // Recoger campos de la tabla
                const fields = node.children.filter(child => child.type === 'field');
                const fieldDefinitions = fields.map(field => {
                    const fieldName = field.caption;

                    // Extraer propiedades dinámicamente según captions
                    const fieldTypeProp = field.properties.find(prop => prop.caption === 'Data Type');
                    const fieldType = fieldTypeProp?.properties?.find(p => p.checked)?.caption || 'VARCHAR';

                    const fieldLengthProp = field.properties.find(prop => prop.caption === 'Lenght');
                    const fieldLength = fieldLengthProp?.properties?.[0]?.value || '255';

                    const primaryKeyProp = field.properties.find(prop => prop.caption === 'Database options value');
                    const isPrimaryKey = primaryKeyProp?.properties?.some(p => p.caption === 'Primary key' && p.value);

                    const requiredProp = field.properties.find(prop => prop.caption === 'Check options value');
                    const isRequired = requiredProp?.properties?.some(p => p.caption === 'Required' && p.value);

                    // Generar definición de columna
                    let columnDef = `\`${fieldName}\` ${fieldType}(${fieldLength})`;
                    if (isRequired) columnDef += ' NOT NULL';
                    if (isPrimaryKey) columnDef += ' PRIMARY KEY';

                    return columnDef;
                });

                tableSQL += fieldDefinitions.join(',\n');
                tableSQL += `\n);\n\n`;
            }

            // Procesar nodos hijos recursivamente
            if (node.children && node.children.length > 0) {
                tableSQL += processNodes(node.children);
            }
        });
        return tableSQL;
    }

    // Procesar todos los nodos hijos del nodo raíz
    sqlScript += processNodes(rootNode.children);

    return sqlScript;
}

