const BASE_URL = "http://localhost:3000";

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista paginada de un tipo de componente de hardware.
 * @param {string} type - Tipo de componente (ej: 'disco-almacenamiento', 'fuente-poder', etc.)
 * @param {number} page - Número de página
 * @param {number} limit - Límite de elementos por página
 */
export async function getComponentes(type, page = 1, limit = 6, search = "") {
  try {
    let url = `${BASE_URL}/${type}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener ${type}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error en getComponentes para ${type}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo componente de hardware en el backend.
 * @param {string} type - Tipo de componente
 * @param {object} data - Datos del componente a crear
 */
export async function createComponente(type, data) {
  try {
    // Sanitizar id_marca si es que viene
    if (data.id_marca !== undefined) {
      data.id_marca = data.id_marca === "" || data.id_marca === null ? null : Number(data.id_marca);
    }
    
    const response = await fetch(`${BASE_URL}/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear ${type}: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error(`Error en createComponente para ${type}:`, error);
    throw error;
  }
}

/**
 * Actualiza un componente de hardware existente en el backend.
 * @param {string} type - Tipo de componente
 * @param {number|string} id - ID del componente
 * @param {object} data - Datos a actualizar
 */
export async function updateComponente(type, id, data) {
  try {
    if (data.id_marca !== undefined) {
      data.id_marca = data.id_marca === "" || data.id_marca === null ? null : Number(data.id_marca);
    }

    const response = await fetch(`${BASE_URL}/${type}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar ${type}: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error(`Error en updateComponente para ${type}:`, error);
    throw error;
  }
}

/**
 * Elimina un componente de hardware en el backend.
 * @param {string} type - Tipo de componente
 * @param {number|string} id - ID del componente
 */
export async function deleteComponente(type, id) {
  try {
    const response = await fetch(`${BASE_URL}/${type}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar ${type}: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error(`Error en deleteComponente para ${type}:`, error);
    throw error;
  }
}
