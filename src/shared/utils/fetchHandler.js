// * file: src/shared/utils/fetchHandler.js
import Constants from '../configs/constants.js';

/**
 * Maneja peticiones HTTP de forma genérica.
 * @param {Object} config - Configuración de la petición.
 * @param {string} config.url - URL de la petición.
 * @param {string} config.method - Método HTTP.
 * @param {Object|string|null} config.body - Cuerpo de la solicitud.
 * @param {boolean} config.isJson - Indica si la respuesta será JSON.
 * @param {Function|null} callback - Función opcional a ejecutar después de la respuesta.
 * @param {string} [responseType='text'] - Tipo de respuesta esperada ('text', 'json', 'blob', etc.).
 * @returns {Promise<any>} - Respuesta de la petición.
 */
const fetchHandler = async ({ url, method = 'GET', body = null, isJson = true, callback = null, responseType = 'text' }) => {
    if (!url) throw new Error("La URL es obligatoria.");

    const headers = { "X-Requested-With": "XMLHttpRequest" };
    if (method !== "GET" && body && isJson) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, { method, headers, body });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
        }

        const rawData = await response[responseType]();
        const parsedData = isJson && responseType === 'text' ? JSON.parse(rawData) : rawData;

        callback?.(parsedData);
        return parsedData;
    } catch (error) {
        console.error("Error en fetchHandler:", error);
        throw error;
    }
};

// Función para simplificar peticiones
export const get_data = ({ url, data = null, method = null, isJson = true, callback = null }) =>
    fetchHandler({
        url,
        method: method || (data ? "POST" : "GET"),
        body: data,
        isJson,
        callback,
    });

/**
 * Guarda contenido en un archivo en el servidor utilizando una llamada HTTP.
 * @param {string} fileName - Nombre del archivo que se desea guardar.
 * @param {Object|string} content - Contenido a guardar en el archivo.
 * @param {Object} extraData - Datos adicionales que se enviarán con el contenido.
 * @param {Function|null} callback - Función opcional a ejecutar después de la respuesta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const saveFileToServer = async (fileName, content, extraData = {}, callback = null) => {
    console.info("Guardando archivo en el servidor...");
    
    // Validar que el nombre del archivo es una cadena válida
    if (typeof fileName !== 'string' || fileName.trim() === '') {
        throw new Error("El nombre del archivo debe ser una cadena no vacía.");
    }

    // Validar que el contenido sea serializable
    if (typeof content !== 'string' && typeof content !== 'object') {
        throw new Error("El contenido debe ser un string o un objeto serializable.");
    }

    const data = {
        operation: "save_file",
        type: "json",
        id: fileName,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        ...extraData, // Merge con extraData
    };

    return get_data({
        url: Constants.API_ENDPOINT,
        data,
        callback
    });
};


/**
 * Realiza una operación genérica con el servidor.
 * @param {string} operation - Tipo de operación (e.g., 'get_node').
 * @param {string} folder - Carpeta o identificador de la operación.
 * @param {Object} extraData - Datos adicionales para la operación.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const serverOperation = async (operation, folder, extraData = {}) => {
    if (!operation || !folder) {
        throw new Error("Los parámetros 'operation' y 'folder' son obligatorios.");
    }

    return get_data({
        url: Constants.API_ENDPOINT,
        data: { operation, id: folder, ...extraData },
    });
};
