const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = `${GLOBAL_API_URL}/reparacion`;

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista paginada de reparaciones.
 * @param {number} page - Número de página
 * @param {number} limit - Límite de elementos por página
 */
export async function getReparaciones(page = 1, limit = 10) {
  try {
    const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error al obtener reparaciones: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getReparaciones:", error);
    throw error;
  }
}

/**
 * Crea una nueva reparación en el backend.
 * @param {object} data - Datos de la reparación a crear
 */
export async function createReparacion(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear reparación: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createReparacion:", error);
    throw error;
  }
}

/**
 * Actualiza una reparación existente en el backend.
 * @param {number|string} id - ID de la reparación
 * @param {object} data - Datos a actualizar
 */
export async function updateReparacion(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar reparación: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateReparacion:", error);
    throw error;
  }
}

/**
 * Elimina una reparación en el backend.
 * @param {number|string} id - ID de la reparación a eliminar
 */
export async function deleteReparacion(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar reparación: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteReparacion:", error);
    throw error;
  }
}

export async function searchReparaciones(query) {
  try {
    const response = await fetch(`${BASE_URL}/PorQuery?query=${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error en búsqueda: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en searchReparaciones:", error);
    throw error;
  }
}
