/**
 * @class ContextMenu
 * 
 * La clase `ContextMenu` genera un menú contextual dinámico basado en las configuraciones proporcionadas 
 * por un `nodeTypeManager`. Las acciones disponibles (como agregar, renombrar, eliminar) y los íconos que 
 * las acompañan están definidos por el tipo de nodo seleccionado. Los ítems del menú incluyen sus correspondientes
 * íconos y ejecutan los callbacks asignados a cada acción.
 * 
 * @param {string} menuId - El ID del elemento HTML que actúa como el menú contextual.
 * @param {string} optionsContainerId - El ID del elemento HTML que contiene las opciones del menú contextual.
 * @param {Object} nodeTypeManager - Un objeto que gestiona los tipos de nodos, sus acciones permitidas, iconos y las relaciones entre ellos.
 * 
 * @example
 ** // Ejemplo de estructura de nodeTypeManager:
 * const nodeTypeManager = {
 *   root: {
 *     maxChildren: 8,
 *     maxDepth: 50,
 *     icon: { 
 *       type: "class", 
 *       value: "bi bi-archive" 
 *     },
 *     actions: {
 *       rename: { 
 *         label: "Renombrar nodo", 
 *         callback: "renameNode" 
 *       },
 *       delete: { 
 *         label: "Eliminar nodo", 
 *         callback: "deleteNode" 
 *       },
 *       add: { 
 *         label: "Agregar nuevo grupo", 
 *         callback: "addNewGroup" 
 *       }
 *     },
 *     validChildren: ["group"],
 *     description: "Nodo principal y nombre del proyecto, no se puede borrar, pero sí se puede renombrar."
 *   },
 *   group: {
 *     maxChildren: 30,
 *     maxDepth: 50,
 *     icon: { 
 *       type: "svg", 
 *       value: "<svg viewBox='...' />" 
 *     },
 *     actions: {
 *       rename: { 
 *         label: "Renombrar grupo", 
 *         callback: "renameNode" 
 *       },
 *       delete: { 
 *         label: "Eliminar grupo", 
 *         callback: "deleteNode" 
 *       },
 *       add: { 
 *         label: "Agregar nueva tabla", 
 *         callback: "addNewTable" 
 *       }
 *     },
 *     validChildren: ["table"],
 *     description: "Agrupa las tablas para dar formato a la página principal."
 *   },
 *   table: {
 *     maxChildren: 20,
 *     maxDepth: 50,
 *     icon: { 
 *       type: "class", 
 *       value: "bi bi-table" 
 *     },
 *     actions: {
 *       rename: { 
 *         label: "Renombrar tabla", 
 *         callback: "renameNode" 
 *       },
 *       delete: { 
 *         label: "Eliminar tabla", 
 *         callback: "deleteNode" 
 *       },
 *       add: { 
 *         label: "Agregar nuevo campo", 
 *         callback: "addNewField" 
 *       }
 *     },
 *     validChildren: ["field"],
 *     description: "Tabla asociada a un grupo."
 *   },
 *   field: {
 *     maxChildren: 0,
 *     maxDepth: 50,
 *     icon: { 
 *       type: "class", 
 *       value: "bi bi-card-heading" 
 *     },
 *     actions: {
 *       rename: { 
 *         label: "Renombrar campo", 
 *         callback: "renameNode" 
 *       },
 *       delete: { 
 *         label: "Eliminar campo", 
 *         callback: "deleteNode" 
 *       }
 *     },
 *     validChildren: [],
 *     description: "Campos de una tabla."
 *   }
 * };
 * 
 ** // En tu archivo HTML:
 * <ul id="context-menu" style="display:none; position:absolute; z-index:1000;">
 *   <li id="menu-options"></li>
 * </ul>
 * 
 ** // En tu archivo JavaScript:
 * import { ContextMenu } from './ContextMenu.js';
 * 
 ** // Instancia del menú contextual
 * const contextMenu = new ContextMenu('context-menu', 'menu-options', nodeTypeManager);
 * 
 ** // Evento para mostrar el menú contextual cuando se hace clic derecho en un elemento
 * document.addEventListener('contextmenu', function (e) {
 *   const anchor = e.target.closest('a.node-link');
 *   if (anchor) {
 *     e.preventDefault(); // Prevenir el menú contextual predeterminado
 *     contextMenu.show(e, anchor); // Mostrar el menú contextual personalizado
 *   }
 * });
 * 
 * @example
 ** // Ejemplo de uso:
 * const anchor = document.querySelector('a.node-link[data-type="group"]');
 * const event = new MouseEvent('contextmenu', { clientX: 100, clientY: 100 });
 * contextMenu.show(event, anchor); // Muestra el menú contextual para un nodo de tipo "group"
 * 
 ** // Opción "Agregar":
 * contextMenu.addNewTable('group', anchor); // Agrega un nodo de tipo "table" bajo un nodo de tipo "group"
 */

export class ContextMenu {
    constructor(menuId, optionsContainerId, nodeTypeManager) {
        this.menu = document.getElementById(menuId); // Menú contextual
        this.optionsContainer = document.getElementById(optionsContainerId); // Contenedor de opciones
        this.nodeTypeManager = nodeTypeManager; // nodeTypeManager externo que gestiona nodos y sus reglas
        this.initializeEventListeners(); // Inicializar eventos para cerrar el menú
    }

    /**
     * Muestra el menú contextual basado en el nodo seleccionado.
     * 
     * @param {Event} event - El evento del clic derecho.
     * @param {HTMLElement} anchor - El elemento anchor que fue clickeado y contiene el atributo `data-type`.
     * @returns {void}
     */
    show(event, anchor) {
        // Obtener el tipo de nodo desde el atributo data-type
        const nodeType = anchor.getAttribute('data-type');

        // Limpiar las opciones anteriores
        this.optionsContainer.innerHTML = '';

        // Obtener las reglas del nodo desde el nodeTypeManager
        const nodeConfig = this.nodeTypeManager.getType(nodeType);

        // Si hay una configuración válida para el nodo, generar las opciones
        if (nodeConfig) {
            // Iterar sobre las acciones definidas en el nodo
            Object.keys(nodeConfig.actions).forEach(actionKey => {
                const action = nodeConfig.actions[actionKey];
                const option = {
                    label: action.label,
                    callback: this[action.callback].bind(this, nodeType, anchor), // Asignar el callback dinámico
                    icon: nodeConfig.icon
                };
                this.createMenuItem(option);
            });
        }

        // Posicionar el menú en la ubicación del clic
        this.menu.style.top = `${event.clientY}px`;
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.display = 'block';
    }

    /**
     * Crea y agrega un ítem de menú contextual utilizando el partial 'menuitem.hbs'.
     * 
     * @param {Object} option - Opción que contiene el label, icono y la acción (callback) del ítem de menú.
     * @returns {void}
     */
    createMenuItem(option) {
        // Renderizar el 'li' utilizando el template partial 'menuitem.hbs'
        const menuItemHtml = Handlebars.partials['projectItem']({
            caption: option.label,
            type: option.type || 'ContextMenuOption', // Puedes cambiarlo según el tipo de opción
            url: '#',                       // Puedes ajustar el URL según la lógica que tengas
            icon: {
                type: option.icon.type,
                value: option.icon.value
            }
        });

        // Crear un div temporal para insertar el HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = menuItemHtml;

        // Obtener el 'li' generado por el partial
        const li = tempDiv.firstElementChild;

        // Asignar la acción (callback)
        li.addEventListener('click', () => {
            option.callback(); // Ejecutar la acción asociada
            this.hide(); // Ocultar el menú después de seleccionar una opción
        });

        // Añadir la opción al contenedor del menú
        this.optionsContainer.appendChild(li);
    }

    /**
     * Callback para agregar un nuevo nodo como hijo del nodo actual, según las reglas de nodeTypeManager.
     * 
     * @param {string} parentType - Tipo del nodo padre.
     * @param {HTMLElement} anchor - Elemento del nodo padre.
     * @returns {void}
     */
    addNewNode(parentType, anchor) {
        console.log(`Agregar un nuevo Nodo al nodo de tipo ${parentType}`);
        // Aquí iría la lógica para agregar un nuevo grupo
    }

    /**
     * Callback para renombrar un nodo actual.
     * 
     * @param {string} nodeType - Tipo del nodo que se va a renombrar.
     * @param {HTMLElement} anchor - Elemento del nodo que se va a renombrar.
     * @returns {void}
     */
    renameNode(nodeType, anchor) {
        const newName = prompt("Ingrese el nuevo nombre para el nodo:");
        if (newName) {
            console.log(`Nodo de tipo ${nodeType} renombrado a: ${newName}`);
            // Aquí iría la lógica para cambiar el nombre en el sistema
        }
    }

    /**
     * Callback para eliminar un nodo actual.
     * 
     * @param {string} nodeType - Tipo del nodo que se va a eliminar.
     * @param {HTMLElement} anchor - El elemento del nodo que se va a eliminar.
     * @returns {void}
     */
    deleteNode(nodeType, anchor) {
        const confirmation = confirm("¿Está seguro de que desea eliminar este nodo?");
        if (confirmation) {
            console.log(`Nodo de tipo ${nodeType} eliminado.`);
            // Aquí iría la lógica para eliminar el nodo en el sistema
        }
    }

    /**
     * Oculta el menú contextual.
     * 
     * @returns {void}
     */
    hide() {
        this.menu.style.display = 'none';
    }

    /**
     * Inicializa los eventos para ocultar el menú contextual al hacer clic fuera de él.
     * 
     * @returns {void}
     */
    initializeEventListeners() {
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide();
            }
        });
    }
}
