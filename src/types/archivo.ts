export type TipoArchivo = 'JPG' | 'PNG' | 'PDF';

export interface Archivo {
  id: number;
  nombre: string;
  ruta: string;
  tipoArchivo: TipoArchivo;
  tamanio: number;
  fechaSubida: string;
}