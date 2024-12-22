// * file:js/project.js

// TODO: guardar tambien los estados del nodo, abierto o cerrado, se define un callback en layout para renderizarlos dinamicamente

/**
 * Este archivo gestiona la lógica principal de un sistema de gestión de nodos y árbol de proyecto.
 * Incluye inicialización, manejo de eventos, acciones en los nodos y renderizado dinámico.
 */

import { registerButtonAction } from './layout.js';
import { getDirCollectionJson } from './libraries/helpers.js';
import { $$ } from './libraries/selector.js';
import { ContextMenu } from './ContextMenu.js';

import { get_data, sanitizeInput, saveFileToServer, validateErrorsForm } from '../src/commons/index.js';
import { getUserInput, validateGenericInput, uniqueId } from '../src/commons/index.js';
import { renderTemplateToContainer, procesInputForm } from '../src/commons/index.js';
import { Constants } from '../src/commons/index.js';

import { Typology } from '../src/core/index.js';
import { toastmaster } from '../src/core/index.js';
import { NodeForest } from '../src/core/index.js';
import { chopTree } from '../src/core/index.js';
import { validateProperties } from '../src/core/index.js';


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
                caption: defOptions.caption || 'New_Project',
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

        await projectRender(); // reenderiza

        addEventsListener(); // cargo los listeners
    } catch (error) {
        const msg = "Error al inicializar el proyecto.";
        toastmaster.handleError(msg, error);
    }
};

/**
 * Registra los listeners para los botones de la barra de herramientas que actúan sobre nodos.
 * Los botones se identifican por sus IDs (`button-delete-node`, `button-options-node`, `button-save-project`).
 * Cada botón tiene una función asociada que recibe como parámetro el objeto `data` que contiene la
 * información del nodo sobre el que se actúa.
 * La función `operation` se encarga de delegar la acción adecuada en función del botón que se ha
 * seleccionado y de los datos del nodo.
 */
export const toolsBoxListenerProject = () => {

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

    registerButtonAction('button-add-child-node', (button, e) => {
        const link = button.closest('.node-link-container');
        if (link) {
            const data = $$(link).allData();
            const typeToAdd = project.typology.getType(data.type);
            actionCallbacks.addNewNode(data.type, link, data.id, typeToAdd.actions.add?.typeToAdd);
        }
    });

    registerButtonAction('button-save-project', (button, e) => {
        projectSave();
    })

    registerButtonAction('button-refresh', (button, e) => {
        console.log('refresh!');
        projectRender();
    })

    registerButtonAction('button-magic', (button, e) => {
        console.log('magic!');

        const { id, type } = getDataFromActiveLink();

        const rootNode = project.findChildById('root-node');
        if (!rootNode) {
            toastmaster.danger('Root no encontrado.');
            return;
        }

        const lastBuild = getValueByPropertyIDAndCaption(rootNode, 'versioning', 'Build');

        setValueByPropertyIDAndCaption(rootNode, 'versioning', 'Build', parseInt(lastBuild) + 1);

        console.log(lastBuild);


        const choptree = chopTree(project.nodes);

        choptree.forEach(objeto => {
            const nodo = project.findChildById(objeto.idnode);
            if (nodo) {
                setValueByPropertyIDAndCaption(nodo, 'generated-sql', 'SQL Script', objeto.sql);
            }
        });

        console.log(choptree);
        projectRender();

        if (id) handleProjectTree(id);
    })

}


function getValueByPropertyIDAndCaption(node, propertyID, caption) {
    const property = node.properties.find(p => p.id === propertyID);
    if (property) {
        const innerProperty = property.properties.find(p => p.caption === caption);
        if (innerProperty) {
            return innerProperty.value;
        }
    }
    return null;
}

function setValueByPropertyIDAndCaption(node, propertyID, caption, value) {
    const property = node.properties.find(p => p.id === propertyID);
    if (property) {
        const innerProperty = property.properties.find(p => p.caption === caption);
        if (innerProperty) {
            innerProperty.value = value;
        }
    }
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
                await projectRender();
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
        let parentNode = project.findParentById(nodeId);

        const currentNode = project.findChildById(nodeId);

        if (currentNode.type === "root" & !parentNode) {
            toastmaster.danger("Se renombra el nodo raíz.");
            parentNode = { ...currentNode };
        }

        if (newName) {
            let sanitizedCaption = sanitizeInput(newName, true);

            const nodeOptions = { ...currentNode, caption: sanitizedCaption }; // Clonar el nodo original con el nuevo 

            // Validaciones centralizadas
            const validation = project.validate(parentNode, nodeOptions);
            if (!validation.isValid) {
                toastmaster.danger(validation.message);
                return false;
            }

            const updated = project.updateNode(nodeId, nodeOptions);
            if (updated) {
                toastmaster.success(`Nodo renombrado a ${newName}.`);
                projectRender();
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
                projectRender();
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
const handleProjectTree = async (id) => {
    try {

        const selected = project.findChildById(id);

        if (!selected) throw new Error("Nodo no encontrado.");

        activeLink(id);
        renderBreadcrumb(id);

        if (selected.properties) {
            await renderTemplateToContainer("templates/view_properties.hbs", [selected], ".editor-container");
        }
    } catch (error) {
        const msg = "Error al manejar el nodo.";
        toastmaster.handleError(msg, error);
    }
};

const renderBreadcrumb = (nodeId) => {
    const breadcrumb = Handlebars.partials['breadcrumb'](project.getBreadcrumb(nodeId));
    $$('.breadcrumb').html(breadcrumb);
}

const activeLink = (nodeId) => {
    $$('.node-link-container').removeClass('active')
    setTimeout(() => {
        const selectedNode = $$(`#${nodeId}`);

        if (selectedNode) {
            selectedNode.addClass('active')
            selectedNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, 100);
}

const getDataFromActiveLink = () => {
    const activeLink = $$('.node-link-container.active');
    const { id, type } = activeLink.allData();
    return { id, type };
}


/**
 * Agrega los listeners principales del proyecto.
 */
const addEventsListener = () => {
    nodeProjectListener();
    saveNodeListener();
    breadcrumbListener();
};

/**
 * Listener para guardar el proyecto.
 */
const projectSave = async () => {
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

export const projectRender = async() => {
    await project.render();
}

const saveNodeListener = () => {
    $$('.editor-container').on('submit', '.card-body', (event) => {
        event.preventDefault();

        const form = event.target;
        const { id: propertieId } = form.dataset;
        const { id: nodeId } = form.closest('.node').dataset;

        const updatedValues = procesInputForm(form);
        const updatedValuesObj = Object.fromEntries(updatedValues.map((item) => [item.caption, item.value]));

        console.log(updatedValues);
        console.log(updatedValuesObj);

        const node = project.findChildById(nodeId);
        if (!node) {
            toastmaster.danger('Nodo no encontrado.');
            return;
        }

        const nodeProperties = node.properties;
        const propIndex = nodeProperties.findIndex((p) => p.id === propertieId);

        if (propIndex === -1) {
            toastmaster.danger('Propiedad no encontrada.');
            return;
        }

        const prop = nodeProperties[propIndex];

        const errors = validateProperties(prop.properties, updatedValues);

        if (!validateErrorsForm(form, errors)) {
            updateNodeProperties(node, propIndex, updatedValuesObj);

            toastmaster.success('Se han realizado cambios.');
            console.log(node.properties);
            projectRender();
        } else {
            toastmaster.danger('No se han realizado cambios.');
        }
    });
};

const updateNodeProperties = (node, propIndex, updatedValuesObj) => {
    const prop = node.properties[propIndex];
    const newCaption = updatedValuesObj["Caption"];
    const newIcon = updatedValuesObj["icon class"];

    node.properties[propIndex] = {
        ...prop,
        caption: newCaption || prop.caption,
        icon: {
            ...prop.icon,
            value: newIcon || prop.icon.value
        },
        properties: prop.properties.map((p) => {
            return p.caption in updatedValuesObj ? { ...p, value: updatedValuesObj[p.caption] } : p;
        })
    };
};


/**
 * Listener para manejar clics en nodos del árbol.
 */
const nodeProjectListener = () => {
    // Delegar eventos al contenedor estático
    $$(".project-container").on("click", ".node-link", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const nodeLink = e.target.closest('.node-link-container');
        if (!nodeLink) return;

        toastmaster.secondary('node click');
        const { id } = $$(nodeLink).allData();
        handleProjectTree(id);
    });
};

const breadcrumbListener = () => {
    $$('.breadcrumb').on('click', '.breadcrumb-item', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const breadcrumbLink = e.target.closest('.breadcrumb-link');
        if (!breadcrumbLink) return;

        const { id } = $$(breadcrumbLink).allData();
        handleProjectTree(id);
    });
};