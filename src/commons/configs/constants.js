const isDev = true; // Configurado como true para desarrollo

const Constants = Object.freeze({
    // URL Base
    URL: isDev ? 'http://localhost:3000' : 'https://example.com',

    // Endpoint de API
    API_ENDPOINT: isDev ? 'ignitionApp.php' : 'https://example.com/ignitionApp.php',

    // Configuración de la aplicación
    TIMEOUT: 5000, // Tiempo máximo para las solicitudes HTTP (ms)

    // Selectores del DOM
    PRELOADER_ID: '.preloader', // Preloader principal
    MAIN_CONTAINER: '.app-main', // Contenedor principal de la aplicación
    VERSION_CONTENT: '.footer-version', // Contenedor para mostrar la versión
    SIDEBAR_CONTENT: '.sidebar-content', // Contenido del sidebar
    CONTENT: '.content-body', // Contenedor del contenido principal
    CONTENT_PRELOADER: '.content-body-preloader', // Preloader dentro del contenido
    CONTENT_TITLE: '.content-title', // Título principal del contenido
    LINK_CONTAINER: '.link-container', // Contenedor de enlaces
});

export default Constants;
