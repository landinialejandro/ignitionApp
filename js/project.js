// * file:js/project.js

// TODO: cambiar el codigo para guardar ls radios
// TODO: cuando hago click en el breadcrum hay que ir al nodo seleccionado
// TODO: guardar tambien los estados del nodo, abierto o cerrado

/**
 * Este archivo gestiona la lógica principal de un sistema de gestión de nodos y árbol de proyecto.
 * Incluye inicialización, manejo de eventos, acciones en los nodos y renderizado dinámico.
 */

import { get_data, sanitizeInput, saveFileToServer } from '../src/index.js';
import { getDirCollectionJson } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';

import { ContextMenu } from './ContextMenu.js';
import { NodeForest, renderTemplateToContainer, toastmaster, getUserInput, validateGenericInput, uniqueId } from '../src/index.js';
import { Constants } from '../src/index.js';
import { Typology } from '../src/index.js';

import { registerButtonAction } from './layout.js';

// Variables globales necesarias para la gestión del proyecto
const project = new NodeForest();

// Instancia única del menú contextual
let contextMenu = null;

/**
 * Inicializa el proyecto cargando los tipos de nodos y la página de proyecto.
 * 
 * @param {string} url - URL del archivo JSON con los datos del proyecto.
*/
export const initializeProject = async (url) => {
    try {
        const typology = new Typology(await get_data({ url: "./settings/types.json" })); //obtengo los type
        const content = await get_data({ url }); // obtengo los json
        const projectPage = await get_data({ url: "pages/project_page.html", isJson: false }); //cargo la pagina del base del proyecto un contendore con dos card en columns

        // Renderizar la estructura base del proyecto
        $$(Constants.CONTENT).html(projectPage); //cargo en html el proyecto base

        project.typology = typology
        project.container = ".project-container"; // le digo al project dóinde debe poner el reendirazdo, es un content/body del card
        project.file = url;

        if (content === null) {
            const defOptions = project.typology.getType('root');
            console.warn('El archivo está vacío.');
            const newRoot = {
                id: defOptions.id || 'root',
                caption: defOptions.caption || 'New Project',
                type: 'root',
                properties: [],
                children: [],
                icon: defOptions.icon || ""
            };
            addPropertiesToNode("root", newRoot);
            project.setNodes([newRoot]);
        } else {
            project.setNodes(content);
        }

        await project.render(); // reenderiza

        addEventsListener(); // cargo los listeners
    } catch (error) {
        const msg = "Error al inicializar el proyecto.";
        toastmaster.handleError(msg, error);
    }
};

export const toolsBoxListenerProject = (buttonId, callback) => {

    registerButtonAction('button-delete-node', (button, e) => {
        const link = button.closest('.node-link-container');
        if (link) {
            const data = $$(link).allData();
            actionCallbacks.deleteNode(data.type, link, data.id);
        }
    });

    registerButtonAction('button-options-node', (button, e) => {
        const link = button.closest('.node-link-container');
        if (link) {
            if (!contextMenu) {
                contextMenu = new ContextMenu('context-menu', 'menu-options', project.typology, actionCallbacks);
            }
            contextMenu.show(e, link);
        }
    });

    registerButtonAction('button-save-project', (button, e) => {
        saveProject();
    })

}

/**
 * Callbacks personalizados para acciones en el árbol de nodos.
 */
const actionCallbacks = {
    /**
     * Agrega un nuevo nodo al árbol.
     */
    addNewNode: async (parentType, anchor, nodeId, typeToAdd) => {
        try {
            toastmaster.info(`Agregando nodo de tipo ${typeToAdd}`);
            const parentNode = project.findChildById(nodeId);

            if (!parentNode) {
                throw new Error("Nodo padre no encontrado.");
            }

            if (typeToAdd === "root" && project.hasNodeOfType("root")) {
                throw new Error("Ya existe un nodo de tipo 'root'.");
            }

            const baseOptions = project.typology.getType(typeToAdd);
            if (!baseOptions) {
                throw new Error(`Tipo de nodo ${typeToAdd} no encontrado.`);
            }

            // Crear un nuevo nodo con opciones base
            const newNodeOptions = {
                ...baseOptions,
                type: typeToAdd,
                caption: project.generateUniqueCaption(`Nuevo ${typeToAdd}`, project.nodes),
                properties: [],
                children: []
            };

            // Validaciones específicas del tipo de nodo
            if (typeToAdd === "table" && project.getListCaptionsByType(project.nodes, "table").includes(newNodeOptions.caption)) {
                throw new Error("Ya existe una tabla con ese nombre.");
            }

            // agrega las propiedades de un nuevo nodo
            await addPropertiesToNode(typeToAdd, newNodeOptions);


            // Agregar el nodo al proyecto
            const success = project.addChild(nodeId, newNodeOptions);

            if (success) {
                await project.render();
                toastmaster.success(`Nodo ${typeToAdd} agregado exitosamente.`);
            } else {
                throw new Error("No se pudo agregar el nodo.");
            }
        } catch (error) {
            const msg = "Error al agregar el nodo.";
            toastmaster.handleError(msg, error);
        }
    },

    /**
     * Renombra un nodo del árbol.
     */
    renameNode: (nodeType, anchor, nodeId) => {
        const newName = getUserInput("Ingrese el nuevo nombre:", validateGenericInput);
        const parentNode = project.findParentById(nodeId);
        const currentNode = project.findChildById(nodeId);

        if (newName) {
            let sanitizedCaption = sanitizeInput(newName, true);

            const nodeOptions = { ...currentNode, caption: sanitizedCaption }; // Clonar el nodo original con el nuevo 

            // Validaciones centralizadas
            const validation = project.validate(parentNode, nodeOptions, typology);
            if (!validation.isValid) {
                toastmaster.danger(validation.message);
                return false;
            }

            const updated = project.updateNode(nodeId, nodeOptions);
            if (updated) {
                toastmaster.success(`Nodo renombrado a ${newName}.`);
                project.render();
            } else {
                toastmaster.danger("No se pudo renombrar el nodo.");
            }
        }
        else {
            toastmaster.danger('Operación cancelada o entrada inválida.');
        }
    },

    /**
     * Elimina un nodo del árbol.
     */
    deleteNode: (nodeType, anchor, nodeId) => {
        if (confirm("¿Eliminar este nodo?")) {
            const currentNode = project.findChildById(nodeId);
            const deleted = project.removeNode(nodeId);
            if (deleted) {
                project.render();
                toastmaster.success(`Nodo ${currentNode.caption} del tipo ${currentNode.type} eliminado.`);
            } else {
                toastmaster.danger("No se pudo eliminar el nodo.");
            }
        } else {
            toastmaster.danger('Operación cancelada.');
        }
    }
};

/**
 * Inicializa los nodos de configuración ("settings") con archivos de un directorio.
 * tomo cada archivo el directorio y lo agrego al setting como un children.
 * 
 * @param {string} typeToAdd - Tipo del nodo padre.
 * @param {Object} newNodeOptions - Opciones base del nuevo nodo.
 */
const addPropertiesToNode = async (typeToAdd, newNodeOptions) => {
    try {
        const settingsPath = `settings/${typeToAdd}`;
        const filesContent = await getDirCollectionJson(settingsPath);

        for (const [key, fileInfo] of Object.entries(filesContent)) {
            const content = await get_data({ url: fileInfo.url });
            const id = uniqueId();
            newNodeOptions.properties.push({
                id, ...content
            });
        }

        toastmaster.success("Elementos de configuración agregados.");
    } catch (error) {
        const msg = "Error al cargar elementos de configuración.";
        toastmaster.handleError(msg, error);
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

        if (!selected) throw new Error("Nodo no encontrado.");

        $$('.node-link-container').removeClass('active')
        $$(`#${id}`).addClass('active')

        const breadcrumb = Handlebars.partials['breadcrumb'](project.getBreadcrumb(id));
        $$('.breadcrumb').html(breadcrumb);

        if (selected.properties) {
            await renderTemplateToContainer("templates/view_properties.hbs", selected, ".editor-container");
        }
    } catch (error) {
        const msg = "Error al manejar el nodo.";
        toastmaster.handleError(msg, error);
    }
};

/**
 * Agrega los listeners principales del proyecto.
 */
const addEventsListener = () => {
    nodeProjectListener();
    saveNodeListener();
};

/**
 * Listener para guardar el proyecto.
 */
const saveProject = async () => {
    try {
        const nodes = project.toJSON();
        const response = await saveFileToServer(project.file, nodes.nodes);
        if (response) {
            toastmaster.success('Proyecto guardado.');
        } else {
            throw new Error("Error al guardar proyecto.");
        }
    } catch (error) {
        const msg = "Error al guardar el proyecto.";
        toastmaster.handleError(msg, error);
    }
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

        // Actualiza las propiedades con map
        node.properties.properties = node.properties.properties.map((v, k) => {
            toastmaster.echo(v, k);
            return { ...v, ...updatedValues[k] }; // Crea un nuevo objeto con las actualizaciones
        });
    })
}

/**
 * Listener para manejar clics en nodos del árbol.
 */
const nodeProjectListener = () => {
    // Delegar eventos al contenedor estático
    $$(".node-link").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const nodeLink = e.target.closest('.node-link-container');
        if (!nodeLink) return;

        toastmaster.secondary('node click');
        handleProjectTree(nodeLink);
    });
};
