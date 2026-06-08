const fs = require('fs');
let code = fs.readFileSync('services/mantencionService.js', 'utf8');

const newMethod = `
export async function getMantencionesComputador(id, page = 1, limit = 10) {
  try {
    const url = \`\${API_URL}/computador/\${id}?page=\${page}&limit=\${limit}\`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`Error al obtener mantenciones del computador: \${response.statusText}\`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getMantencionesComputador:", error);
    throw error;
  }
}
`;

if (!code.includes('getMantencionesComputador')) {
  fs.appendFileSync('services/mantencionService.js', newMethod);
  console.log('Added getMantencionesComputador to mantencionService.js');
} else {
  console.log('Method already exists');
}
