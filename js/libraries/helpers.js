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
