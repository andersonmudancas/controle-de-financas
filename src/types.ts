export type TipoLancamento = 'fixo' | 'cartao' | 'receita';

export interface Lancamento {
  id: number;
  idGrupo: number;
  desc: string;
  fornecedor: string;
  categoria: string;
  valor: number;
  tipo: TipoLancamento;
  origem: string; // 'Dinheiro' | 'Entrada' | card name
  vencimento: string; // YYYY-MM-DD
  pago: boolean;
}

export interface Cartao {
  id: string;
  nome: string;
  dia: number;
}

export interface ReceitaExtra {
  id: number;
  descricao: string;
  cliente: string;
  valor: number;
  categoria: string;
  formaPagamento: string;
  data: string; // YYYY-MM-DD
  status: 'pendente' | 'recebido';
}

export interface BackupData {
  lancamentos: Lancamento[];
  cartoes: Cartao[];
  receitasExtra: ReceitaExtra[];
  saldoBaseInicial?: number;
  versao?: string;
  exportadoEm?: string;
}

export const CATEGORIAS_PADRAO = [
  'Combustível',
  'Pedágio',
  'Alimentação',
  'Manutenção',
  'Mercado',
  'Casa',
  'Contas',
  'Cartão',
  'Impostos',
  'Fornecedor',
  'Funcionários',
  'Outros'
] as const;

export const CATEGORIAS_RECEITA = [
  'Serviço / Frete',
  'Mudança',
  'Transporte',
  'Salário / Pró-labore',
  'Vendas',
  'Rendimentos',
  'Outro'
] as const;

export const FORMAS_PAGAMENTO_RECEITA = [
  'Pix',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Transferência',
  'Boleto',
  'Outro'
] as const;
