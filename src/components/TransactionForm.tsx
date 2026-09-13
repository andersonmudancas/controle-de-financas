import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Edit3,
  X,
  CreditCard,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  Layers
} from 'lucide-react';
import { Cartao, Lancamento, TipoLancamento, CATEGORIAS_PADRAO } from '../types';
import { obterDataAtual } from '../utils/formatters';

interface TransactionFormProps {
  cartoes: Cartao[];
  itemEditando: Lancamento | null;
  onSalvarLancamento: (dados: {
    desc: string;
    fornecedor: string;
    categoria: string;
    valorTotal: number;
    tipo: TipoLancamento;
    cartaoNome?: string;
    parcelas: number;
    dataBase: string;
    statusPago: boolean;
    alterarTodosGrupo?: boolean;
  }) => void;
  onCancelarEdicao: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  cartoes,
  itemEditando,
  onSalvarLancamento,
  onCancelarEdicao,
}) => {
  const [desc, setDesc] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TipoLancamento>('fixo');
  const [selectCartao, setSelectCartao] = useState('');
  const [parcelas, setParcelas] = useState<number>(1);
  const [dataBase, setDataBase] = useState(obterDataAtual());
  const [statusPago, setStatusPago] = useState(true);
  const [alterarTodasParcelas, setAlterarTodasParcelas] = useState(false);
  const [erro, setErro] = useState('');

  // Sync state if editing
  useEffect(() => {
    if (itemEditando) {
      setDesc(itemEditando.desc.replace(/\s*\(\d+\/\d+\)$/, ''));
      setFornecedor(itemEditando.fornecedor || '');
      setCategoria(itemEditando.categoria || '');
      setValor(itemEditando.valor.toString());
      setTipo(itemEditando.tipo);
      if (itemEditando.tipo === 'cartao') {
        setSelectCartao(itemEditando.origem);
      }
      setDataBase(itemEditando.vencimento);
      setStatusPago(itemEditando.pago);
      setParcelas(1);
    } else {
      setDesc('');
      setFornecedor('');
      setCategoria('');
      setValor('');
      setTipo('fixo');
      setSelectCartao(cartoes[0]?.nome || '');
      setParcelas(1);
      setDataBase(obterDataAtual());
      setStatusPago(true);
      setAlterarTodasParcelas(false);
    }
  }, [itemEditando, cartoes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const trimmedDesc = desc.trim();
    const trimmedFornecedor = fornecedor.trim();
    const valNum = parseFloat(valor.replace(',', '.'));

    if (!trimmedDesc) {
      setErro('Informe a descrição do lançamento.');
      return;
    }
    if (!trimmedFornecedor) {
      setErro('Informe o fornecedor ou estabelecimento.');
      return;
    }
    if (!categoria) {
      setErro('Selecione uma categoria.');
      return;
    }
    if (isNaN(valNum) || valNum <= 0) {
      setErro('Informe um valor monetário válido maior que zero.');
      return;
    }
    if (!dataBase) {
      setErro('Informe a data de vencimento ou base.');
      return;
    }
    if (tipo === 'cartao' && !selectCartao) {
      setErro('Selecione o cartão de crédito.');
      return;
    }

    onSalvarLancamento({
      desc: trimmedDesc,
      fornecedor: trimmedFornecedor,
      categoria,
      valorTotal: valNum,
      tipo,
      cartaoNome: selectCartao,
      parcelas: itemEditando ? 1 : Math.max(1, parcelas),
      dataBase,
      statusPago: tipo === 'receita' ? true : statusPago,
      alterarTodosGrupo: itemEditando ? alterarTodasParcelas : false,
    });

    if (!itemEditando) {
      setDesc('');
      setFornecedor('');
      setValor('');
      setParcelas(1);
      setStatusPago(true);
    }
  };

  return (
    <div
      id="secao-formulario-lancamento"
      className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h3
            id="titulo-form"
            className="text-base font-bold text-slate-800 flex items-center gap-2"
          >
            {itemEditando ? (
              <>
                <Edit3 className="h-4 w-4 text-blue-600" />
                <span>✏️ Editando Lançamento</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 text-emerald-600" />
                <span>📝 Novo Lançamento</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre despesas, receitas ou compras parceladas no cartão
          </p>
        </div>
        {itemEditando && (
          <button
            type="button"
            id="btn-cancelar-edicao"
            onClick={onCancelarEdicao}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      {erro && (
        <div
          id="alerta-erro-form"
          className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700"
        >
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Descrição */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Descrição
            </label>
            <input
              type="text"
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex: Abastecimento, Supermercado..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Fornecedor */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Fornecedor / Loja
            </label>
            <div className="relative">
              <input
                type="text"
                id="fornecedor"
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                placeholder="Ex: Posto Ipiranga, Assaí..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Categoria
            </label>
            <select
              id="categoriaLancamento"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">📂 Selecione Categoria</option>
              {CATEGORIAS_PADRAO.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Valor R$
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Tipo de Pagamento */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Forma de Pagamento
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoLancamento)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="fixo">💵 Dinheiro / Pix</option>
              <option value="cartao">💳 Cartão de Crédito</option>
              <option value="receita">💰 Receita (Ganho)</option>
            </select>
          </div>

          {/* Selecionar Cartão (se for cartão) */}
          {tipo === 'cartao' && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-purple-700 mb-1">
                Qual Cartão?
              </label>
              <select
                id="selectCartao"
                value={selectCartao}
                onChange={(e) => setSelectCartao(e.target.value)}
                className="w-full rounded-xl border border-purple-300 bg-purple-50/30 px-3 py-2 text-xs font-bold text-purple-900 focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="">💳 Selecione o cartão</option>
                {cartoes.map((c, index) => (
                  <option key={c.id || `form-cartao-${c.nome}-${index}`} value={c.nome}>
                    {c.nome} (Vence dia {c.dia})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Parcelas */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Parcelas
            </label>
            <input
              type="number"
              min={1}
              max={60}
              id="parcelas"
              value={parcelas}
              onChange={(e) => setParcelas(parseInt(e.target.value, 10) || 1)}
              disabled={!!itemEditando}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Data Base / Vencimento */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Data / Vencimento
            </label>
            <input
              type="date"
              id="dataBase"
              value={dataBase}
              onChange={(e) => setDataBase(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Status de Pagamento & Ações */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 pl-2">Status Inicial:</span>
              <button
                type="button"
                id="btn-status-pago"
                onClick={() => setStatusPago(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  statusPago
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                ✅ Pago
              </button>
              <button
                type="button"
                id="btn-status-pendente"
                onClick={() => setStatusPago(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  !statusPago
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                🔴 Pendente
              </button>
            </div>

            {itemEditando && (
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 ml-2">
                <input
                  type="checkbox"
                  checked={alterarTodasParcelas}
                  onChange={(e) => setAlterarTodasParcelas(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Aplicar a todas as parcelas deste grupo</span>
              </label>
            )}
          </div>

          <button
            type="submit"
            id="btn-salvar"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg hover:shadow-emerald-600/30 active:scale-95"
          >
            {itemEditando ? 'SALVAR ALTERAÇÕES' : 'LANÇAR NOVO GASTO'}
          </button>
        </div>
      </form>
    </div>
  );
};
