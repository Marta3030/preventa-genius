-- Add new document types to the enum
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'política_sst';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'iper';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'pise';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'protocolo';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'auditoria';
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'procedimiento_seguro';