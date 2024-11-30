

export const procesInputForm = (form) => {
    
    const inputs = objecFomFilter(form);
    const updatedValues = [];
    
    // Procesa todos los inputs
    inputs.forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            // Incluye todos los checkbox y radios con su estado checked
            updatedValues.push({
                caption: input.getAttribute('data-name') || input.id,
                value: input.checked // true si está marcado, false si no
            });
        } else {
            // Procesa otros tipos de input (text, textarea, select)
            updatedValues.push({
                caption: input.name || input.id,
                value: input.value
            });
        }
    });

    return updatedValues;
}

export const validateErrorsForm = (form,errors) => {

    const inputs = objecFomFilter(form);

    if (Object.keys(errors).length > 0) {
        console.error("Validation Errors:", errors);
        inputs.forEach(input => {
            const fieldName = input.name; // O usa `id` si prefieres
            if (errors[fieldName]) {
                input.closest(".form-group").classList.add("error");
                input.classList.add("error"); // Clase de error para destacar el campo
                const errorMessage = document.createElement("div");
                errorMessage.className = "error-message";
                errorMessage.textContent = errors[fieldName];
                input.parentElement.appendChild(errorMessage); // Agrega el mensaje de error al DOM
            } else {
                input.closest(".form-group").classList.remove("error");
                input.classList.remove("error"); // Elimina la clase de error si no hay problema
                const existingError = input.parentElement.querySelector(".error-message");
                if (existingError) {
                    existingError.remove(); // Elimina mensajes de error previos
                }
            }
        });
        return true
    } else {
        console.log("Validation Passed!");
        return false
    }

}

const objecFomFilter = (form) => form.querySelectorAll("input, textarea, select");