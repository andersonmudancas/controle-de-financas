import React from 'react';
import { BarChart3, TrendingDown, PieChart } from 'lucide-react';
import { Lancamento } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface ExpenseChartsProps {
  lancamentos: Lancamento[];
  mesSelecionado: string;
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  lancamentos,
  mesSelecionado,
}) => {
  // Only expenses (not revenues) for the selected month
  const despesasMes = lancamentos.filter(
    (l) => l.vencimento.startsWith(mesSelecionado) && l.tipo !== 'receita'
  );

  const totaisPorCat: Record<string, number> = {};
  let totalDespesas = 0;

  despesasMes.forEach((l) => {
    const cat = l.categoria || 'Outros';
    totaisPorCat[cat] = (totaisPorCat[cat] || 0) + l.valor;
    totalDespesas += l.valor;
  });

  const categoriasOrdenadas = Object.keys(totaisPorCat).sort(
    (a, b) => totaisPorCat[b] - totaisPorCat[a]
  );
  const maiorValor = categoriasOrdenadas.length > 0 ? totaisPorCat[categoriasOrdenadas[0]] : 0;

  // Colors palette for bars
  const cores = [
    'from-rose-500 to-red-600',
    'from-amber-500 to-orange-600',
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-violet-600',
    'from-emerald-500 to-teal-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
    'from-lime-500 to-emerald-600',
  ];

  if (categoriasOrdenadas.length === 0) {
    return (
      <div
        id="grafico-sem-dados"
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-700">Nenhum gasto cadastrado neste mês</h4>
        <p className="text-xs text-slate-500 mt-1">
          Adicione lançamentos de despesas ou faturas de cartão para visualizar o ranking por categoria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Gráfico de Torres */}
      <div
        id="secao-grafico-torres"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rose-600" />
              <span>Ranking de Gastos por Categoria (Torres)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativo proporcional das categorias mais impactantes em {mesSelecionado}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Despesas:</span>
            <div className="text-lg font-extrabold text-rose-600">
              {formatarMoeda(totalDespesas)}
            </div>
          </div>
        </div>

        {/* Container Horizontal do Gráfico de Torres */}
        <div className="w-full overflow-x-auto pb-4 pt-6">
          <div
            id="container-torres"
            className="flex items-end gap-6 min-h-[260px] min-w-max border-b-2 border-slate-200 px-4 pb-2"
          >
            {categoriasOrdenadas.map((cat, idx) => {
              const valor = totaisPorCat[cat];
              const percentual = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;
              const alturaPct = maiorValor > 0 ? Math.max((valor / maiorValor) * 100, 8) : 8;
              const corGradiente = cores[idx % cores.length];

              return (
                <div
                  key={cat}
                  className="flex flex-col items-center w-20 group transition-transform hover:-translate-y-1"
                >
                  {/* Valor no Topo */}
                  <div className="text-[11px] font-extrabold text-slate-700 text-center mb-1.5 whitespace-nowrap">
                    {formatarMoeda(valor)}
                  </div>

                  {/* Porcentagem */}
                  <div className="text-[10px] font-semibold text-slate-400 mb-1">
                    {percentual.toFixed(1)}%
                  </div>

                  {/* A Torre / Barra */}
                  <div className="w-12 h-44 flex items-end justify-center bg-slate-100/60 rounded-t-lg overflow-hidden p-1">
                    <div
                      style={{ height: `${alturaPct}%` }}
                      className={`w-full rounded-t-md bg-gradient-to-t ${corGradiente} shadow-sm transition-all duration-500 ease-out`}
                      title={`${cat}: ${formatarMoeda(valor)} (${percentual.toFixed(1)}%)`}
                    />
                  </div>

                  {/* Rótulo da Categoria */}
                  <div
                    className="mt-2.5 text-center text-xs font-bold text-slate-700 w-full truncate"
                    title={cat}
                  >
                    {cat}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Distribuição / Percentuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categoriasOrdenadas.map((cat, idx) => {
          const valor = totaisPorCat[cat];
          const percentual = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;
          return (
            <div
              key={cat}
              className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">
                  {idx + 1}º
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{cat}</h4>
                  <p className="text-[11px] text-slate-500">{percentual.toFixed(1)}% do orçamento</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold text-slate-900">{formatarMoeda(valor)}</div>
                <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${percentual}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
