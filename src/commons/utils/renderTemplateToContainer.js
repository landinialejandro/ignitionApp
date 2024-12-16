// * file:js/commons/utils/renderTemplateToContainer.js

import { get_data } from '../../index.js';
import { $$ } from "../../../js/libraries/selector.js";

/**
 * Renderiza una plantilla de Handlebars con los datos proporcionados y la inserta en un contenedor HTML.
 * Asegura que los datos proporcionados sean un array o se conviertan en uno si es necesario.
 * @param {string} templatePath - Ruta de la plantilla Handlebars.
 * @param {Object|Array} data - Datos para renderizar la plantilla (convertidos a array si es necesario).
 * @param {string} container - Selector del contenedor donde insertar el HTML renderizado.
 * @returns {Promise<void>} - Realiza la operación de renderizado.
 */
export const renderTemplateToContainer = async (templatePath, data, container) => {
    try {
        // Asegurarse de que los datos sean un array o convertirlos
        const normalizedData = data//Array.isArray(data) ? data : [data];

        // Obtener el contenido de la plantilla desde la URL
        const templateData = await get_data({ url: templatePath, isJson: false });

        // Verificar si Handlebars está disponible
        if (typeof Handlebars === "undefined") {
            throw new Error("Handlebars no está disponible.");
        }

        // Compilar la plantilla con los datos normalizados
        const compiledTemplate = Handlebars.compile(templateData);
        const html = compiledTemplate( normalizedData );

        // Insertar el HTML en el contenedor especificado
        $$(container).html(html);
    } catch (error) {
        console.error(`Error al renderizar e insertar la plantilla ${templatePath}:`, error);
        throw new Error(`No se pudo renderizar e insertar la plantilla ${templatePath}`);
    }
};
