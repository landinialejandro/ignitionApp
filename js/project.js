// project.js

import { get_data, saveFileToServer } from './libraries/common.js';
import { getDirCollectionJson, renderTemplate } from './libraries/helpers.js';
import { Msglog } from "./libraries/MsgLog.js";
import { $$ } from './libraries/selector.js';
import { ProjectTreeview } from './libraries/ProjectTreeview.js';

import Constants from './constants.js';
import { ContextMenu } from './ContextMenu.js';
import { Nodes } from './Nodes.js';
import { NodeTypeManager } from './NodeTypeManager.js';

const Default$ = {
    animationSpeed: 300,
    accordion: true
};

const msg = new Msglog();
let nodeTypeManager = null;
let project = null;
let treeview = null;

export const initializeProject = async (url) => {
    await initializeNodeTypes();
    const content = await get_data({ url });
    const projectPage = await get_data({ url: "pages/project_page.html", isJson: false });
    $$(Constants.CONTENT).html(projectPage);

    project = new Nodes(".project-container", nodeTypeManager);
    project.setNodes(content);
    project.file = url;
    project.nodeTypeManager = nodeTypeManager;

    await project.render();
    addEventsListener();
};

const actionCallbacks = {
    addNewNode: async (parentType, anchor, nodeId, typeToAdd) => {
        console.log(`Agregando nodo de tipo ${typeToAdd}`);
        const parentNode = project.findChildById(nodeId);
        if (!parentNode) {
            msg.danger("Nodo padre no encontrado.");
            return;
        }
        const childrenTypes = project.getChildrenTypes(nodeId);
        if (typeToAdd === "settings" && childrenTypes.includes(typeToAdd)) {
            msg.danger("Ya existe un nodo de tipo 'settings' en este nivel.");
            return;
        }
        if (typeToAdd === "root" && project.hasNodeOfType("root")) {
            msg.danger("Ya existe un nodo de tipo 'root'.");
            return;
        }
        if (!nodeTypeManager.isValidChild(parentType, typeToAdd)) {
            msg.danger(`Tipo de nodo ${typeToAdd} no permitido.`);
            return;
        }
        const baseOptions = nodeTypeManager.getType(typeToAdd);
        if (!baseOptions) {
            msg.danger(`Tipo de nodo ${typeToAdd} no encontrado.`);
            return;
        }
        const newNodeOptions = {
            ...baseOptions,
            type: typeToAdd,
            caption: `Nuevo ${typeToAdd}`,
            children: []
        };
        if (typeToAdd === "settings") {
            try {
                const settingsPath = `settings/${parentType}`;
                const filesContent = await getDirCollectionJson(settingsPath);
                for (const [key, fileInfo] of Object.entries(filesContent)) {
                    const content = await get_data({ url: fileInfo.url });
                    const childNode = {
                        caption: content.caption || "Elemento de configuración",
                        url: fileInfo.url,
                        type: "settingItem",
                        a_class: fileInfo.a_class,
                        icon: content.icon,
                        children: fileInfo.children || false,
                        properties: content
                    };
                    newNodeOptions.caption = "Settings";
                    newNodeOptions.children.push(childNode);
                }
                msg.success("Elementos de configuración agregados.");
            } catch (error) {
                msg.danger("Error al cargar elementos de configuración.");
                console.error(error);
                return;
            }
        }
        const success = project.addChild(nodeId, newNodeOptions);
        if (success) {
            project.render();
            msg.success(`Nodo ${typeToAdd} agregado exitosamente.`);
        } else {
            msg.danger("No se pudo agregar el nodo.");
        }
    },
    renameNode: (nodeType, anchor, nodeId) => {
        const newName = prompt("Ingrese el nuevo nombre:");
        if (newName) {
            const updated = project.updateNode(nodeId, { caption: newName });
            if (updated) {
                msg.success(`Nodo renombrado a ${newName}.`);
                project.render();
            } else {
                msg.danger("No se pudo renombrar el nodo.");
            }
        }
    },
    deleteNode: (nodeType, anchor, nodeId) => {
        const confirmation = confirm("¿Eliminar este nodo?");
        if (confirmation) {
            const deleted = project.removeNode(nodeId);
            if (deleted) {
                project.render();
                msg.success(`Nodo ${nodeType} eliminado.`);
            } else {
                msg.danger("No se pudo eliminar el nodo.");
            }
        }
    }
};

const handleProjectTree = async (node) => {
    const { id } = $$(node).allData();
    const selected = project.findChildById(id);
    if (!selected) {
        msg.danger("Nodo no encontrado.");
        return;
    }
    if (selected.properties) {
        const html = await renderTemplate("templates/properties.hbs", selected);
        $$(".editor-container").html(html);
    }
    // await renderChildrenRecursively(selected);
};

const initializeNodeTypes = async () => {
    try {
        nodeTypeManager = new NodeTypeManager();
        await nodeTypeManager.loadFromFile('./settings/types.json');
    } catch (error) {
        msg.danger('Error al cargar tipos de nodos.');
        console.error(error);
    }
};

const addEventsListener = () => {
    saveProjectListener();
    nodeProjectListener();
    contextMenuListener();
};

const saveProjectListener = () => {
    $$('.save-project-btn').on('click', async () => {
        const nodes = project.toJSON();
        const response = await saveFileToServer(project.file, nodes.nodes);
        if (response) {
            msg.success('Proyecto guardado.');
        } else {
            msg.danger("Error al guardar proyecto.");
        }
    });
};

const nodeProjectListener = () => {
    $$(Constants.CONTENT).on("click", (e) => {
        const nodeLink = e.target.closest('.node-link');
        if (nodeLink) {
            handleProjectTree(nodeLink);
        }
    });
};

const contextMenuListener = () => {
    $$('.button-add-child').on("click", (e)=>{
        const link = e.target.closest('.node-link-container');
        if (link) {
            e.preventDefault();
            if (nodeTypeManager) {
                const contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager, actionCallbacks);
                contextMenu.show(e, link);
            }
        }
    })
};

// const contextMenuListener = () => {
//     document.addEventListener('contextmenu', (e) => {
//         // Verificar si el clic derecho fue en el botón .button-add-child
//         const button = e.target.closest('.button-add-child');
        
//         if (button) {
//             e.preventDefault();
            
//             if (nodeTypeManager) {
//                 // Crear una instancia de ContextMenu si no existe
//                 let contextMenu = document.getElementById('context-menu');
                
//                 if (!contextMenu) {
//                     // Si el menú no existe, crearlo dinámicamente
//                     contextMenu = document.createElement('div');
//                     contextMenu.id = 'context-menu';
//                     contextMenu.classList.add('menu-options');
//                     document.body.appendChild(contextMenu);
//                 }
                
//                 // Inicializar y mostrar el menú contextual en la posición del clic derecho
//                 const contextMenuInstance = new ContextMenu('context-menu', 'menu-options', nodeTypeManager, actionCallbacks);
//                 contextMenuInstance.show(e, button);
//             }
//         }
//     });

//     // Ocultar el menú contextual al hacer clic fuera de él
//     document.addEventListener('click', (event) => {
//         const contextMenu = document.getElementById('context-menu');
//         if (contextMenu && !event.target.closest('#context-menu')) {
//             contextMenu.style.display = 'none';
//         }
//     });
// };

