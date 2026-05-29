"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, FileText, BarChart3, PieChart, TrendingUp, Loader2, Printer } from "lucide-react"
import { toast } from "sonner"
import { getComputadores } from "@/services/computadorService"
import { getEquipos } from "@/services/equipoService"
import { getMantenciones } from "@/services/mantencionService"

const reportTypes = [
  {
    id: 1,
    title: "Inventario General",
    description: "Reporte completo de todos los equipos y computadores registrados",
    icon: FileText,
    lastGenerated: "En tiempo real",
  },
  {
    id: 2,
    title: "Equipos por Estado",
    description: "Distribución de equipos y computadores según su estado actual",
    icon: PieChart,
    lastGenerated: "En tiempo real",
  },
  {
    id: 3,
    title: "Historial de Mantenciones",
    description: "Registro de todas las mantenciones preventivas y correctivas",
    icon: BarChart3,
    lastGenerated: "En tiempo real",
  },
  {
    id: 4,
    title: "Resumen de Inventario",
    description: "Métricas generales y estadísticas consolidadas del sistema",
    icon: TrendingUp,
    lastGenerated: "En tiempo real",
  },
]

// Dynamic Script loading helpers for jsPDF & AutoTable
const loadJsPDF = () => {
  return new Promise<any>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("window is not defined"));
      return;
    }
    if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
      resolve((window as any).jspdf.jsPDF);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      const checkInterval = setInterval(() => {
        if ((window as any).jspdf && (window as any).jspdf.jsPDF) {
          clearInterval(checkInterval);
          resolve((window as any).jspdf.jsPDF);
        }
      }, 50);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadAutoTable = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error("window is not defined"));
      return;
    }
    // Check if autotable plugin is loaded
    const tempDoc = new ((window as any).jspdf?.jsPDF || Object)();
    if (tempDoc.autoTable) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";
    script.onload = () => {
      const checkInterval = setInterval(() => {
        const docTest = new ((window as any).jspdf?.jsPDF || Object)();
        if (docTest.autoTable) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function ReportesPage() {
  const [period, setPeriod] = useState("all")
  const [deviceType, setDeviceType] = useState("all")
  const [generatingReportId, setGeneratingReportId] = useState<number | null>(null)
  const [generatingFormat, setGeneratingFormat] = useState<"pdf" | "excel" | "print" | null>(null)

  // CSV generation helper
  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = "\uFEFF" + [
      headers.join(";"),
      ...rows.map(row => row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // PDF Generation Helper
  const downloadPDFFile = async (title: string, headers: string[], rows: any[][], description: string) => {
    toast.info("Cargando motor de PDF...")
    const jsPDFClass = await loadJsPDF();
    await loadAutoTable();

    // Create document instance
    const doc = new jsPDFClass({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Add corporate header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`FEMASE - Reporte de ${title}`, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(description, 14, 24);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-CL")} | Filtros: Período=${period}, Categoría=${deviceType}`, 14, 29);

    const startY = 34;

    // Generate AutoTable
    if (typeof (doc as any).autoTable === 'function') {
      (doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: startY,
        styles: { fontSize: 7, cellPadding: 2, font: "helvetica" },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 15, right: 14, bottom: 15, left: 14 }
      });
    } else {
      // Direct drawing fallback
      let currY = startY;
      doc.setFont("helvetica", "bold");
      headers.forEach((h, idx) => {
        doc.text(h, 14 + (idx * 22), currY);
      });
      currY += 8;
      doc.setFont("helvetica", "normal");
      rows.forEach(row => {
        if (currY > 280) {
          doc.addPage();
          currY = 20;
        }
        row.forEach((cell, idx) => {
          doc.text(String(cell ?? "").substring(0, 18), 14 + (idx * 22), currY);
        });
        currY += 6;
      });
    }

    // Save PDF
    const filename = `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`;
    doc.save(filename);
  }

  // Printable view helper
  const printReport = (title: string, headers: string[], rows: any[][], description: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("El navegador bloqueó la ventana emergente de impresión. Por favor habilítala.");
      return;
    }

    const html = `
      <html>
        <head>
          <title>Reporte - ${title}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; background: white; }
            h1 { margin-top: 0; margin-bottom: 5px; color: #0f172a; font-size: 24px; }
            .subtitle { color: #64748b; font-size: 14px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600; text-align: left; padding: 12px 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            td { border-bottom: 1px solid #f1f5f9; padding: 10px; font-size: 12px; color: #334155; }
            tr:nth-child(even) td { background: #fcfcfc; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; }
            .no-print-btn { display: inline-flex; align-items: center; padding: 8px 16px; background: #0f172a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; margin-bottom: 20px; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="display: flex; justify-content: space-between; align-items: center;">
            <button class="no-print-btn" onclick="window.print()">Imprimir / Guardar PDF</button>
            <span style="font-size: 12px; color: #64748b;">Presiona el botón para abrir el diálogo de exportación.</span>
          </div>
          <div>
            <h1>FEMASE • Reporte de ${title}</h1>
            <div class="subtitle">${description}</div>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map(val => `<td>${val ?? ""}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="footer">
            <span>Generado automáticamente por el Sistema FEMASE</span>
            <span>Fecha de generación: ${new Date().toLocaleDateString("es-CL")}</span>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // Filter helper for items based on selected filters
  const applyFilters = (items: any[], dateField?: string, typeField?: string) => {
    let filtered = [...items];

    // 1. Period filter (Date based)
    if (period !== "all" && dateField) {
      const now = new Date();
      const limitDate = new Date();

      if (period === "month") limitDate.setMonth(now.getMonth() - 1);
      else if (period === "quarter") limitDate.setMonth(now.getMonth() - 3);
      else if (period === "year") limitDate.setFullYear(now.getFullYear() - 1);

      filtered = filtered.filter(item => {
        if (!item[dateField]) return false;
        const itemDate = new Date(item[dateField]);
        return itemDate >= limitDate;
      });
    }

    // 2. Device Type filter
    if (deviceType !== "all") {
      filtered = filtered.filter(item => {
        const rawType = item.tipo_de_equipo?.nombre || item.tipo_equipo?.nombre || item.tipo || "";
        const typeLower = rawType.toLowerCase();

        if (deviceType === "desktop") {
          return typeLower.includes("desktop") || typeLower.includes("escritorio") || typeLower.includes("pc");
        }
        if (deviceType === "laptop") {
          return typeLower.includes("notebook") || typeLower.includes("laptop") || typeLower.includes("portatil");
        }
        if (deviceType === "monitor") {
          return typeLower.includes("monitor") || typeLower.includes("pantalla");
        }
        if (deviceType === "printer") {
          return typeLower.includes("impresora") || typeLower.includes("printer");
        }
        return true;
      });
    }

    return filtered;
  };

  const handleGenerateReport = async (reportId: number, format: "pdf" | "excel" | "print") => {
    setGeneratingReportId(reportId)
    setGeneratingFormat(format)

    try {
      if (reportId === 1) {
        // --- 1. INVENTARIO GENERAL ---
        const [compRes, eqRes] = await Promise.all([
          getComputadores(1, 1000).catch(() => ({ data: [] })),
          getEquipos(1, 1000).catch(() => ({ data: [] }))
        ]);

        const computers = (compRes.data || []).map((c: any) => ({
          ...c,
          tipo: c.tipo_de_equipo?.nombre || "Computador",
          serie: c.n_serie_bios || "N/A"
        }));

        const equipment = (eqRes.data || []).map((e: any) => ({
          ...e,
          tipo: e.tipo_equipo?.nombre || "Equipo General",
          serie: e.n_serie || "N/A"
        }));

        const combined = [...computers, ...equipment];
        const filtered = applyFilters(combined, "fecha_compra", "tipo");

        const headers = ["ID", "Tipo", "Nombre", "Marca", "Modelo", "N° Serie / BIOS", "Cliente", "Estado", "Garantía"];
        const rows = filtered.map(item => [
          String(item.id),
          item.tipo,
          item.nombre_equipo || item.nombre || "N/A",
          item.marca?.nombre || "N/A",
          item.modelo?.nombre || "N/A",
          item.serie,
          item.cliente?.nombre || "Sin Asignar",
          item.estado || "REGISTRADO",
          item.vencimiento_garantia || item.fe_exp_garantia ? new Date(item.vencimiento_garantia || item.fe_exp_garantia).toLocaleDateString("es-CL") : "N/A"
        ]);

        if (format === "excel") {
          downloadCSV("inventario_general.csv", headers, rows);
        } else if (format === "print") {
          printReport("Inventario General", headers, rows, "Listado de todos los computadores y equipos TI registrados en la base de datos.");
        } else {
          await downloadPDFFile("Inventario General", headers, rows, "Listado de todos los computadores y equipos TI registrados.");
        }
      } 
      else if (reportId === 2) {
        // --- 2. EQUIPOS POR ESTADO ---
        const [compRes, eqRes] = await Promise.all([
          getComputadores(1, 1000).catch(() => ({ data: [] })),
          getEquipos(1, 1000).catch(() => ({ data: [] }))
        ]);

        const computers = (compRes.data || []).map((c: any) => ({
          ...c,
          tipo: c.tipo_de_equipo?.nombre || "Computador",
          serie: c.n_serie_bios || "N/A"
        }));

        const equipment = (eqRes.data || []).map((e: any) => ({
          ...e,
          tipo: e.tipo_equipo?.nombre || "Equipo General",
          serie: e.n_serie || "N/A"
        }));

        const combined = [...computers, ...equipment];
        const filtered = applyFilters(combined, undefined, "tipo");

        // Sort by status
        filtered.sort((a, b) => (a.estado || "").localeCompare(b.estado || ""));

        const headers = ["Estado", "Tipo de Activo", "Nombre/Modelo", "N° Serie", "Cliente"];
        const rows = filtered.map(item => [
          item.estado || "REGISTRADO",
          item.tipo,
          item.nombre_equipo || item.nombre || "N/A",
          item.serie,
          item.cliente?.nombre || "Sin Asignar"
        ]);

        if (format === "excel") {
          downloadCSV("equipos_por_estado.csv", headers, rows);
        } else if (format === "print") {
          printReport("Equipos por Estado", headers, rows, "Agrupamiento de activos TI clasificados por su estado logístico.");
        } else {
          await downloadPDFFile("Equipos por Estado", headers, rows, "Agrupamiento de activos TI clasificados por su estado logístico.");
        }
      } 
      else if (reportId === 3) {
        // --- 3. HISTORIAL DE MANTENCIONES ---
        const mntRes = await getMantenciones(1, 1000).catch(() => ({ data: [] }));
        const maintenances = mntRes.data || [];
        
        const filtered = applyFilters(maintenances, "fecha_egreso", undefined);

        const headers = ["ID", "Dispositivo", "Tipo", "Encargado/Técnico", "Cliente", "Descripción", "Fecha Egreso", "Última Mantención", "Estado"];
        const rows = filtered.map(item => {
          const isComp = !!item.computador;
          const devName = isComp
            ? item.computador?.nombre_equipo || `PC ID: ${item.computador?.id}`
            : item.equipo?.nombre || `Equipo ID: ${item.equipo?.id || "N/A"}`;
          const devType = isComp ? "Computador" : "Equipo General";
          
          return [
            String(item.id),
            devName,
            devType,
            item.encargado || "N/A",
            item.cliente?.nombre || "N/A",
            item.descripcion || "N/A",
            item.fecha_egreso ? new Date(item.fecha_egreso).toLocaleDateString("es-CL") : "N/A",
            item.fecha_ultima_mantencion ? new Date(item.fecha_ultima_mantencion).toLocaleDateString("es-CL") : "N/A",
            item.estado || "N/A"
          ];
        });

        if (format === "excel") {
          downloadCSV("historial_mantenciones.csv", headers, rows);
        } else if (format === "print") {
          printReport("Historial de Mantenciones", headers, rows, "Bitácora completa de los trabajos de mantención preventivos y correctivos ejecutados.");
        } else {
          await downloadPDFFile("Historial de Mantenciones", headers, rows, "Bitácora completa de los trabajos de mantención preventivos y correctivos ejecutados.");
        }
      } 
      else if (reportId === 4) {
        // --- 4. RESUMEN DE INVENTARIO / ESTADÍSTICAS ---
        const [compRes, eqRes, mntRes] = await Promise.all([
          getComputadores(1, 1000).catch(() => ({ data: [] })),
          getEquipos(1, 1000).catch(() => ({ data: [] })),
          getMantenciones(1, 1000).catch(() => ({ data: [] }))
        ]);

        const comps = compRes.data || [];
        const eqs = eqRes.data || [];
        const mnts = mntRes.data || [];

        const totalComps = comps.length;
        const totalEqs = eqs.length;
        const totalMnt = mnts.length;

        const getCounts = (list: any[]) => {
          let act = 0, bod = 0, rep = 0;
          list.forEach(i => {
            const st = (i.estado || "").toUpperCase();
            if (st === "BODEGA") bod++;
            else if (["REPARACION", "MANTENCION", "EN PROGRESO", "PENDIENTE"].includes(st)) rep++;
            else act++;
          });
          return { act, bod, rep };
        };

        const compStats = getCounts(comps);
        const eqStats = getCounts(eqs);

        const headers = ["Categoría de Activo", "Total Registrado", "En Operación (Activo)", "En Bodega", "En Soporte/Mantención"];
        const rows = [
          ["Computadores", String(totalComps), String(compStats.act), String(compStats.bod), String(compStats.rep)],
          ["Equipos Generales", String(totalEqs), String(eqStats.act), String(eqStats.bod), String(eqStats.rep)],
          ["TOTAL CONSOLIDADO", String(totalComps + totalEqs), String(compStats.act + eqStats.act), String(compStats.bod + eqStats.bod), String(compStats.rep + eqStats.rep)],
          ["Historial de Trabajos", `Total mantenciones: ${totalMnt}`, "-", "-", "-"]
        ];

        if (format === "excel") {
          downloadCSV("resumen_inventario.csv", headers, rows);
        } else if (format === "print") {
          printReport("Resumen Consolidado de Inventario", headers, rows, "Estadísticas globales consolidadas sobre el estado de la infraestructura TI.");
        } else {
          await downloadPDFFile("Resumen Consolidado de Inventario", headers, rows, "Estadísticas globales consolidadas sobre el estado de la infraestructura TI.");
        }
      }

      toast.success("Reporte generado exitosamente");
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al generar el reporte.");
    } finally {
      setGeneratingReportId(null)
      setGeneratingFormat(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Reportes</h1>
          <p className="text-muted-foreground font-normal text-sm">
            Generación y descarga de reportes en tiempo real del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Período de Compra / Egreso</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[200px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoría / Tipo de Equipo</label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger className="w-[200px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Tipo de equipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="desktop">Desktop / Escrito.</SelectItem>
                  <SelectItem value="laptop">Laptop / Notebook</SelectItem>
                  <SelectItem value="monitor">Monitor / Pantalla</SelectItem>
                  <SelectItem value="printer">Impresora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {reportTypes.map((report) => {
          const isGeneratingThis = generatingReportId === report.id;
          
          return (
            <Card key={report.id} className="bg-card border-border hover:border-border/80 transition-colors shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary border border-border">
                      <report.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {report.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frecuencia: {report.lastGenerated}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px] font-normal leading-relaxed">
                  {report.description}
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.id, "print")}
                      disabled={generatingReportId !== null}
                    >
                      {isGeneratingThis && generatingFormat === "print" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="mr-2 h-4 w-4" />
                      )}
                      Imprimir
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleGenerateReport(report.id, "pdf")}
                      disabled={generatingReportId !== null}
                    >
                      {isGeneratingThis && generatingFormat === "pdf" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Descargar PDF
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport(report.id, "excel")}
                    disabled={generatingReportId !== null}
                  >
                    {isGeneratingThis && generatingFormat === "excel" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Descargar Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  )
}
