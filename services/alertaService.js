const GLOBAL_API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = `${GLOBAL_API_URL}/alertas`;

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
