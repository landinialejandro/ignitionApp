// Simulación de la finalización de la carga de la aplicación
window.addEventListener('load', () => {
    // Espera 2 segundos para simular una carga de datos
    setTimeout(() => {
      document.querySelector('.preloader').classList.add('hidden');
    }, 2000);
  });