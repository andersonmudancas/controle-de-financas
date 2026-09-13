import React, { useState } from 'react';
import { CreditCard, CheckCheck, Plus, Trash2, Calendar } from 'lucide-react';
import { Cartao, Lancamento } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface CardsBarProps {
  cartoes: Cartao[];
  lancamentos: Lancamento[];
  mesSelecionado: string;
  cartaoFiltro: string;
  onSelectCartao: (nomeCartao: string) => void;
  onQuitarCartao: (nomeCartao: string) => void;
  onAdicionarCartao: (nome: string, dia: number) => void;
  onExcluirCartao: (id: string, nome: string) => void;
}

export const CardsBar: React.FC<CardsBarProps> = ({
  cartoes,
  lancamentos,
  mesSelecionado,
  cartaoFiltro,
  onSelectCartao,
  onQuitarCartao,
  onAdicionarCartao,
  onExcluirCartao,
}) => {
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoDia, setNovoDia] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoDia.trim()) {
      setErro('Preencha o nome do cartão e o dia de vencimento.');
      return;
    }
    const diaNum = parseInt(novoDia, 10);
    if (isNaN(diaNum) || diaNum < 1 || diaNum > 31) {
      setErro('O dia de vencimento deve ser entre 1 e 31.');
      return;
    }

    onAdicionarCartao(novoNome.trim().toUpperCase(), diaNum);
    setNovoNome('');
    setNovoDia('');
    setErro('');
    setModalAberto(false);
  };

  return (
    <div id="secao-cartoes" className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-purple-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Faturas e Cartões de Crédito
          </h3>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
            {cartoes.length} ativos
          </span>
        </div>
        <button
          type="button"
          id="btn-novo-cartao-modal"
          onClick={() => setModalAberto(!modalAberto)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Configurar Cartão</span>
        </button>
      </div>

      {modalAberto && (
        <div
          id="form-novo-cartao"
          className="mb-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4 shadow-sm"
        >
          <h4 className="text-xs font-bold uppercase text-purple-900 mb-2">
            ⚙️ Cadastrar Novo Cartão
          </h4>
          <form onSubmit={handleCadastrar} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              id="nomeCartaoInput"
              placeholder="Nome do cartão (ex: Nubank, Inter)"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <input
              type="number"
              id="vencimentoCartaoInput"
              placeholder="Dia do Vencimento (1 a 31)"
              min={1}
              max={31}
              value={novoDia}
              onChange={(e) => setNovoDia(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                id="btn-salvar-cartao"
                className="flex-1 rounded-lg bg-purple-700 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition-colors"
              >
                SALVAR
              </button>
              <button
                type="button"
                onClick={() => setModalAberto(false)}
                className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300"
              >
                Cancelar
              </button>
            </div>
          </form>
          {erro && <p className="mt-2 text-xs font-medium text-rose-600">{erro}</p>}
        </div>
      )}

      {cartoes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 bg-white/60">
          Nenhum cartão cadastrado ainda. Clique em "Configurar Cartão" acima para adicionar seu primeiro cartão.
        </div>
      ) : (
        <div
          id="dash-cartoes"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {cartoes.map((cartao, index) => {
            const lancamentosCartaoMes = lancamentos.filter(
              (l) => l.origem === cartao.nome && l.vencimento.startsWith(mesSelecionado)
            );
            const totalFatura = lancamentosCartaoMes.reduce((acc, l) => acc + l.valor, 0);
            const pendenteFatura = lancamentosCartaoMes
              .filter((l) => !l.pago)
              .reduce((acc, l) => acc + l.valor, 0);
            const isFiltroAtivo = cartaoFiltro === cartao.nome;

            return (
              <div
                key={cartao.id || `card-${cartao.nome}-${index}`}
                id={`card-cartao-${cartao.nome.toLowerCase()}`}
                onClick={() => onSelectCartao(isFiltroAtivo ? 'tudo' : cartao.nome)}
                className={`group relative flex flex-col justify-between rounded-xl p-3.5 transition-all cursor-pointer ${
                  isFiltroAtivo
                    ? 'bg-purple-800 text-white shadow-lg ring-2 ring-purple-400 ring-offset-2'
                    : 'bg-gradient-to-br from-purple-700 to-purple-800 text-white shadow-md shadow-purple-950/15 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-900/25'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide">
                      <CreditCard className="h-3.5 w-3.5 text-purple-200" />
                      {cartao.nome}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-purple-200 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>Vence dia {cartao.dia}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExcluirCartao(cartao.id, cartao.nome);
                    }}
                    title="Excluir cartão"
                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-purple-300 hover:bg-purple-900/50 hover:text-white transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="my-2.5">
                  <div className="text-[10px] uppercase font-semibold text-purple-200/80">
                    Fatura {mesSelecionado}
                  </div>
                  <div className="text-lg font-extrabold tracking-tight">
                    {formatarMoeda(totalFatura)}
                  </div>
                  <div className="text-[11px] font-medium text-purple-200">
                    Pendente: <strong className="text-white">{formatarMoeda(pendenteFatura)}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-600/50 flex items-center justify-between">
                  {pendenteFatura > 0 ? (
                    <button
                      type="button"
                      id={`btn-quitar-${cartao.nome.toLowerCase()}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuitarCartao(cartao.nome);
                      }}
                      className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:shadow active:scale-95 flex items-center justify-center gap-1"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Quitar Fatura</span>
                    </button>
                  ) : totalFatura > 0 ? (
                    <span className="w-full text-center text-[11px] font-bold text-emerald-200 bg-emerald-950/30 py-1 rounded-md">
                      ✅ Fatura Quitada
                    </span>
                  ) : (
                    <span className="w-full text-center text-[10px] text-purple-200/70 italic">
                      Sem gastos no mês
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
