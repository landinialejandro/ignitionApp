// import Constants from "./constants";
/**
 * Verifica periódicamente la disponibilidad del contenedor y ejecuta el callback si es encontrado.
 * Si no se encuentra el contenedor en 1 minuto, cancela la búsqueda.
 * @param {string} containerId - El ID del contenedor a buscar.
 * @param {function} callback - La función que se ejecutará cuando el contenedor sea encontrado.
 * @param {number} timeout - Tiempo máximo en milisegundos para intentar encontrar el contenedor (por defecto 60000 ms = 1 minuto).
 */
export const checkContainerAvailability = (containerId, callback, timeout = 5000) => {
    if (typeof callback !== 'function') {
        console.error('El argumento proporcionado como callback no es una función.');
        return;
    }

    const startTime = Date.now();

    const attemptInitialization = () => {
        const container = document.getElementById(containerId);
        const elapsed = Date.now() - startTime;

        if (container) {
            try {
                // Ejecuta la función callback con el contenedor como argumento
                callback(container);
                // console.log('Contenedor inicializado: ', container);
            } catch (error) {
                console.error('Error al ejecutar el callback:', error);
            }
        } else if (elapsed < timeout) {
            // Vuelve a intentar después de un corto período
            setTimeout(attemptInitialization, 500); // Intenta cada 500 ms
        } else {
            console.warn(`No se encontró el contenedor "${containerId}" después de ${timeout / 1000} segundos. Búsqueda cancelada.`);
        }
    };

    attemptInitialization();
};
