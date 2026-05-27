const BASE_URL = "http://localhost:3000/equipos";

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista paginada de equipos (no computadores).
 */
export async function getEquipos(page = 1, limit = 10) {
  try {
    const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error al obtener equipos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getEquipos:", error);
    throw error;
  }
}

/**
 * Crea un nuevo equipo en el backend.
 */
export async function createEquipo(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear equipo: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createEquipo:", error);
    throw error;
  }
}

/**
 * Actualiza un equipo existente en el backend.
 */
export async function updateEquipo(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar equipo: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateEquipo:", error);
    throw error;
  }
}

/**
 * Elimina un equipo en el backend.
 */
export async function deleteEquipo(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar equipo: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteEquipo:", error);
    throw error;
  }
}
