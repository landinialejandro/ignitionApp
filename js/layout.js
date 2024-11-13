// Simulación de la finalización de la carga de la aplicación
// window.addEventListener('load', () => {
//   // Espera 2 segundos para simular una carga de datos
//   setTimeout(() => {
//     document.querySelector('.preloader').classList.add('hidden');
//   }, 2000);
// });

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


