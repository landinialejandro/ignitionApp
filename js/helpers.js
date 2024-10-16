import { get_data } from './common.js';

/**
 * hidePreloader - Función para ocultar un preloader/spinner con una animación suave.
 * 
 * Esta función espera 600ms antes de comenzar la transición de opacidad del preloader.
 * Luego, reduce la opacidad a 0 en 500ms y finalmente establece 'display: none' 
 * para ocultar completamente el elemento después de que la animación termine.
 * 
 * Uso:
 * - Asegúrate de que el elemento con la clase .spinner-wrapper esté presente en el DOM.
 * - Llama a esta función una vez que la página se haya cargado completamente.
 * 
 * Ejemplo:
 * window.addEventListener('load', () => hidePreloader());
 * 
 * @returns {void}
 */


//enable or disable containers
function Container(enable = true) {
    if (enable) {
        setTimeout(() => $(".container-disabled").removeClass("container-disabled"), 200)
    } else {
        $$(".card-starter").addClass("container-disabled");
    }
};

/**
 * get date for last starter version
 */
export const get_setting = async () => {
    let data = {
        operation: "settings-data",
        id: "#",
    }
    return new Promise((resolve, reject) => {
        get_data({ url: "ignitionApp.php", data })
            .then(({ content }) => {
                if (!content) {
                    reject(new error(`error to get version`))
                } else {
                    resolve(content)
                }
            })
    })
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


