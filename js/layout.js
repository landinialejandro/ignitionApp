// Simulación de la finalización de la carga de la aplicación
window.addEventListener('load', () => {
  // Espera 2 segundos para simular una carga de datos
  setTimeout(() => {
    document.querySelector('.preloader').classList.add('hidden');
  }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
  // Selección del contenedor principal para la delegación de eventos
  const contentBody = document.querySelector(".content-body");

  // Delegación de eventos para expansión/contracción
  contentBody.addEventListener("click", (event) => {
      const collapseButton = event.target.closest(".button-collapse");

      // Verificar si el elemento clicado es un botón de colapso
      if (collapseButton) {
          const nodeItem = collapseButton.closest(".node-item");

          // Alternar la clase 'expanded' para el nodo
          if (nodeItem.classList.contains("expanded")) {
              nodeItem.classList.remove("expanded");
              collapseButton.classList.remove("expanded");
          } else {
              nodeItem.classList.add("expanded");
              collapseButton.classList.add("expanded");
          }
      }
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const toggleButton = document.querySelector(".sidebar-toggle");

  // Función para alternar manualmente el estado del sidebar
  toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    sidebar.classList.toggle("expanded");
  });

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

  // Llama a la función de tamaño de ventana al cargar la página
  handleResize();

  // Agrega un evento de cambio de tamaño de ventana
  window.addEventListener("resize", handleResize);
});

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');

  // Delegamos el evento 'click' en el contenedor .sidebar
  sidebar.addEventListener('click', (event) => {
      // Verificamos si el clic fue en un elemento .button-collapse
      const button = event.target.closest('.button-collapse');
      if (button) {
          event.preventDefault();
          event.stopPropagation(); // Evita la propagación a otros elementos dentro del nav-item
          
          const navItem = button.closest('.nav-item');
          
          // Alterna la clase 'expanded' en el nav-item
          navItem.classList.toggle('expanded');
          
          // Alterna la clase 'expanded' en el botón
          button.classList.toggle('expanded');
      }
  });
});
