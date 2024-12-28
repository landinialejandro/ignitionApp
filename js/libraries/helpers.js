// helpers.js
import { get_data, serverOperation, toastmaster } from '../../src/index.js';
import { $$ } from './selector.js';


// Clase para manejar el preloader
export class preloader {
    constructor(preloader) {
        this.preloader = $$(preloader);
    }
    show() {
        if (!this.preloader) return;
        toastmaster.secondary("preloader inicalizado...", true);
        this.preloader.removeClass('hidden')
    }
    hide() {
        if (!this.preloader) return;
        setTimeout(() => {
            this.preloader.addClass('hidden');
            toastmaster.secondary("preloader finalizado...", true);
        }, 500);
    }
}

// Alias para operaciones específicas
export const getDirCollectionJson = (folder) => serverOperation('get_node', folder);
export const actionsServer = (data) => serverOperation(data.operation, data.id, data);
export const getJsonData = async (url) => await get_data({ url });
export const getFileContent = async (url) => await get_data({ url, isJson: false });
