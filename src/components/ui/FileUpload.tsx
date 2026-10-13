import { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  archivo: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function FileUpload({
  archivo,
  onChange,
  accept = 'image/jpeg,image/png,application/pdf',
  maxSizeMB = 5,
  disabled = false,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera los ${maxSizeMB}MB`);
      return;
    }

    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      setError('Solo se permiten JPG, PNG o PDF');
      return;
    }

    onChange(file);
  };

  const quitarArchivo = () => {
    onChange(null);
    setError(null);
  };

  // Sin archivo: mostrar zona de carga
  if (!archivo) {
    return (
      <div>
        <label
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            disabled
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'
          }`}
        >
          <Upload size={24} className="text-slate-400 mb-2" />
          <p className="text-sm text-slate-600">
            <span className="font-medium text-emerald-600">Sube un archivo</span> o arrástralo
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPG, PNG o PDF — máximo {maxSizeMB}MB
          </p>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />
        </label>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Con archivo: mostrar preview
  const esImagen = archivo.type.startsWith('image/');
  const tamanioMB = (archivo.size / 1024 / 1024).toFixed(2);

  return (
    <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50">
      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        {esImagen ? (
          <ImageIcon size={20} className="text-emerald-600" />
        ) : (
          <FileText size={20} className="text-red-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {archivo.name}
        </p>
        <p className="text-xs text-slate-500">{tamanioMB} MB</p>
      </div>
      <button
        type="button"
        onClick={quitarArchivo}
        disabled={disabled}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Quitar archivo"
      >
        <X size={16} />
      </button>
    </div>
  );
}