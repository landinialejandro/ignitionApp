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

    if (actionClass && buttonActionCallbacks[actionClass]) {
      requestAnimationFrame(() => {
        buttonActionCallbacks[actionClass](button, event);
      });
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
      const isSmallScreen = window.innerWidth < 600;
      sidebar.classList.toggle("collapsed", isSmallScreen);
      sidebar.classList.toggle("expanded", !isSmallScreen);
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
    const cardContainer = event.target.closest(".card-header");

    if (collapseButton) {
      const parentItem = collapseButton.closest(".nav-item, .node-item, .card");
      if (parentItem) {
        const isExpanded = parentItem.classList.contains("expanded");
        requestAnimationFrame(() => {
          toggleClass(parentItem, "expanded", !isExpanded);
          toggleClass(collapseButton, "expanded", !isExpanded);
        });
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

  });

  document.body.addEventListener("click", handleButtonToolClick);
};

// Inicializa el layout y la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  initializeLayout();
  initializeApp();
});

export default { registerButtonAction };
