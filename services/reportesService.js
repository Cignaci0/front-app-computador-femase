const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const downloadReport = (reportType, clienteId) => {
  const url = `${API_URL}/reportes/${reportType}${clienteId && clienteId !== "all" ? '?clienteId=' + clienteId : ''}`;
  window.open(url, '_blank');
};
