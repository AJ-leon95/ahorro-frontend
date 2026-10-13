import type { Credito } from '../types/credito';
import type { Cuota } from '../types/cuota';

function formatoMoneda(valor: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(valor);
}

function formatoFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function imprimirTablaAmortizacion(credito: Credito, cuotas: Cuota[]): void {
  // Totales
  const totalCapital = cuotas.reduce((sum, c) => sum + Number(c.montoCapital), 0);
  const totalInteres = cuotas.reduce((sum, c) => sum + Number(c.montoInteres), 0);
  const totalCuotas = cuotas.reduce((sum, c) => sum + Number(c.monto), 0);
  const cuotasPagadas = cuotas.filter((c) => c.estado === 'PAGADA').length;

  // Filas de la tabla
  const filas = cuotas
    .sort((a, b) => a.numero - b.numero)
    .map(
      (c) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${c.numero}</td>
          <td>${formatoFecha(c.fechaVencimiento)}</td>
          <td style="text-align: right;">${formatoMoneda(Number(c.montoCapital))}</td>
          <td style="text-align: right;">${formatoMoneda(Number(c.montoInteres))}</td>
          <td style="text-align: right; font-weight: bold;">${formatoMoneda(Number(c.monto))}</td>
          <td style="text-align: center; font-size: 10px;">${c.estado}</td>
          <td>${c.fechaPago ? formatoFecha(c.fechaPago) : '—'}</td>
        </tr>
      `
    )
    .join('');

  // HTML completo del reporte
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tabla de Amortización - Crédito #${credito.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }
    body {
      padding: 30px;
      color: #1e293b;
      font-size: 12px;
    }
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 3px solid #10b981;
    }
    .header h1 {
      font-size: 22px;
      color: #0f172a;
      margin-bottom: 5px;
    }
    .header h2 {
      font-size: 14px;
      color: #64748b;
      font-weight: normal;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 11px;
      color: #94a3b8;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      color: #0f172a;
      background: #f1f5f9;
      padding: 6px 10px;
      border-left: 4px solid #10b981;
      margin-bottom: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 20px;
    }
    .grid-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .grid-item .label {
      color: #64748b;
    }
    .grid-item .value {
      font-weight: bold;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table th {
      background: #0f172a;
      color: white;
      padding: 8px 6px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
    }
    table th:first-child { text-align: center; }
    table th:nth-child(3),
    table th:nth-child(4),
    table th:nth-child(5) { text-align: right; }
    table th:nth-child(6) { text-align: center; }
    table td {
      padding: 7px 6px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    table tr:nth-child(even) {
      background: #f8fafc;
    }
    table tr:last-child {
      font-weight: bold;
      background: #d1fae5 !important;
      border-top: 2px solid #10b981;
    }
    .totales-row td {
      background: #d1fae5 !important;
      font-weight: bold;
      font-size: 12px;
      padding: 10px 6px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      text-align: center;
    }
    .firmas {
      margin-top: 60px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      padding: 0 40px;
    }
    .firma {
      text-align: center;
      padding-top: 40px;
      border-top: 1px solid #0f172a;
      font-size: 11px;
    }
    @media print {
      body { padding: 15px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="header">
    <h1>CACM UNIDAD FINANCIERA</h1>
    <h2>Tabla de Amortización de Crédito</h2>
    <p>"Ahorro, bienestar y crecimiento"</p>
  </div>

  <!-- DATOS DEL SOCIO -->
  <div class="section">
    <div class="section-title">DATOS DEL SOCIO</div>
    <div class="grid">
      <div class="grid-item">
        <span class="label">Nombre:</span>
        <span class="value">${credito.usuario?.nombre || '—'}</span>
      </div>
      <div class="grid-item">
        <span class="label">Cédula:</span>
        <span class="value">${credito.usuario?.cedula || '—'}</span>
      </div>
      <div class="grid-item">
        <span class="label">Correo:</span>
        <span class="value">${credito.usuario?.correo || '—'}</span>
      </div>
      <div class="grid-item">
        <span class="label">Teléfono:</span>
        <span class="value">${credito.usuario?.telefono || '—'}</span>
      </div>
    </div>
  </div>

  <!-- DATOS DEL CRÉDITO -->
  <div class="section">
    <div class="section-title">DATOS DEL CRÉDITO</div>
    <div class="grid">
      <div class="grid-item">
        <span class="label">N° Crédito:</span>
        <span class="value">#${credito.id}</span>
      </div>
      <div class="grid-item">
        <span class="label">Fecha de inicio:</span>
        <span class="value">${formatoFecha(credito.fechaInicio)}</span>
      </div>
      <div class="grid-item">
        <span class="label">Monto:</span>
        <span class="value">${formatoMoneda(Number(credito.monto))}</span>
      </div>
      <div class="grid-item">
        <span class="label">Interés:</span>
        <span class="value">${credito.interes}% mensual</span>
      </div>
      <div class="grid-item">
        <span class="label">Plazo:</span>
        <span class="value">${credito.plazo} meses</span>
      </div>
      <div class="grid-item">
        <span class="label">Cuota mensual:</span>
        <span class="value">${formatoMoneda(Number(credito.cuotaMensual))}</span>
      </div>
      <div class="grid-item">
        <span class="label">Total a pagar:</span>
        <span class="value">${formatoMoneda(Number(credito.montoTotal))}</span>
      </div>
      <div class="grid-item">
        <span class="label">Estado:</span>
        <span class="value">${credito.estado}</span>
      </div>
    </div>
  </div>

  <!-- TABLA DE AMORTIZACIÓN -->
  <div class="section">
    <div class="section-title">TABLA DE AMORTIZACIÓN</div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Vencimiento</th>
          <th>Capital</th>
          <th>Interés</th>
          <th>Cuota</th>
          <th>Estado</th>
          <th>Fecha pago</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
        <tr class="totales-row">
          <td colspan="2" style="text-align: right;">TOTALES:</td>
          <td style="text-align: right;">${formatoMoneda(totalCapital)}</td>
          <td style="text-align: right;">${formatoMoneda(totalInteres)}</td>
          <td style="text-align: right;">${formatoMoneda(totalCuotas)}</td>
          <td colspan="2" style="text-align: center;">
            ${cuotasPagadas}/${cuotas.length} pagadas
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- FIRMAS -->
  <div class="firmas">
    <div class="firma">
      Firma del Socio
      <br>
      <span style="font-size: 10px;">${credito.usuario?.nombre || ''}</span>
    </div>
    <div class="firma">
      Firma del Administrador
      <br>
      <span style="font-size: 10px;">CACM Unidad Financiera</span>
    </div>
  </div>

  <!-- PIE DE PÁGINA -->
  <div class="footer">
    Documento generado el ${new Date().toLocaleDateString('es-EC')} a las ${new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
    <br>
    CACM Unidad Financiera · Sistema de Ahorros y Créditos
  </div>

</body>
</html>
  `;

  // Abrir ventana nueva y mostrar el HTML
  const ventana = window.open('', '_blank', 'width=900,height=700');
  if (!ventana) {
    alert('Por favor permite las ventanas emergentes para imprimir el reporte.');
    return;
  }

  ventana.document.write(html);
  ventana.document.close();

  // Esperar a que se cargue y llamar a print
  ventana.onload = () => {
    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 250);
  };
}