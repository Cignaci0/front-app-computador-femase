const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${GLOBAL_API_URL}/marca`;

/**
 * Obtiene la lista de marcas paginadas desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @returns {Promise<{ data: Array<{ id: number, nombre: string }>, meta: any }>}
 */
export async function getMarcas(page = 1, limit = 6, search = "") {
  try {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener marcas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getMarcas:", error);
    throw error;
  }
}

/**
 * Crea una nueva marca en el backend.
 * @param {string} nombre - Nombre del dispositivo/marca.
 * @param {number} marcaId - ID de la marca asociado (por defecto 1).
 * @returns {Promise<string>}
 */
export async function createMarca(nombre, marcaId = 1) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        marca: marcaId,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear marca: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en createMarca:", error);
    throw error;
  }
}

/**
 * Actualiza una marca existente en el backend.
 * @param {number} id - ID de la marca.
 * @param {string} nombre - Nuevo nombre de la marca.
 * @returns {Promise<any>}
 */
export async function updateMarca(id, nombre) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre }),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar marca: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en updateMarca:", error);
    throw error;
  }
}

/**
 * Elimina una marca en el backend.
 * @param {number} id - ID de la marca a eliminar.
 * @returns {Promise<boolean>}
 */
export async function deleteMarca(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar marca: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteMarca:", error);
    throw error;
  }
}
