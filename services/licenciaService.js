const BASE_URL = "http://localhost:3000";

async function safeParseResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Obtiene la lista de licencias de Windows paginadas.
 */
export async function getLicenciasWin(page = 1, limit = 9, search = "") {
  try {
    const response = await fetch(`${BASE_URL}/licencia-win?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    if (!response.ok) {
      throw new Error(`Error al obtener licencias Windows: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getLicenciasWin:", error);
    throw error;
  }
}

/**
 * Crea una nueva licencia de Windows.
 */
export async function createLicenciaWin(data) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-win`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear licencia Windows: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createLicenciaWin:", error);
    throw error;
  }
}

/**
 * Actualiza una licencia de Windows.
 */
export async function updateLicenciaWin(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-win/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar licencia Windows: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateLicenciaWin:", error);
    throw error;
  }
}

/**
 * Elimina una licencia de Windows.
 */
export async function deleteLicenciaWin(id) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-win/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar licencia Windows: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteLicenciaWin:", error);
    throw error;
  }
}

/**
 * Obtiene la lista de licencias de Office paginadas.
 */
export async function getLicenciasOffice(page = 1, limit = 9, search = "") {
  try {
    const response = await fetch(`${BASE_URL}/licencia-office?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    if (!response.ok) {
      throw new Error(`Error al obtener licencias Office: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getLicenciasOffice:", error);
    throw error;
  }
}

/**
 * Crea una nueva licencia de Office.
 */
export async function createLicenciaOffice(data) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-office`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al crear licencia Office: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en createLicenciaOffice:", error);
    throw error;
  }
}

/**
 * Actualiza una licencia de Office.
 */
export async function updateLicenciaOffice(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-office/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error al actualizar licencia Office: ${response.statusText}`);
    }
    return await safeParseResponse(response);
  } catch (error) {
    console.error("Error en updateLicenciaOffice:", error);
    throw error;
  }
}

/**
 * Elimina una licencia de Office.
 */
export async function deleteLicenciaOffice(id) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-office/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar licencia Office: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error("Error en deleteLicenciaOffice:", error);
    throw error;
  }
}

/**
 * Obtiene los computadores que usan una licencia de Windows específica.
 */
export async function getComputadoresByLicenciaWin(id) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-win/computadores/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener computadores para licencia Windows: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getComputadoresByLicenciaWin:", error);
    throw error;
  }
}

/**
 * Obtiene los computadores que usan una licencia de Office específica.
 */
export async function getComputadoresByLicenciaOffice(id) {
  try {
    const response = await fetch(`${BASE_URL}/licencia-office/computadores/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener computadores para licencia Office: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getComputadoresByLicenciaOffice:", error);
    throw error;
  }
}
