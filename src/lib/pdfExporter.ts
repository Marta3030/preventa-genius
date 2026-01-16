import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SignatureData {
  employee?: {
    name?: string;
    rut?: string;
    area?: string;
    position?: string;
  };
  status: string;
  signed_at?: string;
  signature_method?: string;
}

interface SignatureStats {
  total: number;
  signed: number;
  pending: number;
  byArea: { area: string; signed: number; pending: number }[];
  byDocument: { title: string; signed: number; pending: number; total: number }[];
}

const areaLabels: Record<string, string> = {
  gerencia: "Gerencia",
  rrhh: "RRHH",
  reclutamiento: "Reclutamiento",
  prevencion: "Prevención",
  operaciones: "Operaciones",
  comite_paritario: "Comité Paritario",
};

// Format area name
function formatArea(area: string): string {
  return areaLabels[area] || area?.replace("_", " ") || "Sin área";
}

// Export signature report for a single document
export async function exportSignaturePDF(
  documentTitle: string,
  signatures: SignatureData[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("Reporte de Firmas", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(documentTitle, pageWidth / 2, 35, { align: "center" });

  // Summary section
  const totalSignatures = signatures.length;
  const signedCount = signatures.filter((s) => s.status === "signed").length;
  const pendingCount = totalSignatures - signedCount;
  const completionRate =
    totalSignatures > 0 ? Math.round((signedCount / totalSignatures) * 100) : 0;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  // Summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, pageWidth - 28, 30, 3, 3, "F");

  doc.setFontSize(11);
  doc.text("Resumen de Campaña", 20, 55);

  doc.setFontSize(10);
  const summaryY = 65;
  doc.text(`Total Firmas: ${totalSignatures}`, 20, summaryY);
  doc.text(`Firmadas: ${signedCount}`, 70, summaryY);
  doc.text(`Pendientes: ${pendingCount}`, 120, summaryY);
  doc.text(`Tasa: ${completionRate}%`, 170, summaryY);

  // Table with signatures
  const tableData = signatures.map((sig) => [
    sig.employee?.name || "—",
    sig.employee?.rut || "—",
    formatArea(sig.employee?.area || ""),
    sig.employee?.position || "—",
    sig.status === "signed" ? "Firmado" : "Pendiente",
    sig.signed_at ? format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm") : "—",
  ]);

  autoTable(doc, {
    startY: 85,
    head: [["Nombre", "RUT", "Área", "Cargo", "Estado", "Fecha Firma"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 28 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22 },
      5: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generado el ${format(now, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    })}`,
    14,
    finalY + 15
  );

  // Save PDF
  const fileName = `firmas_${documentTitle.replace(/\s+/g, "_")}_${format(
    now,
    "yyyyMMdd"
  )}.pdf`;
  doc.save(fileName);
}

// Export general signature statistics report
export async function exportSignatureStatsPDF(
  stats: SignatureStats
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("Reporte Ejecutivo de Firmas", pageWidth / 2, 25, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generado el ${format(now, "dd 'de' MMMM 'de' yyyy", { locale: es })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // KPI Summary Cards
  const completionRate =
    stats.total > 0 ? Math.round((stats.signed / stats.total) * 100) : 0;
  const cardY = 50;
  const cardWidth = 42;
  const cardHeight = 30;
  const gap = 5;
  const startX = 14;

  const kpis = [
    { label: "Total Firmas", value: stats.total.toString(), color: [59, 130, 246] },
    { label: "Firmadas", value: stats.signed.toString(), color: [34, 197, 94] },
    { label: "Pendientes", value: stats.pending.toString(), color: [234, 179, 8] },
    { label: "Cumplimiento", value: `${completionRate}%`, color: [99, 102, 241] },
  ];

  kpis.forEach((kpi, idx) => {
    const x = startX + idx * (cardWidth + gap);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "F");

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + cardWidth / 2, cardY + 10, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + cardWidth / 2, cardY + 23, { align: "center" });
  });

  // Table: Firmas por Área
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Firmas por Área", 14, 100);

  const areaData = stats.byArea.map((area) => {
    const total = area.signed + area.pending;
    const rate = total > 0 ? Math.round((area.signed / total) * 100) : 0;
    return [area.area, area.signed.toString(), area.pending.toString(), `${rate}%`];
  });

  autoTable(doc, {
    startY: 105,
    head: [["Área", "Firmadas", "Pendientes", "% Cumplimiento"]],
    body: areaData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
    tableWidth: (pageWidth - 28) / 2 - 5,
  });

  // Table: Top Documentos
  const areaTableFinalY = (doc as any).lastAutoTable?.finalY || 130;
  
  if (stats.byDocument.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Top Documentos", 14, areaTableFinalY + 15);

    const docData = stats.byDocument.map((d) => {
      const rate = d.total > 0 ? Math.round((d.signed / d.total) * 100) : 0;
      return [
        d.title.length > 35 ? d.title.substring(0, 35) + "..." : d.title,
        d.signed.toString(),
        d.pending.toString(),
        `${rate}%`,
      ];
    });

    autoTable(doc, {
      startY: areaTableFinalY + 20,
      head: [["Documento", "Firmadas", "Pendientes", "% Cumplimiento"]],
      body: docData,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Sistema de Gestión de Seguridad • ${format(now, "dd/MM/yyyy HH:mm")}`,
    14,
    finalY + 15
  );

  // Save PDF
  const fileName = `reporte_firmas_${format(now, "yyyyMMdd_HHmm")}.pdf`;
  doc.save(fileName);
}

// Export document with signatures for DT registration
export async function exportDTPackagePDF(
  documentData: {
    title: string;
    version: number;
    file_hash?: string;
    effective_date?: string;
    expiry_date?: string;
  },
  signatures: SignatureData[]
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text("Paquete de Registro DT", pageWidth / 2, 25, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text(documentData.title, pageWidth / 2, 35, { align: "center" });

  // Document metadata
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 45, pageWidth - 28, 40, 3, 3, "F");

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Información del Documento", 20, 55);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Versión: ${documentData.version}`, 20, 65);
  doc.text(
    `Fecha Efectiva: ${
      documentData.effective_date
        ? format(new Date(documentData.effective_date), "dd/MM/yyyy")
        : "—"
    }`,
    70,
    65
  );
  doc.text(
    `Vencimiento: ${
      documentData.expiry_date
        ? format(new Date(documentData.expiry_date), "dd/MM/yyyy")
        : "—"
    }`,
    130,
    65
  );

  if (documentData.file_hash) {
    doc.setFontSize(8);
    doc.text(`Hash SHA-256: ${documentData.file_hash}`, 20, 78);
  }

  // Signatures summary
  const signedSignatures = signatures.filter((s) => s.status === "signed");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Firmas Registradas: ${signedSignatures.length} de ${signatures.length}`,
    14,
    100
  );

  // Signatures table
  const tableData = signedSignatures.map((sig) => [
    sig.employee?.name || "—",
    sig.employee?.rut || "—",
    formatArea(sig.employee?.area || ""),
    sig.employee?.position || "—",
    sig.signed_at ? format(new Date(sig.signed_at), "dd/MM/yyyy HH:mm") : "—",
    sig.signature_method || "in_app",
  ]);

  autoTable(doc, {
    startY: 105,
    head: [["Nombre", "RUT", "Área", "Cargo", "Fecha Firma", "Método"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Footer with hash and date
  const finalY = (doc as any).lastAutoTable?.finalY || 200;
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Documento generado para registro ante la Dirección del Trabajo`,
    14,
    finalY + 12
  );
  doc.text(
    `Fecha de exportación: ${format(now, "dd/MM/yyyy HH:mm:ss")}`,
    14,
    finalY + 18
  );

  // Save PDF
  const fileName = `paquete_dt_${documentData.title.replace(/\s+/g, "_")}_${format(
    now,
    "yyyyMMdd"
  )}.pdf`;
  doc.save(fileName);
}
