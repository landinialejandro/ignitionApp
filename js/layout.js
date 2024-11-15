// // Simulación de la finalización de la carga de la aplicación
// window.addEventListener('load', () => {
//   // Espera 2 segundos para simular una carga de datos
//   setTimeout(() => {
//     document.querySelector('.preloader').classList.add('hidden');
//   }, 1000);
// });

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const contentBody = document.querySelector(".content-body");
  const toggleButton = document.querySelector(".sidebar-toggle");

  // Función para alternar clases
  const toggleClass = (element, className, force) => {
    if (force !== undefined) {
      element.classList.toggle(className, force);
    } else {
      element.classList.toggle(className);
    }
  };

  // Función para manejar el colapso del sidebar
  const handleSidebarToggle = () => {
    toggleClass(sidebar, "collapsed");
    toggleClass(sidebar, "expanded");
  };

  // Función para manejar el cambio de tamaño de la ventana
  const handleResize = () => {
    if (window.innerWidth < 600) {
      sidebar.classList.add("collapsed");
      sidebar.classList.remove("expanded");
    } else {
      sidebar.classList.remove("collapsed");
      sidebar.classList.add("expanded");
    }
  };

  // Función para gestionar el estado activo del nav-link-container
  const setActiveNavLink = (selectedLink) => {
    // Quita la clase 'active' de todos los elementos
    document.querySelectorAll(".nav-link-container").forEach((link) => {
      link.classList.remove("active");
    });

    // Agrega la clase 'active' al elemento seleccionado
    if (selectedLink) {
      selectedLink.classList.add("active");
    }
  };

  // Inicializa el estado del sidebar según el tamaño de la ventana
  handleResize();

  // Eventos
  if (toggleButton) {
    toggleButton.addEventListener("click", handleSidebarToggle);
  }
  window.addEventListener("resize", handleResize);

  // Delegación de eventos para treeview y sidebar collapse
  document.body.addEventListener("click", (event) => {
    const collapseButton = event.target.closest(".button-collapse");
    const navButton = event.target.closest(".nav-item .button-collapse");
    const navLink = event.target.closest(".nav-link-container");

    if (collapseButton) {
      const nodeItem = collapseButton.closest(".node-item");
      if (nodeItem) {
        const isExpanded = nodeItem.classList.contains("expanded");
        toggleClass(nodeItem, "expanded", !isExpanded);
        toggleClass(collapseButton, "expanded", !isExpanded);
      }
    }

    if (navButton) {
      event.preventDefault();
      event.stopPropagation();
      const navItem = navButton.closest(".nav-item");
      if (navItem) {
        const isExpanded = navItem.classList.contains("expanded");
        toggleClass(navItem, "expanded", !isExpanded);
        toggleClass(navButton, "expanded", !isExpanded);
      }
    }

    if (navLink && !event.target.closest(".button-collapse")) {
      // Establece la clase 'active' en el elemento seleccionado
      setActiveNavLink(navLink);
    }
  });
});
