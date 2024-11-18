/**
 * selector.js
 * 
 * Proporciona una función `$$(...)` para seleccionar y manipular elementos del DOM con una API similar a jQuery.
 * Métodos disponibles: html, text, css, addClass, removeClass, remove, on, off, allData.
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

        // Métodos básicos

        html(content) {
            if (content !== undefined) {
                elements.forEach((element) => {
                    element.innerHTML = content;
                });
                return this;
            } else {
                return elements[0]?.innerHTML || null; // TODO: Retornar null si no hay elementos.
            }
        },

        text(content) {
            if (content !== undefined) {
                elements.forEach((element) => {
                    element.textContent = content;
                });
                return this;
            } else {
                return elements[0]?.textContent || null; // TODO: Retornar null si no hay elementos.
            }
        },

        css(propertyOrObject, value) {
            if (typeof propertyOrObject === "object") {
                Object.entries(propertyOrObject).forEach(([key, val]) => {
                    elements.forEach((element) => {
                        element.style[key] = val ?? ''; // TODO: Manejar valores null/undefined explícitamente.
                    });
                });
            } else if (typeof propertyOrObject === "string" && value !== undefined) {
                elements.forEach((element) => {
                    element.style[propertyOrObject] = value;
                });
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
            elements.forEach((element) => {
                element.classList.add(className);
            });
            return this;
        },

        removeClass(className) {
            if (!className) {
                console.error('Class name must be provided.');
                return this;
            }
            elements.forEach((element) => {
                element.classList.remove(className);
            });
            return this;
        },

        remove() {
            elements.forEach((element) => {
                element.remove();
            });
            return this;
        },

        // Gestión de eventos

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

                // Guardar referencia para usar en "off"
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
                    // Eliminar un handler específico
                    const index = listeners.indexOf(handler);
                    if (index !== -1) {
                        element.removeEventListener(eventType, handler);
                        listeners.splice(index, 1);
                    }
                } else {
                    // Eliminar todos los handlers para el evento
                    listeners.forEach((listener) => {
                        element.removeEventListener(eventType, listener);
                    });
                    listeners.length = 0;
                }
            });

            return this; // TODO: Implementar offAll si se necesita eliminar todos los eventos.
        },

        // Gestión de datos

        allData() {
            if (!elements.length) {
                return []; // Devuelve un array vacío si no hay elementos seleccionados
            }
            if (elements.length === 1) {
                // Si solo hay un elemento, devolver su dataset como objeto
                return { ...elements[0].dataset };
            }
            // Si hay múltiples elementos, devolver un array de datasets
            return Array.from(elements).map((element) => ({ ...element.dataset }));
        },
    };

    return Object.create(api);
};
