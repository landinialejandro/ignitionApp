/**
 * @class ContextMenu
 * 
 * La clase `ContextMenu` genera un menú contextual dinámico basado en las configuraciones proporcionadas 
 * por un `nodeTypeManager`. Las acciones disponibles (como agregar, renombrar, eliminar) y los íconos que 
 * las acompañan están definidos por el tipo de nodo seleccionado. Los ítems del menú incluyen sus correspondientes
 * íconos y ejecutan los callbacks asignados a cada acción, que pueden ser proporcionados externamente.
 * 
 * @param {string} menuId - El ID del elemento HTML que actúa como el menú contextual.
 * @param {string} optionsContainerId - El ID del elemento HTML que contiene las opciones del menú contextual.
 * @param {Object} nodeTypeManager - Un objeto que gestiona los tipos de nodos, sus acciones permitidas, iconos y las relaciones entre ellos.
 * @param {Object} actionCallbacks - Un objeto que contiene los callbacks personalizados para cada acción.
 */

export class ContextMenu {
    constructor(menuId, optionsContainerId, nodeTypeManager, actionCallbacks = {}) {
        this.menu = document.getElementById(menuId); // Menú contextual
        this.optionsContainer = document.getElementById(optionsContainerId); // Contenedor de opciones
        this.nodeTypeManager = nodeTypeManager; // nodeTypeManager externo que gestiona nodos y sus reglas
        this.actionCallbacks = actionCallbacks; // Callbacks personalizados proporcionados externamente
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
        // Obtener el tipo de nodo y el id desde los atributos data del anchor
        const nodeType = anchor.getAttribute('data-type');
        const nodeId = anchor.getAttribute('data-id'); // Captura el id del nodo desde data-id

        // Limpiar las opciones anteriores
        this.optionsContainer.innerHTML = '';

        // Obtener las reglas del nodo desde el nodeTypeManager
        const nodeConfig = this.nodeTypeManager.getType(nodeType);

        // Si hay una configuración válida para el nodo, generar las opciones
        if (nodeConfig) {
            // Iterar sobre las acciones definidas en el nodo
            Object.keys(nodeConfig.actions).forEach(actionKey => {
                const action = nodeConfig.actions[actionKey];
                
                // Crear opción con el callback proporcionado o un placeholder
                const option = {
                    label: action.label,
                    callback: this.actionCallbacks[action.callback] || (() => {
                        console.warn(`Callback para '${action.callback}' no definido.`);
                    }),
                    icon: nodeConfig.icon
                };
                this.createMenuItem(option, nodeType, anchor, nodeId);
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
     * @param {string} nodeType - Tipo del nodo que se pasa al callback.
     * @param {HTMLElement} anchor - Elemento que se pasa al callback.
     * @param {string} nodeId - El id del nodo obtenido de data-id que se pasa al callback.
     * @returns {void}
     */
    createMenuItem(option, nodeType, anchor, nodeId) {
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
            option.callback(nodeType, anchor, nodeId); // Ejecutar la acción con tipo de nodo, elemento y id
            this.hide(); // Ocultar el menú después de seleccionar una opción
        });

        // Añadir la opción al contenedor del menú
        this.optionsContainer.appendChild(li);
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
