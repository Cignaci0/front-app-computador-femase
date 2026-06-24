
const API_URL = process.env.NEXT_PUBLIC_API_URL 

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/usuario/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Usuario o contraseña incorrectos")
  }

  return data
}
