// Simulación de la finalización de la carga de la aplicación
window.addEventListener('load', () => {
    // Espera 2 segundos para simular una carga de datos
    setTimeout(() => {
      document.querySelector('.preloader').classList.add('hidden');
    }, 2000);
  });

  document.addEventListener("DOMContentLoaded", function() {
    // Selecciona el botón de colapso en el sidebar
    const collapseButton = document.querySelector(".sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");

    // Agrega el evento de clic al botón
    collapseButton.addEventListener("click", function() {
        // Alterna la clase 'collapsed' en el sidebar
        sidebar.classList.toggle("collapsed");
    });
});
