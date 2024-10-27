import { get_data, saveFileToServer } from './libraries/common.js';
import { Msglog } from "./libraries/MsgLog.js";
import { $$ } from './libraries/selector.js';

import { NodeTypeManager } from './NodeTypeManager.js';
import { ContextMenu } from './ContextMenu.js';
import { Nodes } from './Nodes.js';

const msg = new Msglog();  // Se asegura la declaración de msg
let nodeTypeManager = null;
let project = null;

const actionCallbacks = {
    addNewNode: (parentType, anchor, nodeId) => {
        console.log(`Agregar un nuevo nodo al nodo de tipo ${parentType}`);
        console.log(parentType, nodeId);
    },
    renameNode: (nodeType, anchor, nodeId) => {
        const newName = prompt("Ingrese el nuevo nombre para el nodo:");
        if (newName) {
            console.log(nodeType, nodeId);
            console.log(`Nodo de tipo ${nodeType} renombrado a: ${newName}`);
            const updated = project.updateNode(nodeId, { caption: newName });
            if (updated) {
                console.log("Nodo actualizado exitosamente");
                project.render();
                console.log(project.toJSON());
            } else {
                console.log("Nodo no encontrado");
            }
        }
    },
    deleteNode: (nodeType, anchor, nodeId) => {
        const confirmation = confirm("¿Está seguro de que desea eliminar este nodo?");
        if (confirmation) {
            console.log(nodeType, nodeId);
            console.log(`Nodo de tipo ${nodeType} eliminado.`);
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
                // Lógica específica para root
                break;
            case "group":
                // Lógica específica para grupo
                break;
            case "table":
                // Lógica específica para tabla
                break;
            case "field":
                // Lógica específica para campo
                break;
            case "settings":
                // Lógica específica para configuración
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
        const folder = project.file;
        const nodes = project.toJSON();
        try {
                msg.info("saving project");
                //TODO: se puede controlar si el nombre es valido antes de pasarlo a la función

                const data = {
                    operation: "save_file",
                    type: "json",
                    id: folder,
                    text: "",
                    content: JSON.stringify(nodes.nodes),
                }
                //save projet
                const responseData = await get_data({
                    url: "ignitionApp.php", data, 
                })

            if (responseData) {
                console.log('Proyecto guardado con éxito');
                return responseData;
            } else {
                throw new Error(`No se obtuvieron datos para la carpeta: ${folder}`);
            }
        } catch (error) {
            console.error(`Error al guardar el proyecto para el directorio ${folder}:`, error);
            throw error;
        }
    });
};
