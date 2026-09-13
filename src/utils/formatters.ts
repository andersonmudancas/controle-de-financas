export function formatarMoeda(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return 'R$ 0,00';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(dataIso: string): string {
  if (!dataIso) return '-';
  const parts = dataIso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataIso;
}

export function obterMesAtual(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function obterDataAtual(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function obterMesAnterior(mesIso: string): string {
  if (!mesIso || !mesIso.includes('-')) return mesIso;
  const parts = mesIso.split('-');
  const ano = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  if (mes <= 1) {
    return `${ano - 1}-12`;
  }
  return `${ano}-${String(mes - 1).padStart(2, '0')}`;
}

export function obterProximoMes(mesIso: string): string {
  if (!mesIso || !mesIso.includes('-')) return mesIso;
  const parts = mesIso.split('-');
  const ano = parseInt(parts[0], 10);
  const mes = parseInt(parts[1], 10);
  if (mes >= 12) {
    return `${ano + 1}-01`;
  }
  return `${ano}-${String(mes + 1).padStart(2, '0')}`;
}

export function formatarNomeMes(mesIso: string, abreviado: boolean = false): string {
  if (!mesIso || !mesIso.includes('-')) return mesIso;
  const parts = mesIso.split('-');
  const ano = parts[0];
  const mes = parseInt(parts[1], 10);
  const mesesCompletos = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mesesAbrev = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  const idx = mes - 1;
  if (idx < 0 || idx > 11) return mesIso;
  if (abreviado) {
    return `${mesesAbrev[idx]}/${ano.slice(-2)}`;
  }
  return `${mesesCompletos[idx]} de ${ano}`;
}
