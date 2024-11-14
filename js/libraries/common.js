import Constants from '../constants.js';
/**
 ** Realiza una petición HTTP y devuelve una promesa que se resuelve con los datos de la respuesta.
 *
 * @param {Object} options - Opciones para la petición.
 * @param {string} options.url - La URL a la que se realizará la petición. **Obligatorio.**
 * @param {Object|string|null} [options.data=null] - Datos que se enviarán en el cuerpo de la petición.
 * @param {string|null} [options.method=null] - Método HTTP a utilizar (GET, POST, etc.). Si no se especifica, se usa "GET" si no hay datos y "POST" si hay datos.
 * @param {boolean} [options.isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 * @param {Function} [options.callback=null] - Función opcional que se ejecutará después de recibir la respuesta.
 *
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 */
export const get_data = async ({ url, data = null, method = null, isJson = true, callback = null }) => {
    if (!url) {
        throw new Error("La URL es obligatoria.");
    }

    // Determinar el método HTTP si no se proporciona
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

        // Ejecutar el callback si es una función
        if (typeof callback === "function") {
            callback(responseData);
        }

        return responseData;
    } catch (error) {
        // Manejo de errores
        console.error("Error en get_data:", error);
        throw error;
    }
};

/**
 * Guarda un archivo en el servidor utilizando una llamada AJAX a través de MyFetch.
 *
 * @param {string} url - La URL del script PHP que manejará la subida y guardado del archivo en el servidor.
 * @param {File} file - El archivo que se desea guardar en el servidor.
 * @param {Object} [extraData={}] - Datos adicionales que se enviarán junto al archivo (opcional).
 * @param {Function} [callback=null] - Función opcional que se ejecutará después de guardar el archivo.
 *
 * @returns {Promise<any>} - Una promesa que se resuelve si el archivo se guarda exitosamente o se rechaza si ocurre un error.
 *
 * @example
 * saveFileToServer('https://tu-servidor.com/save_file.php', archivo, { userId: 123 })
 *   .then((response) => {
 *     console.log('Archivo guardado exitosamente en el servidor:', response);
 *   })
 *   .catch((error) => {
 *     console.error('Error al guardar el archivo:', error);
 *   });
 */
export const saveFileToServer = async (file, extraData = {}, callback = null) => {
    msg.info("saving project");
    //TODO: se puede controlar si el nombre es valido antes de pasarlo a la función
    try {

        const data = {
            operation: "save_file",
            type: "json",
            id: file,
            text: "",
            content: JSON.stringify(extraData),
        }
        //save projet
        const responseData = await get_data({
            url: "ignitionApp.php", data,
        })

        // Ejecutar el callback si se proporciona
        if (typeof callback === "function") {
            callback(response);
        }

        if (responseData) {
            console.log('Archivo guardado con éxito');
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
 ** Realiza una petición HTTP utilizando la API Fetch y devuelve una promesa con los datos de la respuesta.
 *
 * @param {Object} config - Configuración de la petición.
 * @param {string} config.url - URL a la que se realizará la petición. **Obligatorio.**
 * @param {string} [config.method='GET'] - Método HTTP a utilizar (GET, POST, etc.).
 * @param {Object|string|null} [config.body=null] - Cuerpo de la solicitud, si es aplicable.
 * @param {boolean} [isJson=true] - Indica si la respuesta debe ser tratada como JSON.
 *
 * @returns {Promise<any>} - Una promesa que se resuelve con los datos de la respuesta o se rechaza con un error.
 *
 * @example
 * MyFetch(
 *   {
 *     url: 'https://api.example.com/data',
 *     method: 'POST',
 *     body: { key: 'value' },
 *   },
 *   true
 * )
 * .then((response) => {
 *   console.log('Respuesta:', response);
 * })
 * .catch((error) => {
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
            // Leer el cuerpo de la respuesta en caso de error
            const errorText = await response.text();
            throw new Error(`Error en la respuesta HTTP: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = isJson ? await response.json() : await response.text();
        return data; // Aquí devolvemos los datos
    } catch (err) {
        // Re-lanzamos el error para que pueda ser manejado por quien llama a la función
        throw err;
    }
};



/**
 * Carga dinámicamente un script JavaScript en la página.
 *
 * @param {string} moduleUrl - URL del módulo (script) que se va a cargar.
 *
 * @returns {Promise<string>} - Una promesa que se resuelve con la URL del módulo cargado
 *                              si la carga es exitosa, o se rechaza con un error si falla.
 *
 * @example
 ** Uso de LoadModule para cargar un script externo
 * LoadModule('https://example.com/script.js')
 *   .then((moduleUrl) => {
 *     console.log(`El módulo ${moduleUrl} se cargó correctamente.`);
 *   })
 *   .catch((error) => {
 *     console.error('Error al cargar el módulo:', error);
 *   });
 *
 * @description
 * La función verifica si el script ya está cargado para evitar cargas duplicadas.
 * Si el script no está presente, crea un elemento `<script>`, configura sus atributos
 * y lo añade al documento. Maneja los eventos `onload` y `onerror` para resolver o
 * rechazar la promesa según corresponda.
 *
 * También muestra mensajes al usuario utilizando las funciones `msg.info`, `msg.secondary`,
 * y `msg.danger` para informar sobre el estado de la carga del módulo.
 */
export const LoadModule = (moduleUrl) => {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya está cargado
        if (document.querySelector(`script[src="${moduleUrl}"]`)) {
            msg.info(`Módulo ya cargado: ${moduleUrl}`);
            return resolve(moduleUrl);
        }

        msg.secondary(`Cargando: ${moduleUrl}`);

        const script = document.createElement("script");
        script.type = "module";
        script.async = true;
        script.src = moduleUrl;

        script.onload = () => {
            msg.info(`Módulo cargado exitosamente: ${moduleUrl}`);
            resolve(moduleUrl);

            // Limpiar manejadores de eventos
            script.onload = null;
            script.onerror = null;
        };

        script.onerror = () => {
            msg.danger(`Error al cargar el módulo: ${moduleUrl}`);
            reject(new Error(`No se pudo cargar el script ${moduleUrl}`));

            // Limpiar manejadores de eventos
            script.onload = null;
            script.onerror = null;
        };

        // Agregar el script al documento después de configurar todo
        document.body.appendChild(script);
    });
};


/**
 * Filtra un objeto y devuelve un nuevo objeto que solo contiene las propiedades especificadas.
 *
 * @param {Object} obj - El objeto original que se va a filtrar.
 * @param {Array<string>} keys - Un array de claves que se desean conservar en el objeto resultante.
 *
 * @returns {Object} - Un nuevo objeto que contiene solo las propiedades especificadas.
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = filteredObject(original, ['a', 'c']);
 * console.log(result); // { a: 1, c: 3 }
 */
export const filteredObject = (obj, keys = []) => {
    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('El primer parámetro debe ser un objeto no nulo.');
    }
    if (!Array.isArray(keys)) {
        throw new TypeError('El segundo parámetro debe ser un array de claves.');
    }

    const keySet = new Set(keys);
    const result = {};

    for (const key of keySet) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            result[key] = obj[key];
        }
    }

    return result;
};

export const updateSidebarOverflow = () => {
    const sidebarContent = document.querySelector('.sidebar-content');
    
    if (sidebarContent) {
        // Restablece `overflow` para recalcular el desplazamiento
        sidebarContent.style.overflowY = 'hidden';
        // Vuelve a activar el desplazamiento si el contenido excede la altura del contenedor
        if (sidebarContent.scrollHeight > sidebarContent.clientHeight) {
            sidebarContent.style.overflowY = 'auto';
        }
    }
};


/**
 * Verifica periódicamente la disponibilidad del contenedor y ejecuta el callback si es encontrado.
 * Si no se encuentra el contenedor en 1 minuto, cancela la búsqueda.
 * @param {string} containerId - El ID del contenedor a buscar.
 * @param {function} callback - La función que se ejecutará cuando el contenedor sea encontrado.
 * @param {number} timeout - Tiempo máximo en milisegundos para intentar encontrar el contenedor (por defecto 60000 ms = 1 minuto).
 */
export const checkContainerAvailability = (containerId, callback, timeout = Constants.TIMEOUT) => {
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

