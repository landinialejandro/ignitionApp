// ProjectTreeview.js

/**
 * Función `slideUp` para ocultar un elemento con una animación.
 * @param {HTMLElement} target - El elemento a ocultar.
 * @param {number} duration - Duración de la animación en milisegundos.
 */
function slideUp(target, duration = 500) {
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = `${duration}ms`;
    target.style.boxSizing = 'border-box';
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight; // Forzar el reflow
    target.style.overflow = 'hidden';
    target.style.height = '0';
    target.style.paddingTop = '0';
    target.style.paddingBottom = '0';
    target.style.marginTop = '0';
    target.style.marginBottom = '0';

    window.setTimeout(() => {
        target.style.display = 'none';
        target.style.removeProperty('height');
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
    }, duration);
}

/**
 * Función `slideDown` para mostrar un elemento con una animación.
 * @param {HTMLElement} target - El elemento a mostrar.
 * @param {number} duration - Duración de la animación en milisegundos.
 */
function slideDown(target, duration = 500) {
    target.style.removeProperty('display');
    let display = window.getComputedStyle(target).display;

    if (display === 'none') {
        display = 'block';
    }

    target.style.display = display;
    const height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = '0';
    target.style.paddingTop = '0';
    target.style.paddingBottom = '0';
    target.style.marginTop = '0';
    target.style.marginBottom = '0';
    target.offsetHeight; // Forzar el reflow
    target.style.boxSizing = 'border-box';
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = `${duration}ms`;
    target.style.height = `${height}px`;

    window.setTimeout(() => {
        target.style.removeProperty('height');
        target.style.removeProperty('overflow');
        target.style.removeProperty('transition-duration');
        target.style.removeProperty('transition-property');
    }, duration);
}

// Exportar las funciones para uso externo, si es necesario
export { slideUp, slideDown };

/**
 * Clase `ProjectTreeview`
 * @description Permite la gestión de la expansión y colapso de nodos en una estructura de árbol.
 * Observa el DOM para detectar dinámicamente la aparición del contenedor `.project-container` dentro de `#app-container`.
 */
export class ProjectTreeview {
    constructor(containerSelector, config = { animationSpeed: 300, accordion: true }) {
        this._containerSelector = containerSelector;
        this._config = config;
        this._container = null;
        this._checkContainerAvailability(); // Comienza a verificar la disponibilidad del contenedor
    }

    /**
     * Verifica periódicamente la disponibilidad del contenedor y lo inicializa si es encontrado.
     */
    _checkContainerAvailability() {
        const container = document.querySelector(this._containerSelector);
        if (container) {
            this._container = container;
            console.log('Contenedor inicializado: ', this._container);
            this._setupEvent(); // Configura los eventos una vez que se encuentra el contenedor
        } else {
            // Vuelve a intentar después de un corto período
            setTimeout(() => {
                this._checkContainerAvailability();
            }, 500); // Intenta cada 500 ms
        }
    }

    /**
     * Configura los eventos de clic en los enlaces de los nodos.
     */
    _setupEvent() {
        if (!this._container) return;

        const nodeLinks = this._container.querySelectorAll('.node-link');
        nodeLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const nodeItem = link.closest('.node-item');
                if (nodeItem) {
                    this.toggle(nodeItem);
                }
            });
        });
    }

    /**
     * Alterna el estado (expandido/colapsado) de un nodo individual.
     * @param {HTMLElement} node - Nodo que se va a alternar.
     */
    toggle(node) {
        if (!this._container) {
            console.warn('El contenedor aún no está disponible. Reintentando...');
            this._checkContainerAvailability(); // Llama al mecanismo de reintento si se intenta antes de tiempo
            return;
        }

        if (node.classList.contains('node-open')) {
            this._closeNode(node);
        } else {
            this._openNode(node);
        }
    }

    _openNode(node) {
        if (!this._container) return;
        if (this._config.accordion) {
            this._closeOtherNodes(node);
        }
        node.classList.add('node-open');
        this._toggleNodeDisplay(node.querySelector('.node-treeview'), true);
        this._dispatchEvent(node, 'projectTreeview.nodeExpanded');
    }

    _closeNode(node) {
        if (!this._container) return;
        node.classList.remove('node-open');
        this._toggleNodeDisplay(node.querySelector('.node-treeview'), false);
        this._dispatchEvent(node, 'projectTreeview.nodeCollapsed');
    }

    _toggleNodeDisplay(target, open) {
        if (!target) return;
        const action = open ? slideDown : slideUp;
        action(target, this._config.animationSpeed);
    }

    _closeOtherNodes(currentNode) {
        if (!this._container) return;
        const openNodes = this._container.querySelectorAll('.node-item.node-open');
        openNodes.forEach(node => {
            if (node !== currentNode) {
                this._closeNode(node);
            }
        });
    }

    _dispatchEvent(node, eventName) {
        const event = new Event(eventName);
        node.dispatchEvent(event);
    }
}
