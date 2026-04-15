// src/components/client/DocumentosTab.tsx
import { FileX } from 'lucide-react';
import { DOC_TYPES } from '../../lib/store/core';
import type { DocumentoDisplayItem } from './DocumentoViewer';
import { DocumentoCard } from './DocumentoCard';

interface Props {
  client: any;
  onDocumentoClick: (doc: DocumentoDisplayItem) => void;
}

function calcularStatus(dataValidade?: string | null): DocumentoDisplayItem['status'] {
  if (!dataValidade) return 'unknown';
  const expiry = new Date(dataValidade);
  if (isNaN(expiry.getTime())) return 'unknown';
  const now = new Date();
  const dias = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0) return 'expired';
  if (dias <= 30) return 'expiring';
  return 'valid';
}

function mapearClienteParaDocumentos(client: any): DocumentoDisplayItem[] {
  const docs: DocumentoDisplayItem[] = [];

  if (client?.doc_type || client?.passport_number) {
    const tipoMeta = DOC_TYPES.find(d => d.value === client.doc_type);
    const tipoLabel = tipoMeta
      ? tipoMeta.label
      : (client.doc_type || 'Documento de Identidade');

    docs.push({
      id: client.doc_type || 'identity',
      tipo: tipoLabel,
      numero: client.passport_number || undefined,
      emissao: client.passport_issued || undefined,
      validade: client.passport_expires || undefined,
      status: calcularStatus(client.passport_expires),
      imagem: client.doc_url || null,
      imagemVerso: client.doc_back_url || null,
    });
  }

  return docs;
}

export function DocumentosTab({ client, onDocumentoClick }: Props) {
  const documentos = mapearClienteParaDocumentos(client);

  if (!documentos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
          <FileX className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-['Playfair_Display'] font-bold text-[#1a2b4a]">
            Nenhum documento registado
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-[220px] leading-relaxed">
            Os seus documentos aparecerão aqui após o registo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-[#c9a96e] uppercase tracking-[0.15em] mb-3">
        {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'} registados
      </p>
      {documentos.map(doc => (
        <DocumentoCard
          key={doc.id}
          doc={doc}
          onClick={() => onDocumentoClick(doc)}
        />
      ))}
    </div>
  );
}
