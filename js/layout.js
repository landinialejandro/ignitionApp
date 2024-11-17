// layout.js

// Este archivo contiene la lógica para manejar el sidebar (barra lateral), el treeview (vista en árbol),
// y los botones dentro de .tools-box que realizan distintas acciones. 
// Los botones en tools-box se manejan mediante callbacks para mayor flexibilidad.
// El botón .button-collapse tiene lógica específica para expandir/contraer elementos y no usa callbacks.

// Objeto para registrar callbacks asociados a las acciones de los botones
const buttonActionCallbacks = {};

/**
 * Función para registrar acciones específicas de botones en tools-box.
 * Permite que otros módulos definan el comportamiento de los botones.
 * @param {string} actionClass - Clase específica del botón (sin el prefijo `button-`).
 * @param {function} callback - Función que se ejecutará cuando se haga clic en el botón.
 */
export const registerButtonAction = (actionClass, callback) => {
  buttonActionCallbacks[actionClass] = callback;
};

/**
 * Manejo genérico de botones dentro de .tools-box que tengan la clase .button-tool.
 * Identifica la acción específica a través de la clase del botón y ejecuta el callback registrado.
 * @param {MouseEvent} event - Evento de clic capturado.
 */
const handleButtonToolClick = (event) => {
  const button = event.target.closest(".button-tool");
  if (button) {
    // Evitar comportamiento predeterminado y propagación del evento
    event.preventDefault();
    event.stopPropagation();

    // Identificar la acción específica según la clase (e.g., `button-delete-file`)
    const actionClass = Array.from(button.classList)
      .find((cls) => cls.startsWith("button-") && cls !== "button-tool");

    if (actionClass && buttonActionCallbacks[actionClass]) {
      // Ejecutar el callback registrado para esta acción
      buttonActionCallbacks[actionClass](button, event);
    }
  }
};


/**
 * Función para alternar clases en un elemento.
 * @param {HTMLElement} element - Elemento DOM al que se aplicará la clase.
 * @param {string} className - Clase que se alternará.
 * @param {boolean} [force] - Si se especifica, fuerza la acción (agregar o quitar).
 */
const toggleClass = (element, className, force) => {
  if (force !== undefined) {
    element.classList.toggle(className, force);
  } else {
    element.classList.toggle(className);
  }
};

// Inicializa la lógica del layout una vez que el DOM está listo
const initializeLayout = () => {
  // Selección de elementos clave
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector(".sidebar-toggle");

  /**
   * Ajusta el estado del sidebar dependiendo del tamaño de la ventana.
   * Si el ancho es menor a 600px, el sidebar se colapsa automáticamente.
   */
  const handleResize = () => {
    if (sidebar) {
      if (window.innerWidth < 600) {
        sidebar.classList.add("collapsed");
        sidebar.classList.remove("expanded");
      } else {
        sidebar.classList.remove("collapsed");
        sidebar.classList.add("expanded");
      }
    }
  };

  // Inicializa el estado del sidebar basado en el tamaño de la ventana
  handleResize();

  // Eventos globales
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      toggleClass(sidebar, "collapsed");
      toggleClass(sidebar, "expanded");
    });
  }
  window.addEventListener("resize", handleResize);

  // Delegación para manejar clics en botones dentro de .tools-box (excepto button-collapse)
  document.body.addEventListener("click", (event) => {
    const collapseButton = event.target.closest(".button-collapse");
    if (!collapseButton) {
      handleButtonToolClick(event);
    }
  });

  // Manejo de botones .button-collapse para expandir/contraer elementos
  document.body.addEventListener("click", (event) => {
    const collapseButton = event.target.closest(".button-collapse");
    const navContainer = event.target.closest(".nav-link-container");
    const nodeContainer = event.target.closest(".node-link-container");

    // Manejar el botón collapse en nav-list o node-list
    if (collapseButton) {
      const parentItem = collapseButton.closest(".nav-item, .node-item");
      if (parentItem) {
        const isExpanded = parentItem.classList.contains("expanded");
        toggleClass(parentItem, "expanded", !isExpanded);
        toggleClass(collapseButton, "expanded", !isExpanded);
      }
    }

    // Manejar enlaces activos en nav-list
    if (navContainer && !event.target.closest(".button-collapse")) {
      document.querySelectorAll(".nav-link-container").forEach((link) => {
        link.classList.remove("active");
      });
      navContainer.classList.add("active");
    }

    // Manejar enlaces activos en node-list
    if (nodeContainer && !event.target.closest(".button-collapse")) {
      document.querySelectorAll(".node-link-container").forEach((link) => {
        link.classList.remove("active");
      });
      nodeContainer.classList.add("active");
    }
  });
};

// Ejecutar la inicialización cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", initializeLayout);

export default { registerButtonAction };
