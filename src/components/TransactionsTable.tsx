import React from 'react';
import {
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Tag,
  Building2,
  CreditCard,
  Banknote,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Lancamento } from '../types';
import { formatarMoeda, formatarData } from '../utils/formatters';

interface TransactionsTableProps {
  lancamentos: Lancamento[];
  onAlternarStatus: (id: number) => void;
  onEditar: (lancamento: Lancamento) => void;
  onExcluir: (id: number) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  lancamentos,
  onAlternarStatus,
  onEditar,
  onExcluir,
}) => {
  if (lancamentos.length === 0) {
    return (
      <div
        id="tabela-vazia"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">Nenhum lançamento encontrado</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Não há despesas ou receitas correspondentes aos filtros selecionados para este mês.
        </p>
      </div>
    );
  }

  return (
    <div
      id="tabela-lancamentos-container"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 pl-4 pr-2">Status</th>
              <th className="py-3.5 px-3">Descrição / Origem</th>
              <th className="py-3.5 px-3">Fornecedor</th>
              <th className="py-3.5 px-3">Categoria</th>
              <th className="py-3.5 px-3">Valor</th>
              <th className="py-3.5 px-3">Vencimento</th>
              <th className="py-3.5 pl-3 pr-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lancamentos.map((l, index) => {
              const ehReceita = l.tipo === 'receita';
              const isPendente = !l.pago;

              // Row styling based on state
              const rowClass = ehReceita
                ? l.pago
                  ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                  : 'bg-amber-50/40 hover:bg-amber-50/70'
                : isPendente
                ? 'bg-rose-50/50 hover:bg-rose-50/80 text-rose-950 font-medium'
                : 'bg-white hover:bg-slate-50/70 text-slate-800';

              return (
                <tr
                  key={l.id ?? `lancamento-${index}`}
                  id={`linha-lancamento-${l.id}`}
                  className={`transition-colors ${rowClass}`}
                >
                  {/* Status Badge */}
                  <td className="py-3 pl-4 pr-2 whitespace-nowrap">
                    {l.pago ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                          ehReceita
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {ehReceita ? 'RECEBIDO' : 'PAGO'}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${
                          ehReceita
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-900 border border-rose-300'
                        }`}
                      >
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        {ehReceita ? 'A RECEBER' : 'PENDENTE'}
                      </span>
                    )}
                  </td>

                  {/* Descrição & Origem */}
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900 leading-tight">{l.desc}</div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 font-medium">
                      {l.tipo === 'cartao' ? (
                        <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                          <CreditCard className="h-2.5 w-2.5" />
                          {l.origem}
                        </span>
                      ) : l.tipo === 'receita' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                          <TrendingUp className="h-2.5 w-2.5" />
                          Receita
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                          <Banknote className="h-2.5 w-2.5" />
                          Dinheiro / Pix
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Fornecedor */}
                  <td className="py-3 px-3 text-slate-600">
                    <div className="flex items-center gap-1 font-medium">
                      <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                      <span>{l.fornecedor || '-'}</span>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="py-3 px-3 text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {l.categoria || 'Geral'}
                    </span>
                  </td>

                  {/* Valor */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`text-sm font-extrabold tracking-tight ${
                        ehReceita ? 'text-emerald-700' : isPendente ? 'text-rose-700' : 'text-slate-900'
                      }`}
                    >
                      {ehReceita ? '+' : '-'} {formatarMoeda(l.valor)}
                    </span>
                  </td>

                  {/* Data Vencimento */}
                  <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                    {formatarData(l.vencimento)}
                  </td>

                  {/* Ações */}
                  <td className="py-3 pl-3 pr-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        id={`btn-toggle-status-${l.id}`}
                        onClick={() => onAlternarStatus(l.id)}
                        title={l.pago ? 'Marcar como Pendente' : 'Marcar como Pago'}
                        className={`rounded-lg p-1.5 transition-all shadow-sm ${
                          l.pago
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {l.pago ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </button>

                      <button
                        type="button"
                        id={`btn-edit-${l.id}`}
                        onClick={() => onEditar(l)}
                        title="Editar Lançamento"
                        className="rounded-lg bg-blue-50 p-1.5 text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        id={`btn-del-${l.id}`}
                        onClick={() => onExcluir(l.id)}
                        title="Excluir Lançamento"
                        className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
