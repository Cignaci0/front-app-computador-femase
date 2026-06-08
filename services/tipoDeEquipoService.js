const API_URL = "http://localhost:3000/tipo-de-equipo";

/**
 * Obtiene la lista de tipos de equipo paginados desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @returns {Promise<{ data: Array<{ id: number, nombre: string }>, meta: any }>}
 */
export async function getTiposDeEquipo(page = 1, limit = 6, search = "") {
  try {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener tipos de equipo: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getTiposDeEquipo:", error);
    throw error;
  }
}

/**
 * Crea un nuevo tipo de equipo en el backend.
 * @param {string} nombre - Nombre del tipo de equipo.
 * @param {string} descripcion - Descripción del tipo de equipo.
 * @returns {Promise<string>}
 */
export async function createTipoDeEquipo(nombre, descripcion, computador = false) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        descripcion: descripcion,
        computador: computador,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear tipo de equipo: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en createTipoDeEquipo:", error);
    throw error;
  }
}

/**
 * Actualiza un tipo de equipo existente en el backend.
 * @param {number} id - ID del tipo de equipo.
 * @param {string} nombre - Nuevo nombre del tipo de equipo.
 * @param {string} descripcion - Nueva descripción del tipo de equipo.
 * @returns {Promise<string>}
 */
export async function updateTipoDeEquipo(id, nombre, descripcion, computador = false) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        descripcion: descripcion,
        computador: computador,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar tipo de equipo: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en updateTipoDeEquipo:", error);
    throw error;
  }
}

/**
 * Elimina un tipo de equipo en el backend.
 * @param {number} id - ID del tipo de equipo a eliminar.
 * @returns {Promise<boolean>}
 */
export async function deleteTipoDeEquipo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar tipo de equipo: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteTipoDeEquipo:", error);
    throw error;
  }
}
