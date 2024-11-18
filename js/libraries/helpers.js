// helpers.js
import { get_data } from './common.js';
import { $$ } from './selector.js';


// Clase para manejar el preloader
export class preloader {
    constructor(preloader) {
        this.preloader = $$(preloader);
    }
    show() {
        if (!this.preloader) return;
        this.preloader
            .removeClass('hidden')
            .css({
                transition: "opacity 0.5s",
                opacity: "1",
                display: "flex",
            });
    }
    hide() {
        if (!this.preloader) return;
        setTimeout(() => {
            this.preloader.css({
                transition: "opacity 0.5s",
                opacity: "0",
            });
            setTimeout(() => {
                this.preloader.addClass('hidden');
                if (window.msg) {
                    msg.secondary("preloader finalizado...", true); // TODO: Validar si `msg` está definido.
                }
            }, 500);
        }, 600);
    }
}

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
            throw new Error("Handlebars no está disponible.");
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
}

// Alias para operaciones específicas
export const getDirCollectionJson = (folder) => serverOperation('get_node', folder);
export const actionsServer = (data) => serverOperation('action', data.id, data);
