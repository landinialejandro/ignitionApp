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
     * @param {Event} event - El evento de clic derecho.
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
        // Generar opciones dinámicas según las reglas del nodo
        if (nodeConfig) {
            // Siempre agregar la opción de "Agregar" si hay hijos válidos
            if (nodeConfig.validChildren.length > 0) {
                nodeConfig.validChildren.forEach(childType => {
                    const option = {
                        label: `Agregar Nodo ${childType}`,
                        action: () => this.addNewNode(nodeType, childType)
                    };
                    this.createMenuItem(option);
                });
            }

            // Opción de renombrar si está permitido
            if (nodeConfig.rename) {
                const option = {
                    label: 'Renombrar Nodo',
                    action: () => this.renameNode(nodeType, anchor)
                };
                this.createMenuItem(option);
            }

            // Opción de eliminar si está permitido
            if (nodeConfig.delete) {
                const option = {
                    label: 'Eliminar Nodo',
                    action: () => this.deleteNode(nodeType, anchor)
                };
                this.createMenuItem(option);
            }
        }

        // Posicionar el menú en la ubicación del clic
        this.menu.style.top = `${event.clientY}px`;
        this.menu.style.left = `${event.clientX}px`;
        this.menu.style.display = 'block';
    }

    /**
     * Crea y agrega un ítem de menú contextual con su acción.
     * 
     * @param {Object} option - Opción que contiene el label y la acción del ítem de menú.
     * @returns {void}
     */
    createMenuItem(option) {
        const li = document.createElement('li');
        li.textContent = option.label;
        li.addEventListener('click', () => {
            option.action(); // Ejecutar la acción asociada
            this.hide(); // Ocultar el menú después de seleccionar una opción
        });
        this.optionsContainer.appendChild(li);
    }

    /**
     * Agrega un nuevo nodo como hijo del nodo actual, según las reglas de nodeTypeManager.
     * 
     * @param {string} parentType - Tipo del nodo padre.
     * @param {string} newNodeType - Tipo del nodo que se va a agregar.
     * @returns {void}
     */
    addNewNode(parentType, newNodeType) {
        // Callback para agregar un nuevo nodo
        console.log(`Agregar nodo de tipo ${newNodeType} al nodo de tipo ${parentType}`);
        // Aquí iría la lógica para interactuar con el sistema de nodos
    }

    /**
     * Renombra un nodo actual, si está permitido por las reglas del nodo.
     * 
     * @param {string} nodeType - Tipo del nodo que se va a renombrar.
     * @param {HTMLElement} anchor - El elemento del nodo que se va a renombrar.
     * @returns {void}
     */
    renameNode(nodeType, anchor) {
        // Callback para renombrar el nodo
        const newName = prompt("Ingrese el nuevo nombre para el nodo:");
        if (newName) {
            console.log(`Nodo de tipo ${nodeType} renombrado a: ${newName}`);
            // Aquí iría la lógica para cambiar el nombre en el sistema
        }
    }

    /**
     * Elimina un nodo actual, si está permitido por las reglas del nodo.
     * 
     * @param {string} nodeType - Tipo del nodo que se va a eliminar.
     * @param {HTMLElement} anchor - El elemento del nodo que se va a eliminar.
     * @returns {void}
     */
    deleteNode(nodeType, anchor) {
        // Callback para eliminar el nodo
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
