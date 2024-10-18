
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
