const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL ;
const BASE_URL = `${GLOBAL_API_URL}/computador`;

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista paginada de computadores.
 * @param {number} page - Número de página
 * @param {number} limit - Límite de elementos por página
 */
export async function getComputadores(page = 1, limit = 6, search = "") {
  try {
    let url = `${BASE_URL}?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener computadores: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getComputadores:", error);
    throw error;
  }
}

const NUMERIC_KEYS = [
  "tipo_de_equipo",
  "marca",
  "modelo",
  "procesador",
  "memoria_ram_1",
  "memoria_ram_2",
  "memoria_ram_3",
  "memoria_ram_4",
  "disco_alma_1",
  "disco_alma_2",
  "disco_alma_3",
  "tarjeta_grafica",
  "fuente",
  "placa",
  "cliente",
  "key_win",
  "key_office"
];

/**
 * Crea un nuevo computador en el backend.
 * @param {object} data - Datos del computador a crear
 */
export async function createComputador(data) {
  try {
    const payload = { ...data };
    Object.keys(payload).forEach((key) => {
      if (NUMERIC_KEYS.includes(key)) {
        if (payload[key] === null || payload[key] === undefined || payload[key] === "" || payload[key] === "_null") {
          payload[key] = null;
        } else if (typeof payload[key] !== "object") {
          payload[key] = Number(payload[key]);
        }
      }
    });

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error al crear computador: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createComputador:", error);
    throw error;
  }
}

/**
 * Actualiza un computador existente en el backend.
 * @param {number|string} id - ID del computador
 * @param {object} data - Datos a actualizar
 */
export async function updateComputador(id, data) {
  try {
    const payload = { ...data };
    Object.keys(payload).forEach((key) => {
      if (NUMERIC_KEYS.includes(key)) {
        if (payload[key] === null || payload[key] === undefined || payload[key] === "" || payload[key] === "_null") {
          payload[key] = null;
        } else if (typeof payload[key] !== "object") {
          payload[key] = Number(payload[key]);
        }
      }
    });

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar computador: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateComputador:", error);
    throw error;
  }
}

/**
 * Elimina un computador en el backend.
 * @param {number|string} id - ID del computador a eliminar
 */
export async function deleteComputador(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar computador: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteComputador:", error);
    throw error;
  }
}

/**
 * Busca computadores utilizando un término general (ILIKE).
 * @param {string} query - Término de búsqueda (serial, bios, marca, etc.)
 */
export async function buscarComputadores(query) {
  try {
    const response = await fetch(`${BASE_URL}/buscar/general?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Error al buscar computadores: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en buscarComputadores:", error);
    throw error;
  }
}
