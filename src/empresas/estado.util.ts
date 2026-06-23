export type EstadoColorKey =
  | 'success'
  | 'destructive'
  | 'info'
  | 'warning'
  | 'neutral'
  | 'muted';

export interface EstadoClasificado {
  label: string;
  colorKey: EstadoColorKey;
}

export function clasificarEstado(raw: string): EstadoClasificado {
  const texto = raw.toLowerCase();
  if (raw.includes('✅')) return { label: 'Enviada', colorKey: 'success' };
  if (raw.includes('❌'))
    return { label: 'No enviada', colorKey: 'destructive' };
  if (raw.includes('📋') || texto.includes('permiso')) {
    return { label: 'Permiso autorizado', colorKey: 'info' };
  }
  if (texto.includes('licencia')) {
    return { label: 'Licencia médica', colorKey: 'neutral' };
  }
  if (texto.includes('pendiente')) {
    return { label: 'Pendiente', colorKey: 'warning' };
  }
  return { label: raw.replace(/[✅❌📋]/gu, '').trim(), colorKey: 'muted' };
}
