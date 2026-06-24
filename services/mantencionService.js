const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL ;
const BASE_URL = `${GLOBAL_API_URL}/mantencion`;

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista paginada de mantenciones.
 * @param {number} page - Número de página
 * @param {number} limit - Límite de elementos por página
 */
export async function getMantenciones(page = 1, limit = 10) {
  try {
    const response = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Error al obtener mantenciones: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getMantenciones:", error);
    throw error;
  }
}

/**
 * Crea una nueva mantención en el backend.
 * @param {object} data - Datos de la mantención a crear
 */
export async function createMantencion(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear mantención: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createMantencion:", error);
    throw error;
  }
}

/**
 * Actualiza una mantención existente en el backend.
 * @param {number|string} id - ID de la mantención
 * @param {object} data - Datos a actualizar
 */
export async function updateMantencion(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar mantención: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateMantencion:", error);
    throw error;
  }
}

/**
 * Elimina una mantención en el backend.
 * @param {number|string} id - ID de la mantención a eliminar
 */
export async function deleteMantencion(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar mantención: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteMantencion:", error);
    throw error;
  }
}

/**
 * Obtiene el encargado de un computador específico.
 * @param {number|string} id - ID del computador
 */
export async function getEncargadosPorComputador(id) {
  try {
    const response = await fetch(`${BASE_URL}/encargados/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener encargado por computador: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getEncargadosPorComputador:", error);
    throw error;
  }
}

export async function getMantencionesComputador(id, page = 1, limit = 10) {
  try {
    const url = `${BASE_URL}/computador/${id}?page=${page}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener mantenciones del computador: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getMantencionesComputador:", error);
    throw error;
  }
}

export async function getPendientesComercial() {
  const res = await fetch(`${BASE_URL}/pendientes/comercial`);
  if (!res.ok) throw new Error("Error obteniendo pendientes comerciales");
  return res.json();
}

export async function getPendientesTecnico() {
  const res = await fetch(`${BASE_URL}/pendientes/tecnico`);
  if (!res.ok) throw new Error("Error obteniendo pendientes técnicos");
  return res.json();
}

export async function aceptarComercial(tipo, id, encargado, upgrade = false) {
  const res = await fetch(`${BASE_URL}/comercial/aceptar/${tipo}/${id}`, { 
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encargado, upgrade })
  });
  if (!res.ok) throw new Error("Error al aceptar");
  return safeParseResponse(res);
}

export async function aplazarComercial(tipo, id, fecha_proxima_mantencion) {
  const res = await fetch(`${BASE_URL}/comercial/aplazar/${tipo}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fecha_proxima_mantencion })
  });
  if (!res.ok) throw new Error("Error al aplazar");
  return safeParseResponse(res);
}

export async function rechazarComercial(tipo, id) {
  const res = await fetch(`${BASE_URL}/comercial/rechazar/${tipo}/${id}`, { method: 'PATCH' });
  if (!res.ok) throw new Error("Error al rechazar");
  return safeParseResponse(res);
}

export async function completarTecnico(tipo, id, data) {
  const res = await fetch(`${BASE_URL}/tecnico/completar/${tipo}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Error al completar técnico");
  return safeParseResponse(res);
}

export async function searchMantenciones(query) {
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
    console.error("Error en searchMantenciones:", error);
    throw error;
  }
}
