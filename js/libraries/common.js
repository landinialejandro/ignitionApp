// common.js
import Constants from '../Constants.js';

/**
 * Realiza una petición HTTP utilizando la API Fetch.
 * @param {Object} config - Configuración de la petición.
 * @param {string} config.url - URL a la que se realizará la petición. **Obligatorio.**
 * @param {string} [config.method='GET'] - Método HTTP a utilizar (GET, POST, etc.).
 * @param {Object|string|null} [config.body=null] - Cuerpo de la solicitud, si es aplicable.
 * @param {boolean} [isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 *
 * @example
 * MyFetch(
 *   { url: 'https://api.example.com/data', method: 'POST', body: { key: 'value' } },
 *   true
 * ).then((response) => {
 *   console.log('Respuesta:', response);
 * }).catch((error) => {
 *   console.error('Error en la petición:', error);
 * });
 */
export const MyFetch = async (
    { url = null, method = "GET", body = null },
    isJson = true
) => {
    if (!url) {
        throw new Error("La URL es obligatoria.");
    }

    const options = {
        method,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    };

    if (method !== "GET" && body) {
        if (isJson) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        } else {
            options.body = body;
        }
    }

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const rawData = await response.text();

        if (!rawData) {
            console.warn("La respuesta está vacía.");
            return isJson ? null : ""; // Devuelve `null` para JSON o cadena vacía para texto
        }

        if (isJson) {
            try {
                return JSON.parse(rawData);
            } catch (error) {
                throw new Error(`Error al analizar JSON: ${error.message} - Respuesta recibida: ${rawData}`);
            }
        }

        return rawData;
    } catch (err) {
        console.error("Error en MyFetch:", err);
        throw err;
    }
};

/**
 * Simplifica el uso de MyFetch para peticiones HTTP.
 * @param {Object} options - Opciones para la petición.
 * @param {string} options.url - La URL a la que se realizará la petición. **Obligatorio.**
 * @param {Object|string|null} [options.data=null] - Datos que se enviarán en el cuerpo de la petición.
 * @param {string|null} [options.method=null] - Método HTTP a utilizar (GET, POST, etc.).
 * @param {boolean} [options.isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 * @param {Function} [options.callback=null] - Función opcional que se ejecutará después de recibir la respuesta.
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 */
export const get_data = async ({ url, data = null, method = null, isJson = true, callback = null }) => {
    if (!url) {
        throw new Error("La URL es obligatoria.");
    }

    method = method || (data ? "POST" : "GET");

    try {
        const responseData = await MyFetch(
            {
                url,
                method,
                body: data,
            },
            isJson
        );

        if (typeof callback === "function") {
            callback(responseData);
        }

        return responseData;
    } catch (error) {
        console.error("Error en get_data:", error);
        throw error;
    }
};

/**
 * Guarda un archivo en el servidor utilizando una llamada AJAX a través de MyFetch.
 * @param {File} file - El archivo que se desea guardar en el servidor.
 * @param {Object} [extraData={}] - Datos adicionales que se enviarán junto al archivo.
 * @param {Function} [callback=null] - Función opcional que se ejecutará después de guardar el archivo.
 * @returns {Promise<any>} - Una promesa que se resuelve si el archivo se guarda exitosamente o se rechaza si ocurre un error.
 */
export const saveFileToServer = async (file, extraData = {}, callback = null) => {
    msg.info("Guardando proyecto..."); // TODO: Validar si `msg` está disponible globalmente.

    try {
        const data = {
            operation: "save_file",
            type: "json",
            id: file,
            text: "",
            content: JSON.stringify(extraData),
        };

        const responseData = await get_data({ url: "ignitionApp.php", data });

        if (typeof callback === "function") {
            callback(responseData);
        }

        if (responseData) {
            console.log("Archivo guardado con éxito");
            return responseData;
        } else {
            throw new Error(`Error al guardar: ${file}`);
        }
    } catch (error) {
        console.error("Error en saveFileToServer:", error);
        throw error;
    }
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

    // Asegurarse de que containers sea siempre un array
    const containerIds = Array.isArray(containers) ? containers : [containers];
    const startTime = Date.now();

    // Verifica si todos los elementos están disponibles en el DOM
    const allContainersAvailable = () => 
        containerIds.every(id => document.getElementById(id) !== null);

    const observer = new MutationObserver(() => {
        if (allContainersAvailable()) {
            try {
                const elements = containerIds.map(id => document.getElementById(id));
                callback(...elements);
                observer.disconnect();
                console.log(`Todos los contenedores encontrados: ${containerIds.join(', ')}`);
            } catch (error) {
                console.error('Error al ejecutar el callback:', error);
            }
        }
    });

    // Configuración del observador
    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout para detener la observación
    setTimeout(() => {
        if (!allContainersAvailable()) {
            observer.disconnect();
            console.warn(`No se encontraron todos los contenedores (${containerIds.join(', ')}) después de ${timeout / 1000} segundos. Observación cancelada.`);
        }
    }, timeout);

    // Verificación inicial sin esperar a mutaciones
    if (allContainersAvailable()) {
        const elements = containerIds.map(id => document.getElementById(id));
        callback(...elements);
        observer.disconnect();
        console.log(`Todos los contenedores encontrados (verificación inicial): ${containerIds.join(', ')}`);
    }
};
