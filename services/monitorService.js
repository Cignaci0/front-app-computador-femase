const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL ;
const API_URL = `${GLOBAL_API_URL}/monitor`;

/**
 * Obtiene la lista de monitores paginados desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @returns {Promise<{ data: Array<{ id: number, pulgadas: string, marca?: any }>, meta: any }>}
 */
export async function getMonitores(page = 1, limit = 8) {
  try {
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error al obtener monitores: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getMonitores:", error);
    throw error;
  }
}

/**
 * Crea un nuevo monitor en el backend.
 * @param {string} pulgadas - Pulgadas del monitor.
 * @param {number} marcaId - ID de la marca.
 * @returns {Promise<string>}
 */
export async function createMonitor(pulgadas, marcaId) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pulgadas: pulgadas,
        marca: Number(marcaId),
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear monitor: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en createMonitor:", error);
    throw error;
  }
}

/**
 * Actualiza un monitor existente en el backend.
 * @param {number} id - ID del monitor.
 * @param {string} pulgadas - Pulgadas del monitor.
 * @param {number} marcaId - ID de la marca.
 * @returns {Promise<any>}
 */
export async function updateMonitor(id, pulgadas, marcaId) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pulgadas,
        marca: Number(marcaId),
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar monitor: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en updateMonitor:", error);
    throw error;
  }
}

/**
 * Elimina un monitor en el backend.
 * @param {number} id - ID del monitor a eliminar.
 * @returns {Promise<boolean>}
 */
export async function deleteMonitor(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar monitor: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteMonitor:", error);
    throw error;
  }
}
