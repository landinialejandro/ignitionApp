import { get_data, saveFileToServer } from './libraries/common.js';
import { Msglog } from "./libraries/MsgLog.js";
import { $$ } from './libraries/selector.js';

import { NodeTypeManager } from './NodeTypeManager.js';
import { ContextMenu } from './ContextMenu.js';
import { Nodes } from './Nodes.js';

const msg = new Msglog();
let nodeTypeManager = null;
let project = null;

const actionCallbacks = {
    addNewNode: (parentType, anchor, nodeId, typeToAdd) => {
        console.log(`Intentando agregar un nuevo nodo de tipo ${typeToAdd} como hijo de ${parentType} con data-id ${nodeId}`);

        // Busca el nodo padre en el proyecto
        const parentNode = project.findChildById(nodeId);

        if (!parentNode) {
            msg.danger("Nodo padre no encontrado. No se pudo agregar el nuevo nodo.");
            console.error("Nodo padre no encontrado, no se pudo agregar el nuevo nodo.");
            return;
        }

        // Verifica si el tipo de nodo a agregar está permitido como hijo del nodo padre
        if (!nodeTypeManager.isValidChild(parentType, typeToAdd)) {
            msg.danger(`No se permite agregar un nodo de tipo ${typeToAdd} al nodo de tipo ${parentNode.type}.`);
            console.error(`Tipo de nodo ${typeToAdd} no permitido como hijo de ${parentNode.type}.`);
            return;
        }

        // Obtiene las opciones del tipo de nodo desde nodeTypeManager
        const baseOptions = nodeTypeManager.getType(typeToAdd);

        if (!baseOptions) {
            msg.danger(`Tipo de nodo ${typeToAdd} no encontrado en nodeTypeManager.`);
            console.error(`Tipo de nodo ${typeToAdd} no encontrado.`);
            return;
        }

        // Construye el objeto de opciones del nuevo nodo sin especificar ID
        const newNodeOptions = {
            ...baseOptions,
            type: typeToAdd,                 // Incluye las opciones específicas del tipo de nodo
            caption: `Nuevo ${typeToAdd}`   // Título provisional para el nuevo nodo
        };

        // Agrega el nuevo nodo al nodo padre usando el método addChild
        const success = project.addChild(nodeId, newNodeOptions);

        if (success) {
            project.render();  // Renderiza el proyecto actualizado en el DOM
            msg.success(`Nodo de tipo ${typeToAdd} agregado exitosamente como hijo de ${parentType}.`);
            // console.log("Estado del proyecto actualizado:", project.toJSON());
        } else {
            msg.danger("No se pudo agregar el nodo. Verifique el ID proporcionado.");
            console.error("No se pudo agregar el nodo.");
        }
    },

    renameNode: (nodeType, anchor, nodeId) => {
        const newName = prompt("Ingrese el nuevo nombre para el nodo:");
        if (newName) {
            console.log(`Intentando renombrar el nodo de tipo ${nodeType} con ID ${nodeId}`);
            const updated = project.updateNode(nodeId, { caption: newName });
            if (updated) {
                msg.success(`Nodo de tipo ${nodeType} renombrado exitosamente a: ${newName}`);
                project.render();
                console.log("Estado del proyecto actualizado:", project.toJSON());
            } else {
                msg.danger("Nodo no encontrado. No se pudo renombrar.");
                console.log("Nodo no encontrado.");
            }
        }
    },

    deleteNode: (nodeType, anchor, nodeId) => {
        const confirmation = confirm("¿Está seguro de que desea eliminar este nodo?");
        if (confirmation) {
            console.log(`Intentando eliminar el nodo de tipo ${nodeType} con ID ${nodeId}`);
            const deleted = project.removeNode(nodeId);  // Remueve el nodo hijo
            if (deleted) {
                project.render();  // Renderiza el proyecto actualizado en el DOM
                msg.success(`Nodo de tipo ${nodeType} eliminado exitosamente.`);
                console.log("Estado del proyecto actualizado:", project.toJSON());
            } else {
                msg.danger("No se pudo eliminar el nodo. Verifique el ID proporcionado.");
                console.error("No se pudo eliminar el nodo.");
            }
        } else {
            msg.danger("Nodo padre no encontrado. No se pudo eliminar el nodo.");
            console.error("Nodo padre no encontrado, no se pudo eliminar el nodo.");
        }
    }
};


export const initializeProject = async (url) => {
    const content = await get_data({ url });
    const projectPage = await get_data({ url: "pages/project_page.html", isJson: false });
    $$("#main-content").html(projectPage);

    project = new Nodes(".project-card-body");
    project.setNodes(content);
    project.file = url;

    await project.render();
    await initializeNodeTypes();
    addEventsListener();
};

const handleProjectTree = (node) => {
    const { type, name } = $$(node).allData();
    msg.info(`NODElink clicked: ${name}`, true);
    $$(".caption-selected").text(name);

    try {
        switch (type) {
            case "root":
                break;
            case "group":
                break;
            case "table":
                break;
            case "field":
                break;
            case "settings":
                break;
            default:
                msg.warning("Tipo de enlace no soportado.");
                break;
        }
    } catch (error) {
        console.error("Error al manejar el clic:", error);
        msg.danger("Error al cargar el contenido. Verifica la consola para más detalles.");
    }
};

const addEventsListener = () => {
    msg.secondary("addEventsListenerProject", true);
    projectNodesListener();
    contextMenuListener();
    saveProjectListener();
};

const initializeNodeTypes = async () => {
    try {
        nodeTypeManager = new NodeTypeManager();
        await nodeTypeManager.loadFromFile('./settings/types.json');
    } catch (error) {
        console.error('Error al cargar los tipos de nodos:', error);
        throw new Error('No se pudieron cargar los tipos de nodos');
    }
};

const contextMenuListener = () => {
    document.addEventListener('contextmenu', (e) => {
        const anchor = e.target.closest('a.node-link');
        if (anchor) {
            e.preventDefault();
            if (nodeTypeManager) {
                const contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager, actionCallbacks);
                contextMenu.show(e, anchor);
            } else {
                console.error('NodeTypeManager no está inicializado.');
            }
        }
    });
};

const projectNodesListener = () => {
    $$("#main-content").on("click", function (e) {
        const anchor = e.target.closest('a.node-link');
        if (anchor) {
            e.preventDefault();
            handleProjectTree(anchor);
        }
    });
};

const saveProjectListener = () => {
    $$('.save-project-btn').on('click', async function () {
        if (!project?.file || !project?.toJSON()) {
            console.error("El archivo del proyecto o los datos no están definidos.");
            msg.danger("Error: no se puede guardar un proyecto vacío o no inicializado.");
            return;
        }

        const file = project.file;
        const nodes = project.toJSON();

        try {
            const responseData = await saveFileToServer(file, nodes.nodes);
            if (responseData) {
                console.log('Proyecto guardado con éxito');
                return responseData;
            } else {
                throw new Error(`No hubo respuesta para: ${file}`);
            }
        } catch (error) {
            console.error(`Error al guardar el proyecto ${file}:`, error);
            throw error;
        }
    });
};
