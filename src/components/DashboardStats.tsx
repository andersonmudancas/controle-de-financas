import React from 'react';
import {
  ArrowDownCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Coins,
  Landmark,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatarMoeda, formatarNomeMes } from '../utils/formatters';

interface DashboardStatsProps {
  saldoInicial: number;
  recOk: number;
  recPen: number;
  desOk: number;
  desPen: number;
  saldoDinamico: number;
  saldoTotal: number;
  mesSelecionado: string;
  mesAnterior: string;
  proximoMes: string;
  onEditarSaldoBase?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  saldoInicial,
  recOk,
  recPen,
  desOk,
  desPen,
  saldoDinamico,
  saldoTotal,
  mesSelecionado,
  mesAnterior,
  proximoMes,
  onEditarSaldoBase,
}) => {
  const totalEntradasPrevistas = recOk + recPen;
  const totalDespesasPrevistas = desOk + desPen;
  const resultadoMes = totalEntradasPrevistas - totalDespesasPrevistas;

  return (
    <div className="mb-6 space-y-2.5">
      {/* 7 Metric Cards Grid */}
      <div
        id="dashboard-cards-grid"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3"
      >
        {/* 1. Saldo Inicial (Vindo do Mês Anterior) */}
        <div
          id="card-saldo-inicial"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-800 p-3 sm:p-3.5 text-white shadow-sm shadow-indigo-950/20 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Saldo Inicial
            </span>
            <div className="flex items-center gap-1">
              {onEditarSaldoBase && (
                <button
                  type="button"
                  onClick={onEditarSaldoBase}
                  title="Ajustar saldo inicial de abertura"
                  className="rounded p-0.5 text-indigo-200 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                </button>
              )}
              <Landmark className="h-4 w-4 shrink-0 text-indigo-200" />
            </div>
          </div>
          <p
            id="total-saldo-inicial"
            className={`mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate ${
              saldoInicial < 0 ? 'text-rose-300' : 'text-white'
            }`}
          >
            {formatarMoeda(saldoInicial)}
          </p>
          <span className="text-[10px] text-indigo-200/90 font-medium truncate block">
            Vem de {formatarNomeMes(mesAnterior, true)}
          </span>
        </div>

        {/* 2. Recebido (Mês) */}
        <div
          id="card-rec-ok"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 sm:p-3.5 text-white shadow-sm shadow-emerald-900/10 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Recebido (Mês)
            </span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-200" />
          </div>
          <p
            id="total-rec-ok"
            className="mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate"
          >
            {formatarMoeda(recOk)}
          </p>
          <span className="text-[10px] text-emerald-100/80 font-medium truncate block">
            Entradas quitadas
          </span>
        </div>

        {/* 3. A Receber (Mês) */}
        <div
          id="card-rec-pen"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 p-3 sm:p-3.5 text-white shadow-sm shadow-teal-900/10 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              A Receber
            </span>
            <Clock className="h-4 w-4 shrink-0 text-teal-200" />
          </div>
          <p
            id="total-rec-pen"
            className="mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate"
          >
            {formatarMoeda(recPen)}
          </p>
          <span className="text-[10px] text-teal-100/80 font-medium truncate block">
            Entradas pendentes
          </span>
        </div>

        {/* 4. Pago (Mês) */}
        <div
          id="card-des-ok"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-3 sm:p-3.5 text-white shadow-sm shadow-blue-900/10 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Pago (Mês)
            </span>
            <ArrowDownCircle className="h-4 w-4 shrink-0 text-blue-200" />
          </div>
          <p
            id="total-des-ok"
            className="mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate"
          >
            {formatarMoeda(desOk)}
          </p>
          <span className="text-[10px] text-blue-100/80 font-medium truncate block">
            Despesas quitadas
          </span>
        </div>

        {/* 5. Dívida Pendente */}
        <div
          id="card-des-pen"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 p-3 sm:p-3.5 text-white shadow-sm shadow-rose-900/10 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Dívida Pendente
            </span>
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-200" />
          </div>
          <p
            id="total-des-pen"
            className="mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate"
          >
            {formatarMoeda(desPen)}
          </p>
          <span className="text-[10px] text-rose-100/80 font-medium truncate block">
            A pagar no mês
          </span>
        </div>

        {/* 6. Saldo Atual (Mês) */}
        <div
          id="card-saldo-dinamico"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sky-600 to-sky-700 p-3 sm:p-3.5 text-white shadow-sm shadow-sky-900/10 transition-transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Saldo Atual
            </span>
            <Wallet className="h-4 w-4 shrink-0 text-sky-200" />
          </div>
          <p
            id="total-saldo-dinamico"
            className={`mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate ${
              saldoDinamico < 0 ? 'text-amber-200' : 'text-white'
            }`}
          >
            {formatarMoeda(saldoDinamico)}
          </p>
          <span className="text-[10px] text-sky-100/80 font-medium truncate block">
            Inicial + Rec. - Pago
          </span>
        </div>

        {/* 7. Saldo Previsto (Final do Mês) */}
        <div
          id="card-saldo-total"
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-3 sm:p-3.5 text-white shadow-sm shadow-slate-950/20 transition-transform hover:-translate-y-0.5 ring-1 ring-amber-400/30"
        >
          <div className="flex items-center justify-between opacity-85">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-200">
              Saldo Previsto
            </span>
            <Coins className="h-4 w-4 shrink-0 text-amber-300" />
          </div>
          <p
            id="total-saldo"
            className={`mt-2 text-base sm:text-lg lg:text-base xl:text-lg font-extrabold tracking-tight truncate ${
              saldoTotal < 0 ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {formatarMoeda(saldoTotal)}
          </p>
          <span className="text-[10px] text-amber-200/90 font-medium truncate block">
            Passa p/ {formatarNomeMes(proximoMes, true)}
          </span>
        </div>
      </div>

      {/* Continuity Ribbon: Shows how Saldo Inicial + Mês = Saldo Previsto -> Próximo Mês */}
      <div
        id="fluxo-saldo-mes"
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-xs"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-medium">
          <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
            <Landmark className="h-3.5 w-3.5" />
            Inicial ({formatarNomeMes(mesAnterior, true)}): {formatarMoeda(saldoInicial)}
          </span>
          <span className="text-slate-400 font-bold">+</span>
          <span className="text-emerald-700">
            Receitas: {formatarMoeda(totalEntradasPrevistas)}
          </span>
          <span className="text-slate-400 font-bold">-</span>
          <span className="text-rose-700">
            Despesas: {formatarMoeda(totalDespesasPrevistas)}
          </span>
          <span className="text-slate-400 font-bold">=</span>
          <span
            className={`font-bold ${
              resultadoMes >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            Mês: {resultadoMes >= 0 ? '+' : ''}{formatarMoeda(resultadoMes)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 bg-slate-100/90 px-2 py-0.5 rounded-lg">
          <span className="text-slate-600">Saldo Previsto Final:</span>
          <span className={saldoTotal >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
            {formatarMoeda(saldoTotal)}
          </span>
          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="text-indigo-700">
            Inicial de {formatarNomeMes(proximoMes, true)}
          </span>
        </div>
      </div>
    </div>
  );
};

