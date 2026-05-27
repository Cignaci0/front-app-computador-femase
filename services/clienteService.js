const API_URL = "http://localhost:3000/cliente";

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista de clientes paginados desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @returns {Promise<{ data: Array<{ id: number, nombre: string }>, meta: any }>}
 */
export async function getClientes(page = 1, limit = 6) {
  try {
    const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error al obtener clientes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getClientes:", error);
    throw error;
  }
}

/**
 * Crea un nuevo cliente en el backend.
 * @param {string|object} data - Nombre del cliente o un objeto con los datos del cliente.
 */
export async function createCliente(data) {
  const body = typeof data === "string" ? { nombre: data } : data;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Error al crear cliente: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createCliente:", error);
    throw error;
  }
}

/**
 * Actualiza un cliente existente en el backend.
 * @param {number|string} id - ID del cliente.
 * @param {string|object} data - Nuevo nombre del cliente o un objeto con los datos a actualizar.
 */
export async function updateCliente(id, data) {
  const body = typeof data === "string" ? { nombre: data } : data;
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar cliente: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateCliente:", error);
    throw error;
  }
}

/**
 * Elimina un cliente en el backend.
 * @param {number|string} id - ID del cliente a eliminar.
 */
export async function deleteCliente(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar cliente: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteCliente:", error);
    throw error;
  }
}
