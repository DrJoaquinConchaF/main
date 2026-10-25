import fields from './fields.json' with {type:'json'};
const statuses = new Set(fields.historyStatuses);
export function historyForReservo(history) {
  const parts = [];
  for (const field of fields.history) {
    const entry = history[field.id];
    if (!entry) continue;
    if (!statuses.has(entry.status)) throw new Error('Estado de antecedente desconocido.');
    const detail = typeof entry.text === 'string' ? entry.text.trim() : '';
    const text = entry.status === 'none' ? 'Niega' : entry.status === 'unknown' ? 'Desconoce' : entry.status === 'prefers_discussion' ? 'Por conversar' : entry.status === 'reported' ? detail : '';
    if (entry.status === 'reported' && !detail) throw new Error('Completa el antecedente informado.');
    if (text) parts.push(`${field.abbreviation}: ${text}`);
  }
  const text = parts.join('; '), count = [...text].length;
  return {text, count, limit:400, fits:count <= 400, remaining:400 - count};
}
export function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const d = new Date(date+'T12:00:00Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === date;
}
export function recommendedNextVisit(date, days = 42) {
  if (!validDate(date) || !Number.isInteger(days) || days < 1) throw new Error('Fecha o intervalo inválido.');
  return new Date(Date.parse(date+'T12:00:00Z') + days * 86400000).toISOString().slice(0,10);
}
export function validateVisit(visit) {
  if (!validDate(visit.date)) return 'Fecha de atención inválida.';
  if (!['initial','control'].includes(visit.type)) return 'Tipo de atención inválido.';
  if (!['in_person','online'].includes(visit.modality)) return 'Modalidad inválida.';
  if (visit.adherencePercent != null && (typeof visit.adherencePercent !== 'number' || !Number.isFinite(visit.adherencePercent) || visit.adherencePercent < 0 || visit.adherencePercent > 100)) return 'La adherencia debe estar entre 0 y 100.';
  if (visit.stress1to10 != null && (typeof visit.stress1to10 !== 'number' || !Number.isFinite(visit.stress1to10) || visit.stress1to10 < 1 || visit.stress1to10 > 10)) return 'El estrés debe estar entre 1 y 10.';
  if (visit.recommendedNextVisit && (!validDate(visit.recommendedNextVisit) || visit.recommendedNextVisit <= visit.date)) return 'El próximo control debe ser posterior a esta atención.';
  return null;
}
/** Explicitly composing stored professional text; does not invent dose, frequency or duration. */
export function composeTemplates(templates, selectedIds, context) {
  const byId = new Map(templates.map(t=>[t.id,t]));
  const selected = [...new Set(selectedIds)].map(id => {
    if (!byId.has(id)) throw new Error('Plantilla no encontrada.');
    return byId.get(id);
  });
  const substitute = text => text.replace(/\{\{(paciente|rut|fecha)\}\}/g,(_,key)=>String(context[key] ?? ''));
  const prescription = selected.filter(t=>t.category === 'prescription').map(t=>substitute(t.text)).join('\n\n');
  const exams = selected.filter(t=>t.category === 'exam_order').flatMap(t=>substitute(t.text).split('\n')).map(line=>line.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  const seen = new Set(), unique = exams.filter(exam=>{
    const key = exam.normalize('NFC').toLocaleLowerCase('es');
    if (seen.has(key)) return false;
    seen.add(key);return true;
  });
  return {prescription, examOrder:unique.map((e,i)=>`${i+1}. ${e}`).join('\n'), sourceTemplateIds:selected.map(t=>t.id)};
}
