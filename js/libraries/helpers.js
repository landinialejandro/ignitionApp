// helpers.js
import { serverOperation } from '../../src/index.js';
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

// Alias para operaciones específicas
export const getDirCollectionJson = (folder) => serverOperation('get_node', folder);
export const actionsServer = (data) => serverOperation('action', data.id, data);
