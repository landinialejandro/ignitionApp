// * file: src/shared/utils/checkContainerAvailability.js

/**
 * Verifica si todos los contenedores están disponibles en el DOM.
 * @param {string[]} containerIds - IDs de los contenedores a buscar.
 * @returns {boolean} - True si todos los contenedores están disponibles, false en caso contrario.
 */
const areAllContainersAvailable = (containerIds) => 
    containerIds.every(id => document.getElementById(id) !== null);

/**
 * Desconecta un observador y ejecuta un callback con los contenedores encontrados.
 * @param {MutationObserver} observer - Instancia del MutationObserver.
 * @param {string[]} containerIds - IDs de los contenedores.
 * @param {function} callback - Función a ejecutar cuando los contenedores sean encontrados.
 */
const disconnectObserverAndRunCallback = (observer, containerIds, callback) => {
    const elements = containerIds.map(id => document.getElementById(id));
    observer.disconnect();
    callback(...elements);
};

/**
 * Observa cambios en el DOM y ejecuta un callback cuando todos los elementos especificados estén disponibles.
 * @param {string | string[]} containers - Un ID único o un array de IDs de los contenedores a buscar.
 * @param {function} callback - La función que se ejecutará cuando todos los contenedores sean encontrados.
 * @param {number} timeout - Tiempo máximo en milisegundos para observar los contenedores (por defecto 60000 ms = 1 minuto).
 */
export const checkContainerAvailability = (containers, callback, timeout = 60000) => {
    if (typeof callback !== 'function') {
        console.error('El argumento proporcionado como callback no es una función.');
        return;
    }

    const containerIds = Array.isArray(containers) ? containers : [containers];
    const observer = new MutationObserver(() => {
        if (areAllContainersAvailable(containerIds)) {
            disconnectObserverAndRunCallback(observer, containerIds, callback);
            console.log(`Todos los contenedores encontrados: ${containerIds.join(', ')}`);
        }
    });

    // Configuración del observador
    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout para detener la observación
    setTimeout(() => {
        if (!areAllContainersAvailable(containerIds)) {
            observer.disconnect();
            console.warn(`No se encontraron todos los contenedores (${containerIds.join(', ')}) después de ${timeout / 1000} segundos. Observación cancelada.`);
        }
    }, timeout);

    // Verificación inicial sin esperar a mutaciones
    if (areAllContainersAvailable(containerIds)) {
        disconnectObserverAndRunCallback(observer, containerIds, callback);
        console.log(`Todos los contenedores encontrados (verificación inicial): ${containerIds.join(', ')}`);
    }
};
