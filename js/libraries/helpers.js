// helpers.js
import { serverOperation, toastmaster } from '../../src/index.js';
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
export const getJsonData = async (url) => {
  const content = await getFileContent(url);
  return content ? JSON.parse(content) : null;
};

export const getFileContent = async (url) => {
  try {
    const response = await serverOperation('get_content', url, {});
    if (!response?.content) {
      console.warn(`No se encontró contenido en la URL: ${url}`);
      return null;
    }
    return response.content;
  } catch (error) {
    console.error('Error al recibir contenido:', error.message);
    return null;
  }
};
