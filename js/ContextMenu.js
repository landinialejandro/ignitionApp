// ContextMenu.js

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
        this.menu = document.getElementById(menuId); // Referencia al menú contextual
        this.optionsContainer = document.getElementById(optionsContainerId); // Contenedor de opciones del menú
        this.nodeTypeManager = nodeTypeManager; // Objeto que define las reglas de los nodos
        this.actionCallbacks = actionCallbacks; // Callbacks externos para las acciones
        this.#initializeEventListeners(); // Inicializar los eventos de cierre del menú
    }

    /**
     * Muestra el menú contextual basado en el nodo seleccionado.
     * 
     * @param {Event} event - El evento del clic derecho.
     * @param {HTMLElement} anchor - El elemento que contiene los atributos `data-type` y `data-id`.
     */
    show(event, anchor) {
        if (this.menu.style.display === 'block') {
            this.hide(); // Ocultar si ya está visible
        }
    
        // Limpiar y crear las opciones del menú
        this.#createMenu(anchor);
    
        // Obtener las coordenadas iniciales usando pageX y pageY para una posición absoluta precisa
        let posX = event.pageX;
        let posY = event.pageY;
    
        // Mostrar el menú para calcular su tamaño
        this.menu.style.display = 'block';
    
        // Ajuste de posición si el menú se sale de los límites de la ventana
        const menuRect = this.menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
    
        // Verificar y ajustar la posición en caso de desbordamiento a la derecha o abajo
        if (posX + menuRect.width > windowWidth) {
            posX = windowWidth - menuRect.width - 10; // Deja un margen de 10px
        }
        if (posY + menuRect.height > windowHeight) {
            posY = windowHeight - menuRect.height - 10; // Deja un margen de 10px
        }
    
        // Establecer la posición final del menú
        this.menu.style.top = `${posY}px`;
        this.menu.style.left = `${posX}px`;
    }
    

    /**
     * Crea y agrega ítems de menú contextual basados en el tipo de nodo.
     * 
     * @param {HTMLElement} anchor - El elemento que contiene los datos del nodo.
     */
    #createMenu(anchor) {
        const nodeType = anchor.getAttribute('data-type'); // Obtener el tipo de nodo
        const nodeId = anchor.getAttribute('data-id'); // Obtener el ID del nodo

        this.optionsContainer.innerHTML = ''; // Limpiar las opciones previas

        const nodeConfig = this.nodeTypeManager.getType(nodeType); // Obtener configuración del nodo
        if (!nodeConfig || !nodeConfig.actions || Object.keys(nodeConfig.actions).length === 0) {
            console.warn(`No se encontraron configuraciones válidas para el nodo de tipo '${nodeType}'.`);
            this.hide(); // Ocultar si no hay acciones válidas
            return;
        }

        // Crear y agregar cada elemento del menú basado en las acciones configuradas
        Object.keys(nodeConfig.actions).forEach(actionKey => {
            const action = nodeConfig.actions[actionKey];
            this.#createMenuItem(action, nodeType, anchor, nodeId);
        });
    }

    /**
     * Crea y agrega un ítem de menú contextual.
     * 
     * @param {Object} action - Acción que contiene el label, icono, tipo a agregar (si aplica) y el nombre del callback.
     * @param {string} nodeType - Tipo del nodo que se pasa al callback.
     * @param {HTMLElement} anchor - Elemento que se pasa al callback.
     * @param {string} nodeId - El id del nodo obtenido de data-id que se pasa al callback.
     */
    #createMenuItem(action, nodeType, anchor, nodeId) {
        const callback = this.actionCallbacks[action.callback] || (() => {
            alert(`La acción '${action.callback}' no está configurada.`);
        });

        // Renderizar el elemento de menú contextual utilizando el template Handlebars
        const menuItemHtml = Handlebars.partials['contextmenu']({
            caption: action.label,
            type: action.type || 'ContextMenuOption',
            url: '#',
            icon: {
                type: action.icon?.type,
                value: action.icon?.value
            }
        });

        const tempDiv = document.createElement('div'); // Div temporal para procesar el HTML
        tempDiv.innerHTML = menuItemHtml;
        const li = tempDiv.firstElementChild; // Extraer el elemento `li`

        // Asignar el callback al elemento del menú
        li.addEventListener('click', () => {
            callback(nodeType, anchor, nodeId, action.typeToAdd); // Ejecutar la acción
            this.hide(); // Ocultar el menú después de la acción
        });

        this.optionsContainer.appendChild(li); // Agregar el ítem al contenedor del menú
    }

    /**
     * Oculta el menú contextual.
     */
    hide() {
        this.menu.style.display = 'none';
    }

    /**
     * Inicializa los eventos para ocultar el menú contextual al hacer clic fuera de él.
     */
    #initializeEventListeners() {
        document.addEventListener('click', (e) => {
            if (!this.menu.contains(e.target)) {
                this.hide(); // Ocultar el menú si el clic es fuera de él
            }
        });
    }

    /**
     * Limpia los eventos y elimina el menú contextual del DOM.
     */
    destroy() {
        document.removeEventListener('click', this.hide); // Remover el evento de clic
        this.menu.remove(); // Eliminar el menú del DOM
    }
}
