import { get_data } from './common.js';
import { $$ } from './selector.js';

//enable or disable containers
export function Container(enable = true) {
    if (enable) {
        setTimeout(() => $(".container-disabled").removeClass("container-disabled"), 200)
    } else {
        $$(".card-starter").addClass("container-disabled");
    }
};


export const setBreadCrum = (newBreadCrum) => {
    $$(".breadcrumb-item.active").text(newBreadCrum)
};
export const setTitleFileSelected = (newTitle) => {
    $$(".title-file-selected").text(newTitle)
};

/**
 * Recorta un texto si excede el límite especificado, reemplazando 
 * el texto intermedio con tres puntos suspensivos (...) para mantener 
 * una longitud total definida.
 *
 * @param {string} text - El texto a recortar.
 * @param {number} maxLength - La longitud máxima permitida para el texto.
 * @returns {string} - El texto recortado con puntos suspensivos si es necesario.
 */
export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text; // No es necesario recortar
    }
    const partLength = Math.floor((maxLength - 3) / 2); // Partes antes y después de "..."
    const start = text.slice(0, partLength); // Inicio del texto
    const end = text.slice(-partLength); // Final del texto

    return `${start}...${end}`; // Texto recortado con "..."
}

export class preloader {
    constructor(preloaderId) {
        this.preloader = document.getElementById(preloaderId);
    }

    show() {
        this.preloader.style.transition = "opacity 0.5s"; // Animación de transición suave
        this.preloader.style.opacity = "100";
        this.preloader.style.display = "flex";
    }

    hide() {
        if (this.preloader) { // Verificar si el elemento existe
            setTimeout(() => {
                this.preloader.style.transition = "opacity 0.5s"; // Animación de transición suave
                this.preloader.style.opacity = "0";

                setTimeout(() => {
                    this.preloader.style.display = "none";
                    msg.secondary("preloader finalizado...", true);
                }, 500); // Esperar a que termine la transición antes de ocultar
            }, 600); // Retraso inicial de 600ms
        }
        //this.preloader.style.display = "none";
    }
}

/**
 * Renderiza una plantilla de Handlebars con el contenido proporcionado.
 * 
 * @param {string} template - La URL o ruta de la plantilla de Handlebars a cargar.
 * @param {Object} content - El contenido o datos a pasar a la plantilla para el renderizado.
 * @returns {Promise<string>} - La plantilla renderizada como una cadena HTML.
 * @throws {Error} - Lanza un error si no se puede cargar o compilar la plantilla.
 */
export const renderTemplate = async (template, content) => {
    try {
        // Obtener los datos de la plantilla desde la URL
        const templateData = await get_data({ url: template, isJson: false });

        // Compilar la plantilla con Handlebars
        const compiledTemplate = Handlebars.compile(templateData);

        // Renderizar la plantilla con el contenido proporcionado
        return compiledTemplate(content);
    } catch (error) {
        console.error(`Error al renderizar la plantilla desde ${template}:`, error);
        throw new Error(`No se pudo renderizar la plantilla ${template}`);
    }
};

/**
 * Obtiene la colección de directorios en formato JSON desde una carpeta específica.
 * 
 * @param {string} folder - El ID o nombre de la carpeta de la que se obtendrán los datos.
 * @returns {Promise<Object>} - Un objeto JSON con los datos de la carpeta.
 * @throws {Error} - Lanza un error si no se puede obtener la información.
 */
export const getDirCollectionJson = async (folder) => {
    try {
        const url = 'ignitionApp.php';
        const data = {
            id: folder,
            operation: 'get_node'
        };

        // Llamada a la función `get_data` para obtener los datos
        const responseData = await get_data({ url, data });

        // Si hay una respuesta válida, la retornamos
        if (responseData) {
            return responseData;
        } else {
            throw new Error(`No se obtuvieron datos para la carpeta: ${folder}`);
        }
    } catch (error) {
        console.error(`Error al obtener la colección del directorio ${folder}:`, error);
        throw error;  // Propagar el error para que el llamador lo maneje
    }
};
