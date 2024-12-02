/**
 * selector.js
 * 
 * Proporciona una función `$$(...)` para seleccionar y manipular elementos del DOM con una API similar a jQuery.
 * 
 * Métodos disponibles:
 * - html(content?): Obtiene o establece el contenido HTML.
 * - text(content?): Obtiene o establece el contenido de texto.
 * - css(propertyOrObject, value?): Aplica estilos en línea.
 * - addClass(className): Agrega una clase a los elementos.
 * - removeClass(className): Remueve una clase de los elementos.
 * - remove(): Elimina los elementos seleccionados del DOM.
 * - on(eventType, selectorOrHandler, handler?): Agrega manejadores de eventos.
 * - off(eventType, handler?): Remueve manejadores de eventos.
 * - allData(): Obtiene los atributos de datos (`data-*`) de los elementos.
 * - scrollIntoView(options?): Desplaza los elementos seleccionados a la vista.
 */

export const $$ = (input) => {
    const elements = typeof input === 'string'
        ? document.querySelectorAll(input)
        : input instanceof HTMLElement
            ? [input]
            : [];

    if (!elements.length) {
        console.warn('No elements found for the given input.');
    }

    const api = {
        elements,

        html(content) {
            if (content !== undefined) {
                elements.forEach((element) => element.innerHTML = content);
                return this;
            } else {
                return elements[0]?.innerHTML || null;
            }
        },

        text(content) {
            if (content !== undefined) {
                elements.forEach((element) => element.textContent = content);
                return this;
            } else {
                return elements[0]?.textContent || null;
            }
        },

        css(propertyOrObject, value) {
            if (typeof propertyOrObject === "object") {
                Object.entries(propertyOrObject).forEach(([key, val]) => {
                    elements.forEach((element) => element.style[key] = val ?? '');
                });
            } else if (typeof propertyOrObject === "string" && value !== undefined) {
                elements.forEach((element) => element.style[propertyOrObject] = value);
            } else {
                console.error('Property and value must be provided, or an object with styles.');
            }
            return this;
        },

        addClass(className) {
            if (!className) {
                console.error('Class name must be provided.');
                return this;
            }
            elements.forEach((element) => element.classList.add(className));
            return this;
        },

        removeClass(className) {
            if (!className) {
                console.error('Class name must be provided.');
                return this;
            }
            elements.forEach((element) => element.classList.remove(className));
            return this;
        },

        remove() {
            elements.forEach((element) => element.remove());
            return this;
        },

        on(eventType, selectorOrHandler, handler) {
            const isDelegation = typeof selectorOrHandler === 'string';
            const actualHandler = isDelegation ? handler : selectorOrHandler;
            const selector = isDelegation ? selectorOrHandler : null;

            if (!eventType || typeof actualHandler !== 'function') {
                console.error('Valid event type and handler function must be provided.');
                return this;
            }

            elements.forEach((element) => {
                const delegatedHandler = (event) => {
                    if (selector) {
                        const potentialTargets = element.querySelectorAll(selector);
                        let target = event.target;
                        while (target && target !== element) {
                            if ([...potentialTargets].includes(target)) {
                                actualHandler.call(target, event);
                                return;
                            }
                            target = target.parentNode;
                        }
                    } else {
                        actualHandler(event);
                    }
                };

                element.addEventListener(eventType, delegatedHandler);

                element._eventListeners = element._eventListeners || {};
                element._eventListeners[eventType] = element._eventListeners[eventType] || [];
                element._eventListeners[eventType].push(delegatedHandler);
            });

            return this;
        },

        off(eventType, handler) {
            if (!eventType) {
                console.error('Event type must be provided.');
                return this;
            }

            elements.forEach((element) => {
                const listeners = element._eventListeners?.[eventType];
                if (!listeners) return;

                if (handler) {
                    const index = listeners.indexOf(handler);
                    if (index !== -1) {
                        element.removeEventListener(eventType, handler);
                        listeners.splice(index, 1);
                    }
                } else {
                    listeners.forEach((listener) => element.removeEventListener(eventType, listener));
                    listeners.length = 0;
                }
            });

            return this;
        },

        allData() {
            if (!elements.length) {
                return [];
            }
            if (elements.length === 1) {
                return { ...elements[0].dataset };
            }
            return Array.from(elements).map((element) => ({ ...element.dataset }));
        },

        scrollIntoView(options) {
            if (!elements.length) {
                console.warn('No elements available for scrollIntoView.');
                return this;
            }

            elements.forEach((element) => {
                element.scrollIntoView(options);
            });

            return this;
        },
    };

    return Object.create(api);
};
