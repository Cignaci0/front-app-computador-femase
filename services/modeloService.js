const API_URL = "http://localhost:3000/modelo";

/**
 * Obtiene la lista de modelos paginados desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @param {string} [search] - Término de búsqueda.
 * @param {number|null} [marcaId] - Filtro opcional por ID de marca.
 * @returns {Promise<{ data: Array<{ id: number, nombre: string, marca?: { id: number, nombre: string } }>, meta: any }>}
 */
export async function getModelos(page = 1, limit = 6, search = "", marcaId = null) {
  try {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (marcaId) {
      url += `&marca=${marcaId}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener modelos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getModelos:", error);
    throw error;
  }
}

/**
 * Crea un nuevo modelo en el backend.
 * @param {string} nombre - Nombre del modelo.
 * @param {number} marcaId - ID de la marca asociada.
 * @returns {Promise<string>}
 */
export async function createModelo(nombre, marcaId) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        marca: Number(marcaId),
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear modelo: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en createModelo:", error);
    throw error;
  }
}

/**
 * Actualiza un modelo existente en el backend.
 * @param {number} id - ID del modelo.
 * @param {string} nombre - Nuevo nombre del modelo.
 * @param {number} marcaId - ID de la nueva marca asociada.
 * @returns {Promise<any>}
 */
export async function updateModelo(id, nombre, marcaId) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        marca: Number(marcaId),
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar modelo: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en updateModelo:", error);
    throw error;
  }
}

/**
 * Elimina un modelo en el backend.
 * @param {number} id - ID del modelo a eliminar.
 * @returns {Promise<boolean>}
 */
export async function deleteModelo(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar modelo: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteModelo:", error);
    throw error;
  }
}
