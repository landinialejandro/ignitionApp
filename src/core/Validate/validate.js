// * file: src/core/Validate/index.js

export function validateProperties(properties, updateValues) {
    const errors = {};
  
    properties.forEach(property => {
      const updatedProperty = updateValues.find(
        item => item.caption === property.caption
      );
  
      if (!updatedProperty) {
        // Si no se encuentra el objeto correspondiente en updateValues
        errors[property.caption] = `Missing value for "${property.caption}".`;
        return;
      }
  
      // Validación de 'required'
      if (property.required && !updatedProperty.value) {
        errors[property.caption] = `"${property.caption}" is required.`;
      }
  
      // Validación de 'type' (ejemplo: password)
      if (property.type === 'password' && updatedProperty.value.length < 8) {
        errors[property.caption] = `"${property.caption}" must be at least 8 characters long.`;
      }
  
      // Aquí puedes agregar más validaciones específicas según sea necesario
    });
  
    return errors;
  }
  
