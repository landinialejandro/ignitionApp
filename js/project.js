// project.js
// ok TODO: falta comandos para agregar file o folder en sidebar
// TODO: programar el boton borrar del nodo, verificar si puede y debe estar
// TODO: Programar los botones del tool de los cards
// TODO: Programar cambiar el caption de los nodos
// TODO: cambiar el codigo para guardar ls radios
// TODO: Ordenar el seting como primer nodo.
// TODO: cuando hago click en el breadcrum hay que ir al nodo seleccionado
// TODO: guardar tambien los estados del nodo, abierto o cerrado



/**
 * Este archivo gestiona la lógica principal de un sistema de gestión de nodos y árbol de proyecto.
 * Incluye inicialización, manejo de eventos, acciones en los nodos y renderizado dinámico.
 */

import { get_data, saveFileToServer } from './libraries/common.js';
import { getDirCollectionJson, renderTemplate } from './libraries/helpers.js';
import { Msglog } from "./libraries/MsgLog.js";
import { $$ } from './libraries/selector.js';

import Constants from './Constants.js';
import { ContextMenu } from './ContextMenu.js';
import { Nodes } from './Nodes.js';
import { NodeTypeManager } from './NodeTypeManager.js';

// Variables globales necesarias para la gestión del proyecto
const msg = new Msglog();
const nodeTypeManager = new NodeTypeManager();
const project = new Nodes();

// Instancia única del menú contextual
let contextMenu = null;

/**
 * Inicializa el proyecto cargando los tipos de nodos y la página de proyecto.
 * 
 * @param {string} url - URL del archivo JSON con los datos del proyecto.
 */
export const initializeProject = async (url) => {
    try {
        await nodeTypeManager.loadFromFile('./settings/types.json');
        const content = await get_data({ url });
        const projectPage = await get_data({ url: "pages/project_page.html", isJson: false });

        // Renderizar la estructura base del proyecto
        $$(Constants.CONTENT).html(projectPage);

        project.nodeTypeManager = nodeTypeManager
        project.container = ".project-container";
        project.file = url;
        project.setNodes(content);

        await project.render();

        addEventsListener();
    } catch (error) {
        msg.danger("Error al inicializar el proyecto.");
        console.error(error);
    }
};

/**
 * Callbacks personalizados para acciones en el árbol de nodos.
 */
const actionCallbacks = {
    /**
     * Agrega un nuevo nodo al árbol.
     */
    addNewNode: async (parentType, anchor, nodeId, typeToAdd) => {
        try {
            console.log(`Agregando nodo de tipo ${typeToAdd}`);
            const parentNode = project.findChildById(nodeId);

            if (!parentNode) {
                throw new Error("Nodo padre no encontrado.");
            }

            // Validaciones específicas del tipo de nodo
            if (typeToAdd === "settings" && project.getChildrenTypes(nodeId).includes(typeToAdd)) {
                throw new Error("Ya existe un nodo de tipo 'settings' en este nivel.");
            }
            if (typeToAdd === "root" && project.hasNodeOfType("root")) {
                throw new Error("Ya existe un nodo de tipo 'root'.");
            }
            if (!nodeTypeManager.isValidChild(parentType, typeToAdd)) {
                throw new Error(`Tipo de nodo ${typeToAdd} no permitido como hijo de ${parentType}.`);
            }

            const baseOptions = nodeTypeManager.getType(typeToAdd);
            if (!baseOptions) {
                throw new Error(`Tipo de nodo ${typeToAdd} no encontrado.`);
            }

            // Crear un nuevo nodo con opciones base
            const newNodeOptions = {
                ...baseOptions,
                type: typeToAdd,
                caption: `Nuevo ${typeToAdd}`,
                children: []
            };

            // Inicializar nodos de tipo "settings" si corresponde
            if (typeToAdd === "settings") {
                await initializeSettingsNode(parentType, newNodeOptions);
            }

            // Agregar el nodo al proyecto
            const success = project.addChild(nodeId, newNodeOptions);

            if (success) {
                await project.render();
                msg.success(`Nodo ${typeToAdd} agregado exitosamente.`);
            } else {
                throw new Error("No se pudo agregar el nodo.");
            }
        } catch (error) {
            msg.danger(error.message || "Error al agregar el nodo.");
            console.error(error);
        }
    },

    /**
     * Renombra un nodo del árbol.
     */
    renameNode: (nodeType, anchor, nodeId) => {
        const newName = prompt("Ingrese el nuevo nombre:");
        if (newName) {
            let sanitizedCaption = newName.trim().replace(/\s+/g, "_");
            const updated = project.updateNode(nodeId, { caption: sanitizedCaption });
            if (updated) {
                msg.success(`Nodo renombrado a ${newName}.`);
                project.render();
            } else {
                msg.danger("No se pudo renombrar el nodo.");
            }
        }
    },

    /**
     * Elimina un nodo del árbol.
     */
    deleteNode: (nodeType, anchor, nodeId) => {
        if (confirm("¿Eliminar este nodo?")) {
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

/**
 * Inicializa los nodos de configuración ("settings") con archivos de un directorio.
 * tomo cada archivo el directorio y lo agrego al setting como un children.
 * 
 * @param {string} parentType - Tipo del nodo padre.
 * @param {Object} newNodeOptions - Opciones base del nuevo nodo.
 */
const initializeSettingsNode = async (parentType, newNodeOptions) => {
    try {
        const settingsPath = `settings/${parentType}`;
        const filesContent = await getDirCollectionJson(settingsPath);

        for (const [key, fileInfo] of Object.entries(filesContent)) {
            const content = await get_data({ url: fileInfo.url });
            newNodeOptions.children.push({
                caption: content.caption || "Elemento de configuración",
                url: fileInfo.url,
                type: "settingItem",
                a_class: fileInfo.a_class,
                icon: content.icon,
                children: fileInfo.children || false,
                properties: content
            });
        }

        msg.success("Elementos de configuración agregados.");
    } catch (error) {
        msg.danger("Error al cargar elementos de configuración.");
        throw error;
    }
};

/**
 * Maneja el clic en nodos del árbol de proyecto.
 * 
 * @param {HTMLElement} node - Nodo que fue clickeado.
 */
const handleProjectTree = async (node) => {
    try {
        const { id } = $$(node).allData();
        const selected = project.findChildById(id);

        if (!selected) {
            throw new Error("Nodo no encontrado.");
        }

        $$('.node-link-container').removeClass('active')
        $$(`#${id}`).addClass('active')

        const breadcrumb = Handlebars.partials['breadcrumb'](project.getBreadcrumb(id));
        $$('.breadcrumb').html(breadcrumb);

        if (selected.properties) {
            const html = await renderTemplate("templates/properties.hbs", selected);
            $$(".editor-container").html(html);
        }
    } catch (error) {
        msg.danger(error.message || "Error al manejar el nodo.");
        console.error(error);
    }
};

/**
 * Agrega los listeners principales del proyecto.
 */
const addEventsListener = () => {
    saveProjectListener();
    nodeProjectListener();
    contextMenuListener();
    saveNodeListener();
};

/**
 * Listener para guardar el proyecto.
 */
const saveProjectListener = () => {
    $$('.save-project-btn').on('click', async () => {
        try {
            const nodes = project.toJSON();
            const response = await saveFileToServer(project.file, nodes.nodes);
            if (response) {
                msg.success('Proyecto guardado.');
            } else {
                throw new Error("Error al guardar proyecto.");
            }
        } catch (error) {
            msg.danger(error.message || "Error al guardar proyecto.");
            console.error(error);
        }
    });
};

const saveNodeListener = () => {
    $$(Constants.CONTENT).on('submit', '#properties-form', (e) => {
        e.preventDefault();
        // Captura el formulario y el ID del nodo
        const form = e.target;
        const nodeId = form.getAttribute('data-id');

        // Recolecta todos los inputs del formulario
        const inputs = form.querySelectorAll("input, textarea, select");
        const updatedValues = [];

        // Procesa todos los inputs
        inputs.forEach(input => {
            if (input.type === "checkbox" || input.type === "radio") {
                // Incluye todos los checkbox y radios con su estado checked
                updatedValues.push({
                    caption: input.name || input.id,
                    checked: input.checked // true si está marcado, false si no
                });
            } else {
                // Procesa otros tipos de input (text, textarea, select)
                updatedValues.push({
                    caption: input.name || input.id,
                    value: input.value
                });
            }
        });

        const node = project.findChildById(nodeId);
        console.log(updatedValues);

        // Actualiza las propiedades con map
        node.properties.properties = node.properties.properties.map((v, k) => {
            console.log(v, k);
            return { ...v, ...updatedValues[k] }; // Crea un nuevo objeto con las actualizaciones
        });

        console.log(node.properties.properties);

    })
}

/**
 * Listener para manejar clics en nodos del árbol.
 */
const nodeProjectListener = () => {
    $$(Constants.CONTENT).on("click", (e) => {
        const nodeLink = e.target.closest('.node-link-container');
        if (nodeLink) {
            handleProjectTree(nodeLink);
        }
    });
};

/**
 * Listener para mostrar el menú contextual.
 */
const contextMenuListener = () => {
    if (!contextMenu) {
        contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager, actionCallbacks);
    }

    $$(Constants.CONTENT).on("click", '.button-add-child', (e) => {
        const link = e.target.closest('.node-link-container');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            contextMenu.show(e, link);
        }
    });
};
