const BASE_URL = "http://localhost:3000/alertas";

/**
 * Obtiene la lista de todas las alertas.
 */
export async function getAlertas() {
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error(`Error al obtener alertas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getAlertas:", error);
    throw error;
  }
}
