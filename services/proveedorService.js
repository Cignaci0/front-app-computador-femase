const API_URL = "http://localhost:3000/proveedor";

/**
 * Obtiene la lista de proveedores paginados desde la API.
 * @param {number} page - Número de página.
 * @param {number} limit - Límite de elementos por página.
 * @returns {Promise<{ data: Array<{ id: number, nombre: string }>, meta: any }>}
 */
export async function getProveedores(page = 1, limit = 10, search = "") {
  try {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener proveedores: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getProveedores:", error);
    throw error;
  }
}

/**
 * Crea un nuevo proveedor en el backend.
 * @param {string} nombre - Nombre del proveedor.
 * @returns {Promise<any>}
 */
export async function createProveedor(nombre, contacto = "", telefono = "", email = "") {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nombre,
        contacto: contacto,
        telefono: telefono,
        email: email,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al crear proveedor: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en createProveedor:", error);
    throw error;
  }
}

/**
 * Actualiza un proveedor existente en el backend.
 * @param {number} id - ID del proveedor.
 * @param {string} nombre - Nuevo nombre del proveedor.
 * @returns {Promise<any>}
 */
export async function updateProveedor(id, nombre, contacto = "", telefono = "", email = "") {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, contacto, telefono, email }),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar proveedor: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error en updateProveedor:", error);
    throw error;
  }
}

/**
 * Elimina un proveedor en el backend.
 * @param {number} id - ID del proveedor a eliminar.
 * @returns {Promise<boolean>}
 */
export async function deleteProveedor(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar proveedor: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteProveedor:", error);
    throw error;
  }
}
