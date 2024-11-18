// helpers.js
import { get_data } from './common.js';
import { $$ } from './selector.js';

/**
 * Habilita o deshabilita contenedores específicos.
 * @param {boolean} enable - True para habilitar, false para deshabilitar.
 * @param {number} delay - Tiempo en milisegundos para aplicar la acción.
 */
export function Container(enable = true, delay = 200) {
    if (enable) {
        setTimeout(() => $$(".card-starter").removeClass("container-disabled"), delay); // TODO: Verificar si el retraso es necesario en todos los casos.
    } else {
        $$(".card-starter").addClass("container-disabled");
    }
};

/**
 * Actualiza el texto del breadcrumb activo.
 * @param {string} newBreadCrum - Nuevo texto para el breadcrumb.
 */
export const setBreadCrum = (newBreadCrum) => {
    const breadcrumb = $$(".breadcrumb-item.active");
    if (breadcrumb) {
        breadcrumb.text(newBreadCrum); // TODO: Validar si el elemento existe.
    }
};

/**
 * Actualiza el título del archivo seleccionado.
 * @param {string} newTitle - Nuevo título para el archivo seleccionado.
 */
export const setTitleFileSelected = (newTitle) => {
    const title = $$(".title-file-selected");
    if (title) {
        title.text(newTitle); // TODO: Validar si el elemento existe.
    }
};

/**
 * Recorta un texto si excede el límite especificado.
 * @param {string} text - El texto a recortar.
 * @param {number} maxLength - Longitud máxima permitida.
 * @returns {string} - El texto recortado o el original si no excede el límite.
 */
export const truncateText = (text, maxLength) => {
    if (typeof text !== "string") return ""; // TODO: Validar que sea un string antes de operar.
    if (text.length <= maxLength) return text;

    const partLength = Math.floor((maxLength - 3) / 2);
    const start = text.slice(0, partLength);
    const end = text.slice(-partLength);

    return `${start}...${end}`;
};

// Clase para manejar el preloader
export class preloader {
    constructor(preloader) {
        this.preloader = $$(preloader);
    }
    show() {
        if (!this.preloader) return;
        this.preloader.removeClass('hidden').css({
            transition: "opacity 0.5s",
            opacity: "1",
            display: "flex"
        });
    }
    hide() {
        if (!this.preloader) return;
        setTimeout(() => {
            this.preloader.css({ transition: "opacity 0.5s", opacity: "0" });
            setTimeout(() => {
                this.preloader.addClass('hidden');
                if (window.msg) { // TODO: Validar si `msg` está definido para evitar errores.
                    msg.secondary("preloader finalizado...", true);
                }
            }, 500);
        }, 600);
    }
};

/**
 * Renderiza una plantilla de Handlebars con el contenido proporcionado.
 * @param {string} template - Ruta de la plantilla.
 * @param {Object} content - Datos para el renderizado.
 * @returns {Promise<string>} - Plantilla renderizada como HTML.
 */
export const renderTemplate = async (template, content) => {
    try {
        const templateData = await get_data({ url: template, isJson: false });

        if (typeof Handlebars === "undefined") {
            throw new Error("Handlebars no está disponible."); // TODO: Validar que Handlebars esté disponible.
        }

        const compiledTemplate = Handlebars.compile(templateData);
        return compiledTemplate(content);
    } catch (error) {
        console.error(`Error al renderizar la plantilla ${template}:`, error);
        throw new Error(`No se pudo renderizar la plantilla ${template}`);
    }
};

/**
 * Realiza una operación con el servidor.
 * @param {string} operation - Tipo de operación (e.g., 'get_node').
 * @param {string} folder - Carpeta de la operación.
 * @param {Object} extraData - Datos adicionales para la operación.
 * @returns {Promise<Object>} - Respuesta del servidor.
 */
export const serverOperation = async (operation, folder, extraData = {}) => {
    try {
        const url = 'ignitionApp.php';
        const data = { operation, id: folder, ...extraData };

        const response = await get_data({ url, data });
        if (response) {
            return response;
        } else {
            throw new Error(`Sin datos recibidos para la operación ${operation} en: ${folder}`);
        }
    } catch (error) {
        console.error(`Error en la operación ${operation} para ${folder}:`, error);
        throw error;
    }
};

// Alias para operaciones específicas
export const getDirCollectionJson = (folder) => serverOperation('get_node', folder);
export const actionsServer = (data) => serverOperation('action', data.id, data);
