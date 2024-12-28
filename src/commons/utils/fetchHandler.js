import Constants from '../configs/constants.js'; // Importa las constantes

/**
 * Genera un token de autorización basado en HMAC.
 * Preparado para su uso en autenticación futura.
 * @param {string} url - URL solicitada.
 * @param {string} secret - Secreto compartido con el servidor.
 * @param {string[]} [permissions=[]] - Permisos asignados al cliente.
 * @returns {Promise<string>} - Token firmado.
 */
async function generateAuthToken(url, secret, permissions = []) {
    const timestamp = Date.now(); // Genera un timestamp
    const permissionsStr = permissions.join(','); // Convierte permisos a una cadena
    const data = `${url}|${timestamp}|${permissionsStr}`;
    const encoder = new TextEncoder();

    // Convierte el secreto y los datos en bytes
    const keyData = encoder.encode(secret);
    const dataToHash = encoder.encode(data);

    // Importa el secreto como clave de HMAC
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Firma los datos con HMAC
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataToHash);
    const signatureHex = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    return `${data}|${signatureHex}`;
}

/**
 * Realiza una solicitud HTTP segura utilizando la clave API o token JWT.
 * @param {string} url - URL de la API (relativa o absoluta).
 * @param {Object} options - Opciones de la solicitud (método, cuerpo, etc.).
 * @param {string} apiKey - Clave API del cliente.
 * @param {string} token - Token JWT del cliente.
 * @returns {Promise<Response>} - Respuesta de la solicitud.
 */
async function secureFetch(url, options = {}, apiKey = Constants.API_KEY, token = null) {
    const headers = options.headers || {};

    // Añade la clave API o el token JWT al encabezado
    if (apiKey) {
        headers['X-API-Key'] = apiKey;
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
}

/**
 * Realiza una solicitud HTTP genérica con manejo integrado de claves API.
 * @param {Object} config - Configuración de la solicitud.
 * @param {string} config.url - URL de la API (relativa o absoluta).
 * @param {string} config.method - Método HTTP (GET, POST, etc.).
 * @param {Object|string|null} config.body - Cuerpo de la solicitud.
 * @param {boolean} config.isJson - Indica si la respuesta será JSON.
 * @param {Function} config.callback - Función opcional a ejecutar después de la respuesta.
 * @returns {Promise<any>} - Respuesta procesada de la solicitud.
 */
const fetchHandler = async ({
    url,
    method = 'GET',
    body = null,
    isJson = true,
    callback = () => { },
}) => {
    if (!url) throw new Error("La URL es obligatoria.");

    // Construir las cabeceras
    const headers = {
        "X-Requested-With": "XMLHttpRequest",
        "X-API-Key": Constants.API_KEY, // Clave API centralizada
    };

    if (method !== "GET" && body && isJson) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body); // Serializar el cuerpo como JSON
    }

    try {
        const response = await fetch(url, { method, headers, body });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const rawData = await response.text();
        const parsedData = isJson ? JSON.parse(rawData) : rawData;

        callback(parsedData);
        return parsedData;
    } catch (error) {
        console.error("Error en fetchHandler:", error);
        throw error;
    }
};

/**
 * Simplifica las solicitudes HTTP con integración de claves API.
 * @param {Object} config - Configuración de la solicitud.
 * @returns {Promise<any>} - Respuesta procesada de la API.
 */
export const get_data = async ({ url, data = null, method = null, isJson = true, callback = () => { } }) => {
    return fetchHandler({
        url,
        method: method || (data ? "POST" : "GET"),
        body: data,
        isJson,
        callback,
    });
};

/**
 * Guarda contenido en el servidor.
 * @param {string} fileName - Nombre del archivo a guardar.
 * @param {Object|string} content - Contenido a guardar.
 * @param {Object} extraData - Datos adicionales para la operación.
 * @param {Function} callback - Función opcional a ejecutar después de la respuesta.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const saveFileToServer = async (fileName, content, extraData = {}, callback = () => { }) => {
    console.info("Guardando archivo en el servidor...");

    const data = {
        content: content === null || content === '' ? '' : JSON.stringify(content),
        ...extraData,
    };

    try {
        const response = await serverOperation("save_file", fileName, data);

        // Ejecutar el callback si se proporciona
        if (typeof callback === "function") {
            callback(response);
        }

        return response;
    } catch (error) {
        console.error("Error al guardar el archivo:", error);
        throw error;
    }
};


/**
 * Realiza operaciones genéricas en el servidor.
 * @param {string} operation - Operación a realizar.
 * @param {string} id - Carpeta, archivo o identificador.
 * @param {Object} extraData - Datos adicionales.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const serverOperation = async (operation, id, extraData = {}) => {
    return await get_data({
        url: Constants.API_ENDPOINT,
        data: { operation, id, ...extraData },
    });
};

/**
 * Realiza un inicio de sesión en el servidor (futuro).
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<string>} - Token JWT del usuario.
 */
export const login = async (username, password) => {
    const response = await fetchHandler({
        url: `${Constants.URL}/login`,
        method: 'POST',
        body: { username, password },
        isJson: true,
    });

    if (response && response.token) {
        console.info('Login exitoso:', response);
        return response.token;
    }

    throw new Error('Error en el inicio de sesión.');
};
