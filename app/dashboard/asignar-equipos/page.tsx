"use client"

import React, { useEffect, useState } from "react"

import { MonitorPlay, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, Link as LinkIcon } from "lucide-react"

import { getClientes } from "@/services/clienteService"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function AsignarEquiposPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [clienteId, setClienteId] = useState<string>("")
  const [encargado, setEncargado] = useState<string>("")
  
  const [todosListos, setTodosListos] = useState<any[]>([])
  const [todosEquiposListos, setTodosEquiposListos] = useState<any[]>([])
  const [asignadosHistoricos, setAsignadosHistoricos] = useState<any[]>([])
  const [asignadosNuevos, setAsignadosNuevos] = useState<any[]>([])
  
  const [tipoFiltro, setTipoFiltro] = useState<"computador" | "equipo">("computador")
  
  const [seleccionadosIzquierda, setSeleccionadosIzquierda] = useState<number[]>([])
  const [seleccionadosDerecha, setSeleccionadosDerecha] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)

  // 1. Fetch initial data
  useEffect(() => {
    fetchClientes()
    fetchListos()
    fetchEquiposListos()
  }, [])

  useEffect(() => {
    if (tipoFiltro === "equipo") {
      fetchEquiposListos()
    } else {
      fetchListos()
    }
  }, [tipoFiltro])

  const fetchClientes = async () => {
    try {
      const response = await getClientes()
      setClientes(response.data || [])
    } catch (error) {
      console.error("Error al cargar clientes", error)
    }
  }

  const fetchListos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/computador/listos?page=1&limit=251`)
      const json = await res.json()
      setTodosListos(json.listos || [])
    } catch (error) {
      console.error("Error al cargar computadores listos", error)
    }
  }

  const fetchEquiposListos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/equipos/listos?page=1&limit=251`)
      const json = await res.json()
      const arr = (json.listos || []).map((e: any) => ({ ...e, _isEquipo: true }))
      setTodosEquiposListos(arr)
    } catch (error) {
      console.error("Error al cargar equipos listos", error)
    }
  }

  // 2. Cuando cambia el cliente, traemos sus asignaciones históricas y reiniciamos el área de nuevos
  useEffect(() => {
    if (clienteId) {
      fetchAsignadosCliente(clienteId)
    } else {
      setAsignadosHistoricos([])
      setEncargado("")
    }
    setAsignadosNuevos([])
    setSeleccionadosIzquierda([])
    setSeleccionadosDerecha([])
  }, [clienteId, todosListos, todosEquiposListos])

  const fetchAsignadosCliente = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/clientes-computadores/por-cliente?cliente=${id}&page=1&limit=251`)
      const json = await res.json()
      
      const arrayEquipos = json.listos || json.data || []
      
      if (arrayEquipos.length > 0) {
        const computadoresAsignados = arrayEquipos.map((d: any) => {
          if (d.tipo_de_equipo) {
             return { ...d, _isEquipo: !!d.pulgadas || d.estado === 'ENTREGADO' } 
          }
          if (d.computador) {
            return {
              ...d.computador,
              encargadoAsignado: d.encargado
            }
          }
          if (d.equipo) {
            return {
              ...d.equipo,
              encargadoAsignado: d.encargado,
              _isEquipo: true
            }
          }
          return d;
        }).filter(Boolean)
        
        setAsignadosHistoricos(computadoresAsignados)
        setEncargado(arrayEquipos[0].encargado || "")
      } else {
        setAsignadosHistoricos([])
        setEncargado("")
      }
    } catch (error) {
      console.error("Error al cargar equipos del cliente", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular disponibles dinámicamente según lo ya seleccionado
  const todosDisponibles = tipoFiltro === "computador" ? todosListos : todosEquiposListos
  const disponibles = todosDisponibles.filter(d => !asignadosNuevos.some(an => an.id === d.id && !!an._isEquipo === !!d._isEquipo))

  // 3. Transfer Logic
  const handleToggleIzquierda = (id: number) => {
    setSeleccionadosIzquierda(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleToggleDerecha = (id: number) => {
    setSeleccionadosDerecha(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const moveRight = () => {
    const toMove = disponibles.filter(c => seleccionadosIzquierda.includes(c.id))
    setAsignadosNuevos([...asignadosNuevos, ...toMove])
    setSeleccionadosIzquierda([])
  }

  const moveAllRight = () => {
    setAsignadosNuevos([...asignadosNuevos, ...disponibles])
    setSeleccionadosIzquierda([])
  }

  const moveLeft = () => {
    setAsignadosNuevos(asignadosNuevos.filter(c => !seleccionadosDerecha.includes(c.id)))
    setSeleccionadosDerecha([])
  }

  const moveAllLeft = () => {
    setAsignadosNuevos([])
    setSeleccionadosDerecha([])
  }

  // 4. Save
  const handleSave = async () => {
    if (!clienteId) {
      alert("Debe seleccionar un cliente")
      return
    }
    if (!encargado.trim()) {
      alert("Debe ingresar un encargado")
      return
    }

    try {
      setIsLoading(true)
      const payload = {
        cliente: Number(clienteId),
        computador: asignadosNuevos.filter(c => !c._isEquipo).map(c => c.id),
        equipo: asignadosNuevos.filter(c => c._isEquipo).map(c => c.id),
        encargado: encargado.trim()
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/clientes-computadores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Error en la solicitud")
      
      alert("Equipos asociados correctamente al cliente")
      // Refrescar datos
      fetchListos()
      fetchEquiposListos()
      fetchAsignadosCliente(clienteId)
      setAsignadosNuevos([])
      setClienteId("")
    } catch (error) {
      alert("Error al asociar los equipos")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 animate-in fade-in duration-500 pb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance flex items-center gap-2">
            <MonitorPlay className="h-6 w-6 text-primary" />
            <span>Asignación de Equipos</span>
          </h1>
          <p className="text-muted-foreground">
            Asocia los computadores en estado "LISTO" a los distintos clientes.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading || !clienteId || asignadosNuevos.length === 0} className="gap-2">
          <LinkIcon className="h-4 w-4" />
          <span>ASOCIAR</span>
        </Button>
      </div>

      <Card className="flex-1 border-border shadow-sm flex flex-col min-h-0">
        <CardContent className="flex-1 p-6 flex flex-col min-h-0">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Select value={clienteId} onValueChange={setClienteId} disabled={isLoading}>
                <SelectTrigger id="cliente" className="bg-secondary/50 border-0">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="encargado">Encargado *</Label>
              <Input 
                id="encargado" 
                placeholder="Ej: Juan Pérez" 
                className="bg-secondary/50 border-0"
                value={encargado}
                onChange={(e) => setEncargado(e.target.value)}
                disabled={!clienteId || isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
            {/* Lista Izquierda: Disponibles */}
            <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden">
              <div className="bg-secondary/50 p-2 border-b flex items-center justify-between gap-2">
                <Select value={tipoFiltro} onValueChange={(val: "computador" | "equipo") => { setTipoFiltro(val); setSeleccionadosIzquierda([]) }}>
                  <SelectTrigger className="w-[180px] h-8 text-xs font-semibold bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computador">Computadores Listos</SelectItem>
                    <SelectItem value="equipo">Equipos Listos</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground bg-background px-2 py-0.5 rounded-full text-xs font-medium">
                  {disponibles.length} disp.
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {disponibles.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    No hay equipos disponibles
                  </div>
                ) : (
                  disponibles.map(c => (
                    <div 
                      key={c.id} 
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => handleToggleIzquierda(c.id)}
                    >
                      <Checkbox 
                        checked={seleccionadosIzquierda.includes(c.id)} 
                        onCheckedChange={() => handleToggleIzquierda(c.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {c._isEquipo ? (c.tipo_equipo?.nombre || "Equipo") : `Computador ${c.id}`}
                          <span className="text-xs font-normal text-muted-foreground ml-2">SN: {c.n_serie || c.n_serie_bios || "N/A"}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {c.id} | {c.marca?.nombre || ""} {c.modelo?.nombre || ""}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Controles Centrales */}
            <div className="flex lg:flex-col justify-center items-center gap-2 py-4 lg:py-0">
              <Button variant="outline" size="icon" onClick={moveAllRight} disabled={disponibles.length === 0 || !clienteId} title="Mover todos">
                <ChevronsRight className="h-4 w-4 hidden lg:block" />
                <span className="lg:hidden text-xs">Todos Abajo</span>
              </Button>
              <Button variant="outline" size="icon" onClick={moveRight} disabled={seleccionadosIzquierda.length === 0 || !clienteId} title="Mover seleccionados">
                <ChevronRight className="h-4 w-4 hidden lg:block" />
                <span className="lg:hidden text-xs">Abajo</span>
              </Button>
              <Button variant="outline" size="icon" onClick={moveLeft} disabled={seleccionadosDerecha.length === 0 || !clienteId} title="Quitar seleccionados">
                <ChevronLeft className="h-4 w-4 hidden lg:block" />
                <span className="lg:hidden text-xs">Arriba</span>
              </Button>
              <Button variant="outline" size="icon" onClick={moveAllLeft} disabled={asignadosNuevos.length === 0 || !clienteId} title="Quitar todos">
                <ChevronsLeft className="h-4 w-4 hidden lg:block" />
                <span className="lg:hidden text-xs">Todos Arriba</span>
              </Button>
            </div>

            {/* Lista Derecha: Asignados */}
            <div className="flex-1 flex flex-col border rounded-lg bg-card overflow-hidden border-primary/20">
              <div className="bg-primary/5 p-3 border-b font-medium text-sm flex justify-between items-center">
                <span>Equipos Asignados</span>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {asignadosHistoricos.length + asignadosNuevos.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {!clienteId ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Selecciona un cliente para empezar a asignar
                  </div>
                ) : (asignadosHistoricos.length === 0 && asignadosNuevos.length === 0) ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Mueve los equipos aquí para asignarlos
                  </div>
                ) : (
                  <>
                    {/* Históricos de solo lectura */}
                    {asignadosHistoricos.map(c => (
                      <div 
                        key={`hist-${c.id}`} 
                        className="flex items-center gap-3 p-2 rounded-md bg-secondary/30 opacity-60 cursor-not-allowed"
                        title="Este equipo ya está asignado. No se puede remover desde aquí."
                      >
                        <Checkbox disabled checked />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {c._isEquipo ? (c.tipo_equipo?.nombre || "Equipo") : `Computador ${c.id}`}
                            <span className="font-normal italic text-xs ml-1 text-muted-foreground">(Encargado: {c.encargadoAsignado || "N/A"})</span>
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {c._isEquipo ? <Badge variant="secondary" className="mr-1 text-[10px] py-0 px-1">EQ</Badge> : <Badge variant="secondary" className="mr-1 text-[10px] py-0 px-1">PC</Badge>}
                            ID: {c.id} | SN: {c.n_serie || c.n_serie_bios || "N/A"} | {c.marca?.nombre || ""} {c.modelo?.nombre || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Nuevos asignados modificables */}
                    {asignadosNuevos.map(c => (
                      <div 
                        key={c.id} 
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors border border-primary/20 bg-primary/5"
                        onClick={() => handleToggleDerecha(c.id)}
                      >
                        <Checkbox 
                          checked={seleccionadosDerecha.includes(c.id)} 
                          onCheckedChange={() => handleToggleDerecha(c.id)}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-primary">
                            {c._isEquipo ? (c.tipo_equipo?.nombre || "Equipo") : `Computador ${c.id}`}
                            <span className="font-bold text-xs ml-2">(NUEVO)</span>
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            {c._isEquipo ? <Badge variant="outline" className="mr-1 text-[10px] py-0 px-1 border-primary/30 text-primary">EQ</Badge> : <Badge variant="outline" className="mr-1 text-[10px] py-0 px-1 border-primary/30 text-primary">PC</Badge>}
                            ID: {c.id} | SN: {c.n_serie || c.n_serie_bios || "N/A"} | {c.marca?.nombre || ""} {c.modelo?.nombre || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
