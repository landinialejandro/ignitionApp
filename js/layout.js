// * file: js/layout.js

import { initializeApp } from "./app.js";

// Registro de callbacks para acciones de botones en tools-box
const buttonActionCallbacks = {};

/**
 * Registra acciones específicas de botones en tools-box.
 * @param {string} actionClass - Clase del botón (sin el prefijo `button-`).
 * @param {function} callback - Función a ejecutar al hacer clic en el botón.
 */
export const registerButtonAction = (actionClass, callback) => {
  buttonActionCallbacks[actionClass] = callback;
};

// Registro de callbacks para acciones del boton collapse en cualquier contexto
const collapseActionCallbacks = {};

export const registerCollapseAction = (contextClass, callback) => {
  collapseActionCallbacks[contextClass] = callback;
};

/**
 * Manejo genérico de botones con clase .button-tool.
 * Ejecuta los callbacks registrados según la clase específica del botón.
 */
const handleButtonToolClick = (event) => {
  const button = event.target.closest(".button-tool");
  if (button) {
    event.preventDefault();
    event.stopPropagation();

    const actionClass = Array.from(button.classList).find(
      (cls) => cls.startsWith("button-") && cls !== "button-tool"
    );

    console.log(`${actionClass} clicked`);

    if (actionClass && buttonActionCallbacks[actionClass]) {
      console.log(`${actionClass} action fired`);
      requestAnimationFrame(() => {
        buttonActionCallbacks[actionClass](button, event);
      });
    } else {
      console.log(`${actionClass} unregistered action`);
    }
  }
};

/**
 * Alterna clases en un elemento con la opción de forzar acción.
 * @param {HTMLElement} element - Elemento DOM.
 * @param {string} className - Clase a alternar.
 * @param {boolean} [force] - Fuerza agregar o quitar la clase.
 */
const toggleClass = (element, className, force) => {
  element.classList.toggle(className, force);
};

// Inicialización de la lógica del layout
const initializeLayout = () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector(".sidebar-toggle");
  let resizeTimeout;

  /**
   * Ajusta el estado del sidebar según el ancho de la ventana.
   * Usa debounce para limitar recalculos.
   */
  const handleResize = () => {
    if (sidebar) {
      const isSmallScreen = window.innerWidth < 1200;
      toggleClass(sidebar, "collapsed", isSmallScreen);
      toggleClass(sidebar, "expanded", !isSmallScreen);
    }
  };

  const debouncedHandleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  };

  handleResize(); // Estado inicial del sidebar
  window.addEventListener("resize", debouncedHandleResize);

  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      requestAnimationFrame(() => {
        toggleClass(sidebar, "collapsed");
        toggleClass(sidebar, "expanded");
      });
    });
  }

  // Delegación para manejar botones en tools-box y botones de colapso
  document.body.addEventListener("click", (event) => {
    const collapseButton = event.target.closest(".button-collapse");
    const navContainer = event.target.closest(".nav-link-container");
    const nodeContainer = event.target.closest(".node-link-container");
    const foldItemContainer = event.target.closest(".ignition-fold-item");
    const closeModal = event.target.closest(".button-close-modal");
    const modalContainer = event.target.closest(".modal-container");

    if (collapseButton) {
      const parentItem = collapseButton.closest(".nav-item, .node-item, .card, .ignition-fold-item");
      if (parentItem) {
        const contextClass = Array.from(parentItem.classList).find(cls =>
          Object.keys(collapseActionCallbacks).includes(cls)
        );

        if (contextClass && collapseActionCallbacks[contextClass]) {
          // Comportamiento personalizado si hay callback registrado
          collapseActionCallbacks[contextClass](parentItem, collapseButton);
        } else {
          // Comportamiento genérico si no hay callback registrado
          const isExpanded = parentItem.classList.contains("expanded");
          requestAnimationFrame(() => {
            toggleClass(parentItem, "expanded", !isExpanded);
            toggleClass(collapseButton, "expanded", !isExpanded);
          });
        }
      }
    }

    if (navContainer) {
      requestAnimationFrame(() => {
        document.querySelectorAll(".nav-link-container").forEach((link) =>
          link.classList.remove("active")
        );
        navContainer.classList.add("active");
      });
    }

    if (nodeContainer) {
      requestAnimationFrame(() => {
        document.querySelectorAll(".node-link-container").forEach((link) =>
          link.classList.remove("active")
        );
        nodeContainer.classList.add("active");
      });
    }

    if (closeModal) {
      console.log('closing modal container');
      requestAnimationFrame(() => {
        modalContainer.classList.add('fade-out');
        setTimeout(() => {
          modalContainer.classList.remove('active');
        }, 300); // Tiempo de la transición definido en CSS
      });
    }

  });

  document.body.addEventListener("click", handleButtonToolClick);
};

// Inicializa el layout y la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  initializeLayout();
  initializeApp();
});

export default { registerButtonAction };
