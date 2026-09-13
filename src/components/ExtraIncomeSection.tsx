import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Coins,
  Hash,
  X,
  Edit2,
  Trash2,
  Check,
  RotateCcw,
  User,
  CreditCard,
  Calendar,
  Layers
} from 'lucide-react';
import { ReceitaExtra, CATEGORIAS_RECEITA, FORMAS_PAGAMENTO_RECEITA } from '../types';
import { formatarMoeda, formatarData, obterDataAtual } from '../utils/formatters';

interface ExtraIncomeSectionProps {
  receitas: ReceitaExtra[];
  mesSelecionado: string;
  onAdicionarReceita: (receita: Omit<ReceitaExtra, 'id'>) => void;
  onEditarReceita: (receita: ReceitaExtra) => void;
  onAlternarStatus: (id: number) => void;
  onExcluirReceita: (id: number) => void;
}

export const ExtraIncomeSection: React.FC<ExtraIncomeSectionProps> = ({
  receitas,
  mesSelecionado,
  onAdicionarReceita,
  onEditarReceita,
  onAlternarStatus,
  onExcluirReceita,
}) => {
  const [formAberto, setFormAberto] = useState(false);
  const [receitaEditando, setReceitaEditando] = useState<ReceitaExtra | null>(null);

  // Form states
  const [descricao, setDescricao] = useState('');
  const [cliente, setCliente] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [data, setData] = useState(obterDataAtual());
  const [status, setStatus] = useState<'pendente' | 'recebido'>('pendente');
  const [erro, setErro] = useState('');

  // Filters
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const abrirNovoForm = () => {
    setReceitaEditando(null);
    setDescricao('');
    setCliente('');
    setValor('');
    setCategoria(CATEGORIAS_RECEITA[0]);
    setFormaPagamento('Pix');
    setData(obterDataAtual());
    setStatus('pendente');
    setErro('');
    setFormAberto(true);
  };

  const iniciarEdicao = (r: ReceitaExtra) => {
    setReceitaEditando(r);
    setDescricao(r.descricao);
    setCliente(r.cliente === '-' ? '' : r.cliente);
    setValor(r.valor.toString());
    setCategoria(r.categoria);
    setFormaPagamento(r.formaPagamento);
    setData(r.data);
    setStatus(r.status);
    setErro('');
    setFormAberto(true);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const valNum = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim()) {
      setErro('Informe a descrição da receita.');
      return;
    }
    if (isNaN(valNum) || valNum <= 0) {
      setErro('Informe um valor válido maior que zero.');
      return;
    }
    if (!data) {
      setErro('Informe a data da receita.');
      return;
    }

    if (receitaEditando) {
      onEditarReceita({
        id: receitaEditando.id,
        descricao: descricao.trim(),
        cliente: cliente.trim() || '-',
        valor: valNum,
        categoria: categoria || 'Outro',
        formaPagamento: formaPagamento || 'Pix',
        data,
        status,
      });
    } else {
      onAdicionarReceita({
        descricao: descricao.trim(),
        cliente: cliente.trim() || '-',
        valor: valNum,
        categoria: categoria || 'Outro',
        formaPagamento: formaPagamento || 'Pix',
        data,
        status,
      });
    }

    setFormAberto(false);
    setReceitaEditando(null);
  };

  // Filtered by selected month, search query and category
  const receitasMes = receitas.filter((r) => r.data.startsWith(mesSelecionado));

  let recOk = 0;
  let recPen = 0;
  receitasMes.forEach((r) => {
    if (r.status === 'recebido') recOk += r.valor;
    else recPen += r.valor;
  });
  const recTotal = recOk + recPen;
  const qtdTotal = receitasMes.length;

  const filtradas = receitasMes.filter((r) => {
    const naCat = !filtroCategoria || r.categoria === filtroCategoria;
    const texto = `${r.descricao} ${r.cliente} ${r.categoria}`.toUpperCase();
    const noBusca = !busca.trim() || texto.includes(busca.trim().toUpperCase());
    return naCat && noBusca;
  });

  return (
    <div id="secao-receitas-extra" className="space-y-4">
      {/* Cabeçalho com Ação */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/70 to-emerald-50/70 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-teal-900 flex items-center gap-2">
            <Coins className="h-5 w-5 text-teal-600" />
            <span>💰 Receitas Extra e Clientes</span>
          </h3>
          <p className="text-xs text-teal-700/80">
            Gerencie fretes adicionais, serviços executados e receitas avulsas com status de pagamento
          </p>
        </div>
        <button
          type="button"
          id="btn-abrir-nova-receita"
          onClick={abrirNovoForm}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>NOVA RECEITA</span>
        </button>
      </div>

      {/* Mini-Cards Relatório de Receitas */}
      <div
        id="receita-relatorio"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center">
          <span className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recebidas
          </span>
          <strong id="receitas-ok" className="block text-lg font-extrabold text-slate-800 mt-1">
            {formatarMoeda(recOk)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center">
          <span className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-amber-600">
            <Clock className="h-3.5 w-3.5" /> Pendentes
          </span>
          <strong id="receitas-pendentes" className="block text-lg font-extrabold text-slate-800 mt-1">
            {formatarMoeda(recPen)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center">
          <span className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-teal-600">
            <Coins className="h-3.5 w-3.5" /> Total Extra
          </span>
          <strong id="receitas-total" className="block text-lg font-extrabold text-slate-800 mt-1">
            {formatarMoeda(recTotal)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-center">
          <span className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase text-slate-500">
            <Hash className="h-3.5 w-3.5" /> Quantidade
          </span>
          <strong id="receitas-qtd" className="block text-lg font-extrabold text-slate-800 mt-1">
            {qtdTotal}
          </strong>
        </div>
      </div>

      {/* Formulário de Receita (Quando Aberto) */}
      {formAberto && (
        <div
          id="formReceita"
          className="rounded-2xl border border-teal-200 bg-white p-5 shadow-md"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
            <h4 id="tituloReceita" className="text-sm font-bold text-teal-900">
              {receitaEditando ? '✏️ Editando Receita' : '➕ Cadastrar Nova Receita'}
            </h4>
            <button
              type="button"
              onClick={() => setFormAberto(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {erro && (
            <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs font-semibold text-rose-700">
              {erro}
            </div>
          )}

          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  id="recDescricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Frete Mudança, Entrega..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Cliente / Contratante
                </label>
                <input
                  type="text"
                  id="recCliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Valor R$
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="recValor"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Categoria
                </label>
                <select
                  id="recCategoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {CATEGORIAS_RECEITA.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  id="recFormaPagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {FORMAS_PAGAMENTO_RECEITA.map((forma) => (
                    <option key={forma} value={forma}>
                      {forma}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="recData"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Status
                </label>
                <select
                  id="recStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'pendente' | 'recebido')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="pendente">🔴 Pendente (A Receber)</option>
                  <option value="recebido">✅ Recebido (Quitado)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                id="btn-cancelar-receita"
                onClick={() => setFormAberto(false)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                id="btn-salvar-receita"
                className="rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors"
              >
                {receitaEditando ? 'SALVAR ALTERAÇÕES' : 'SALVAR RECEITA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar de Busca e Filtro de Receitas */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            id="buscaReceita"
            placeholder="🔎 Buscar descrição, cliente ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <select
          id="filtroCategoriaReceita"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:w-56"
        >
          <option value="">Todas as categorias</option>
          {CATEGORIAS_RECEITA.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Receitas Extra */}
      <div
        id="tabela-receitas-container"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-4 pr-2">Status</th>
                <th className="py-3.5 px-3">Descrição</th>
                <th className="py-3.5 px-3">Cliente</th>
                <th className="py-3.5 px-3">Categoria</th>
                <th className="py-3.5 px-3">Pagamento</th>
                <th className="py-3.5 px-3">Valor</th>
                <th className="py-3.5 px-3">Data</th>
                <th className="py-3.5 pl-3 pr-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                    Nenhuma receita encontrada para os filtros selecionados neste mês.
                  </td>
                </tr>
              ) : (
                filtradas.map((r, index) => {
                  const isRecebido = r.status === 'recebido';
                  return (
                    <tr
                      key={r.id ?? `receita-${index}`}
                      className={`transition-colors ${
                        isRecebido
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                          : 'bg-rose-50/40 hover:bg-rose-50/70'
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                            isRecebido
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {isRecebido ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-rose-600" />
                          )}
                          {isRecebido ? 'RECEBIDO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">{r.descricao}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{r.cliente}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {r.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{r.formaPagamento}</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-700 whitespace-nowrap">
                        +{formatarMoeda(r.valor)}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {formatarData(r.data)}
                      </td>
                      <td className="py-3 pl-3 pr-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onAlternarStatus(r.id)}
                            title={isRecebido ? 'Marcar como Pendente' : 'Marcar como Recebido'}
                            className={`rounded-lg p-1.5 transition-all shadow-sm ${
                              isRecebido
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {isRecebido ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => iniciarEdicao(r)}
                            title="Editar Receita"
                            className="rounded-lg bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100 transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onExcluirReceita(r.id)}
                            title="Excluir Receita"
                            className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
