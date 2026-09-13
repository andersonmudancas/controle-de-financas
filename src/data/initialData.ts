import { Cartao, Lancamento, ReceitaExtra } from '../types';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const prevMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, '0');
const prevYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;

export const INITIAL_CARTOES: Cartao[] = [
  { id: '1', nome: 'NUBANK', dia: 10 },
  { id: '2', nome: 'INTER', dia: 20 },
];

export const INITIAL_LANCAMENTOS: Lancamento[] = [
  {
    id: 1,
    idGrupo: 101,
    desc: 'Abastecimento Caminhão',
    fornecedor: 'Posto Shell BR',
    categoria: 'Combustível',
    valor: 450.00,
    tipo: 'fixo',
    origem: 'Dinheiro',
    vencimento: `${currentYear}-${currentMonth}-05`,
    pago: true,
  },
  {
    id: 2,
    idGrupo: 102,
    desc: 'Pedágio Rodovia SP-330',
    fornecedor: 'AutoBAn',
    categoria: 'Pedágio',
    valor: 68.40,
    tipo: 'cartao',
    origem: 'NUBANK',
    vencimento: `${currentYear}-${currentMonth}-10`,
    pago: true,
  },
  {
    id: 3,
    idGrupo: 103,
    desc: 'Troca de Óleo e Filtros',
    fornecedor: 'Oficina Mecânica São José',
    categoria: 'Manutenção',
    valor: 820.00,
    tipo: 'cartao',
    origem: 'NUBANK',
    vencimento: `${currentYear}-${currentMonth}-10`,
    pago: false,
  },
  {
    id: 4,
    idGrupo: 104,
    desc: 'Almoço Equipe na Estrada',
    fornecedor: 'Restaurante do Gaúcho',
    categoria: 'Alimentação',
    valor: 135.50,
    tipo: 'cartao',
    origem: 'INTER',
    vencimento: `${currentYear}-${currentMonth}-20`,
    pago: false,
  },
  {
    id: 5,
    idGrupo: 105,
    desc: 'Recebimento Frete Carga Fracionada',
    fornecedor: 'Logística Express',
    categoria: 'Outros',
    valor: 3200.00,
    tipo: 'receita',
    origem: 'Entrada',
    vencimento: `${currentYear}-${currentMonth}-08`,
    pago: true,
  },
  {
    id: 6,
    idGrupo: 106,
    desc: 'Contrato Transporte Mensal (Pendente)',
    fornecedor: 'Distribuidora Aliança',
    categoria: 'Outros',
    valor: 2500.00,
    tipo: 'receita',
    origem: 'Entrada',
    vencimento: `${currentYear}-${currentMonth}-25`,
    pago: false,
  }
];

export const INITIAL_RECEITAS: ReceitaExtra[] = [
  {
    id: 201,
    descricao: 'Frete Mudança Residencial',
    cliente: 'Carlos Eduardo Santos',
    valor: 1400.00,
    categoria: 'Mudança',
    formaPagamento: 'Pix',
    data: `${currentYear}-${currentMonth}-07`,
    status: 'recebido',
  },
  {
    id: 202,
    descricao: 'Transporte de Encomenda Urgente',
    cliente: 'Farmácia Central',
    valor: 350.00,
    categoria: 'Transporte',
    formaPagamento: 'Pix',
    data: `${currentYear}-${currentMonth}-18`,
    status: 'pendente',
  }
];
