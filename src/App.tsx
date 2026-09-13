import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  Download,
  Upload,
  Lock,
  Search,
  Calendar,
  Filter,
  CreditCard,
  RotateCcw,
  ListOrdered,
  BarChart3,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Cartao, Lancamento, ReceitaExtra, TipoLancamento, BackupData } from './types';
import { INITIAL_CARTOES, INITIAL_LANCAMENTOS, INITIAL_RECEITAS } from './data/initialData';
import {
  obterMesAtual,
  formatarMoeda,
  obterMesAnterior,
  obterProximoMes,
  formatarNomeMes
} from './utils/formatters';
import { LoginModal } from './components/LoginModal';
import { DashboardStats } from './components/DashboardStats';
import { CardsBar } from './components/CardsBar';
import { TransactionForm } from './components/TransactionForm';
import { TransactionsTable } from './components/TransactionsTable';
import { ExpenseCharts } from './components/ExpenseCharts';
import { ExtraIncomeSection } from './components/ExtraIncomeSection';

export default function App() {
  // Password / Authentication State
  const [senhaSalva, setSenhaSalva] = useState<string>(() => {
    return localStorage.getItem('financeiro_senha') || '';
  });
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    // If no password configured yet, show login modal to let user set it, matching HTML behavior
    return false;
  });

  // Base opening balance (starting balance prior to recorded transactions)
  const [saldoBaseInicial, setSaldoBaseInicial] = useState<number>(() => {
    const saved = localStorage.getItem('financeiro_saldo_base_inicial');
    if (saved) {
      const val = parseFloat(saved);
      if (!isNaN(val)) return val;
    }
    return 0;
  });
  const [modalSaldoBaseAberto, setModalSaldoBaseAberto] = useState<boolean>(false);
  const [valorTempSaldoBase, setValorTempSaldoBase] = useState<string>('');

  // Core Data States with localStorage persistence
  const [cartoes, setCartoes] = useState<Cartao[]>(() => {
    const saved = localStorage.getItem('financeiro_cartoes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((c: any, idx: number) => ({
            id: c.id ? String(c.id) : `cartao-${idx + 1}-${c.nome || ''}`,
            nome: String(c.nome || `CARTÃO ${idx + 1}`),
            dia: Number(c.dia) || 10,
          }));
        }
      } catch (e) {}
    }
    return INITIAL_CARTOES;
  });

  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() => {
    const saved = localStorage.getItem('financeiro_lancamentos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LANCAMENTOS;
  });

  const [receitasExtra, setReceitasExtra] = useState<ReceitaExtra[]>(() => {
    const saved = localStorage.getItem('financeiro_receitas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_RECEITAS;
  });

  // Filter States
  const [filtroMes, setFiltroMes] = useState<string>(obterMesAtual());
  const [filtroOrigem, setFiltroOrigem] = useState<string>('tudo');
  const [buscaOrigem, setBuscaOrigem] = useState<string>('');

  // Active Tab
  const [abaAtiva, setAbaAtiva] = useState<'tabela' | 'grafico' | 'receitas'>('tabela');

  // Editing state
  const [itemEditando, setItemEditando] = useState<Lancamento | null>(null);

  // Notification Toast
  const [mensagemToast, setMensagemToast] = useState<{ tipo: 'sucesso' | 'info' | 'erro'; texto: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('financeiro_cartoes', JSON.stringify(cartoes));
  }, [cartoes]);

  useEffect(() => {
    localStorage.setItem('financeiro_lancamentos', JSON.stringify(lancamentos));
  }, [lancamentos]);

  useEffect(() => {
    localStorage.setItem('financeiro_receitas', JSON.stringify(receitasExtra));
  }, [receitasExtra]);

  useEffect(() => {
    localStorage.setItem('financeiro_saldo_base_inicial', String(saldoBaseInicial));
  }, [saldoBaseInicial]);

  const exibirToast = (texto: string, tipo: 'sucesso' | 'info' | 'erro' = 'sucesso') => {
    setMensagemToast({ texto, tipo });
    setTimeout(() => {
      setMensagemToast(null);
    }, 3500);
  };

  const handleSalvarSenha = (novaSenha: string) => {
    setSenhaSalva(novaSenha);
    localStorage.setItem('financeiro_senha', novaSenha);
    exibirToast('Senha de segurança configurada com sucesso!', 'sucesso');
  };

  // Card Management
  const handleAdicionarCartao = (nome: string, dia: number) => {
    if (cartoes.some((c) => c.nome === nome)) {
      exibirToast(`O cartão ${nome} já está cadastrado.`, 'erro');
      return;
    }
    const novoCartao: Cartao = {
      id: Date.now().toString(),
      nome,
      dia,
    };
    setCartoes([...cartoes, novoCartao]);
    exibirToast(`Cartão ${nome} adicionado com sucesso!`, 'sucesso');
  };

  const handleExcluirCartao = (id: string, nome: string) => {
    const confirmacao = window.confirm(
      `Deseja realmente remover o cartão ${nome}?\n(Os lançamentos já efetuados serão mantidos)`
    );
    if (confirmacao) {
      setCartoes(cartoes.filter((c) => c.id !== id));
      if (filtroOrigem === nome) {
        setFiltroOrigem('tudo');
      }
      exibirToast(`Cartão ${nome} removido.`, 'info');
    }
  };

  const handleQuitarCartao = (nomeCartao: string) => {
    const lancamentosCartaoMes = lancamentos.filter(
      (l) => l.origem === nomeCartao && l.vencimento.startsWith(filtroMes)
    );

    if (lancamentosCartaoMes.length === 0) {
      window.alert(`Não existem despesas no cartão ${nomeCartao} para este mês!`);
      return;
    }

    const pendentes = lancamentosCartaoMes.filter((l) => !l.pago);
    if (pendentes.length === 0) {
      window.alert(`Todas as despesas do cartão ${nomeCartao} neste mês já estão marcadas como PAGAS!`);
      return;
    }

    const confirmou = window.confirm(
      `Quitar fatura do cartão ${nomeCartao}?\n\n${pendentes.length} item(ns) pendente(s) serão marcados como PAGO(S).`
    );

    if (confirmou) {
      setLancamentos((prev) =>
        prev.map((l) => {
          if (l.origem === nomeCartao && l.vencimento.startsWith(filtroMes)) {
            return { ...l, pago: true };
          }
          return l;
        })
      );
      exibirToast(`Fatura do cartão ${nomeCartao} quitada com sucesso!`, 'sucesso');
    }
  };

  // Transaction Actions
  const handleSalvarLancamento = (dados: {
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
  }) => {
    const { desc, fornecedor, categoria, valorTotal, tipo, cartaoNome, parcelas, dataBase, statusPago, alterarTodosGrupo } = dados;

    const origem = tipo === 'cartao' ? (cartaoNome || 'Cartão') : tipo === 'receita' ? 'Entrada' : 'Dinheiro';

    // EDIT MODE
    if (itemEditando !== null) {
      const grupoItems = lancamentos.filter((l) => l.idGrupo === itemEditando.idGrupo);

      if (alterarTodosGrupo && grupoItems.length > 1) {
        setLancamentos((prev) =>
          prev.map((l) => {
            if (l.idGrupo === itemEditando.idGrupo) {
              const sufixo = l.desc.includes('(') ? l.desc.substring(l.desc.lastIndexOf('(')) : '';
              return {
                ...l,
                desc: sufixo ? `${desc} ${sufixo}` : desc,
                fornecedor,
                categoria,
                valor: valorTotal,
                tipo,
                origem,
              };
            }
            return l;
          })
        );
        exibirToast('Todas as parcelas do grupo foram atualizadas.', 'sucesso');
      } else {
        setLancamentos((prev) =>
          prev.map((l) => {
            if (l.id === itemEditando.id) {
              return {
                ...l,
                desc,
                fornecedor,
                categoria,
                valor: valorTotal,
                tipo,
                origem,
                vencimento: dataBase,
                pago: statusPago,
              };
            }
            return l;
          })
        );
        exibirToast('Lançamento atualizado com sucesso.', 'sucesso');
      }

      setItemEditando(null);
      return;
    }

    // CREATE MODE (SUPPORT MULTI-INSTALLMENTS)
    let valorUnitario = valorTotal;
    if (parcelas > 1) {
      const ehTotal = window.confirm(
        `R$ ${valorTotal.toFixed(2)} é o valor TOTAL da compra?\n\n(OK = dividir em ${parcelas}x de ${formatarMoeda(valorTotal / parcelas)} / Cancelar = cada parcela é esse valor)`
      );
      if (ehTotal) {
        valorUnitario = valorTotal / parcelas;
      }
    }

    let mesOffset = 0;
    const dataBaseObj = new Date(`${dataBase}T00:00:00`);
    if (tipo === 'cartao') {
      const cInfo = cartoes.find((x) => x.nome === cartaoNome);
      if (cInfo && dataBaseObj.getDate() > cInfo.dia) {
        mesOffset = 1;
      }
    }

    const idGrupo = Date.now();
    const novosItens: Lancamento[] = [];

    for (let i = 0; i < parcelas; i++) {
      const dt = new Date(`${dataBase}T00:00:00`);
      dt.setMonth(dt.getMonth() + i + mesOffset);
      if (tipo === 'cartao') {
        const c = cartoes.find((x) => x.nome === cartaoNome);
        if (c) {
          dt.setDate(c.dia);
        }
      }

      novosItens.push({
        id: Date.now() + i,
        idGrupo,
        desc: parcelas > 1 ? `${desc} (${i + 1}/${parcelas})` : desc,
        fornecedor,
        categoria,
        valor: valorUnitario,
        tipo,
        origem,
        vencimento: dt.toISOString().substring(0, 10),
        pago: tipo === 'receita' ? true : statusPago,
      });
    }

    setLancamentos((prev) => [...prev, ...novosItens]);
    exibirToast(
      parcelas > 1
        ? `${parcelas} parcelas de ${formatarMoeda(valorUnitario)} criadas com sucesso!`
        : 'Lançamento registrado com sucesso!',
      'sucesso'
    );
  };

  const handleAlternarStatusLancamento = (id: number) => {
    setLancamentos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pago: !l.pago } : l))
    );
  };

  const handleExcluirLancamento = (id: number) => {
    const item = lancamentos.find((l) => l.id === id);
    if (!item) return;

    const grupo = lancamentos.filter((l) => l.idGrupo === item.idGrupo);

    if (grupo.length > 1) {
      const excluirTudo = window.confirm(
        `Este item faz parte de um grupo de ${grupo.length} parcelas.\n\nDeseja excluir TODAS as parcelas deste grupo?\n(OK = Excluir todas / Cancelar = Excluir apenas esta parcela)`
      );
      if (excluirTudo) {
        setLancamentos((prev) => prev.filter((l) => l.idGrupo !== item.idGrupo));
        exibirToast('Todas as parcelas do grupo foram excluídas.', 'info');
        return;
      }
    }

    const confirmou = window.confirm('Deseja excluir este lançamento?');
    if (confirmou) {
      setLancamentos((prev) => prev.filter((l) => l.id !== id));
      exibirToast('Lançamento excluído com sucesso.', 'info');
    }
  };

  // Extra Income Actions
  const handleAdicionarReceita = (receita: Omit<ReceitaExtra, 'id'>) => {
    const nova: ReceitaExtra = {
      ...receita,
      id: Date.now(),
    };
    setReceitasExtra((prev) => [...prev, nova]);
    exibirToast('Receita extra cadastrada com sucesso!', 'sucesso');
  };

  const handleEditarReceita = (receita: ReceitaExtra) => {
    setReceitasExtra((prev) =>
      prev.map((r) => (r.id === receita.id ? receita : r))
    );
    exibirToast('Receita extra atualizada!', 'sucesso');
  };

  const handleAlternarStatusReceita = (id: number) => {
    setReceitasExtra((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'recebido' ? 'pendente' : 'recebido' }
          : r
      )
    );
  };

  const handleExcluirReceita = (id: number) => {
    if (window.confirm('Deseja excluir esta receita extra?')) {
      setReceitasExtra((prev) => prev.filter((r) => r.id !== id));
      exibirToast('Receita excluída.', 'info');
    }
  };

  // Export JSON Backup
  const exportarDados = () => {
    const dados: BackupData = {
      lancamentos,
      cartoes,
      receitasExtra,
      saldoBaseInicial,
      versao: '12.7',
      exportadoEm: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_financeiro_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    exibirToast('Backup JSON exportado com sucesso!', 'sucesso');
  };

  // Import JSON Backup
  const processarImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string);
        if (dados.lancamentos && Array.isArray(dados.lancamentos)) {
          setLancamentos(dados.lancamentos);
        }
        if (dados.cartoes && Array.isArray(dados.cartoes)) {
          setCartoes(
            dados.cartoes.map((c: any, idx: number) => ({
              id: c.id ? String(c.id) : `cartao-import-${idx + 1}-${c.nome || ''}`,
              nome: String(c.nome || `CARTÃO ${idx + 1}`),
              dia: Number(c.dia) || 10,
            }))
          );
        }
        if (dados.receitasExtra && Array.isArray(dados.receitasExtra)) {
          setReceitasExtra(dados.receitasExtra);
        }
        if (typeof dados.saldoBaseInicial === 'number') {
          setSaldoBaseInicial(dados.saldoBaseInicial);
        }
        exibirToast('Backup restaurado com sucesso!', 'sucesso');
      } catch (err) {
        exibirToast('Erro ao processar arquivo de backup. Formato inválido.', 'erro');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate Dashboard Totals for Selected Month and Month-over-Month Roll-over
  const {
    saldoInicial,
    recOk,
    recPen,
    desOk,
    desPen,
    saldoDinamico,
    saldoTotal,
    mesAnterior,
    proximoMes,
  } = useMemo(() => {
    // 1. Calculate cumulative projected balance from all months strictly before filtroMes (< filtroMes)
    let saldoAnt = saldoBaseInicial;

    lancamentos.forEach((l) => {
      const mesLanc = l.vencimento && l.vencimento.length >= 7 ? l.vencimento.slice(0, 7) : '';
      if (mesLanc && mesLanc < filtroMes) {
        if (l.tipo === 'receita') {
          saldoAnt += l.valor;
        } else {
          saldoAnt -= l.valor;
        }
      }
    });

    receitasExtra.forEach((r) => {
      const mesRec = r.data && r.data.length >= 7 ? r.data.slice(0, 7) : '';
      if (mesRec && mesRec < filtroMes) {
        saldoAnt += r.valor;
      }
    });

    // 2. Breakdown for selected month (filtroMes)
    let rOk = 0;
    let rPen = 0;
    let dOk = 0;
    let dPen = 0;

    lancamentos
      .filter((l) => l.vencimento && l.vencimento.startsWith(filtroMes))
      .forEach((l) => {
        if (l.tipo === 'receita') {
          if (l.pago) rOk += l.valor;
          else rPen += l.valor;
        } else {
          if (l.pago) dOk += l.valor;
          else dPen += l.valor;
        }
      });

    receitasExtra
      .filter((r) => r.data && r.data.startsWith(filtroMes))
      .forEach((r) => {
        if (r.status === 'recebido') rOk += r.valor;
        else rPen += r.valor;
      });

    // Saldo Inicial do mês atual = Saldo Previsto acumulado do mês anterior
    const sInicial = saldoAnt;

    // Saldo Atual (Realizado no caixa: Saldo Inicial + Recebidos - Pagos)
    const sAtual = sInicial + rOk - dOk;

    // Saldo Previsto (Final do mês: Saldo Inicial + Total Receitas Previstas - Total Despesas Previstas)
    // Esse valor será exatamente o Saldo Inicial do próximo mês!
    const sTotal = sInicial + (rOk + rPen) - (dOk + dPen);

    return {
      saldoInicial: sInicial,
      recOk: rOk,
      recPen: rPen,
      desOk: dOk,
      desPen: dPen,
      saldoDinamico: sAtual,
      saldoTotal: sTotal,
      mesAnterior: obterMesAnterior(filtroMes),
      proximoMes: obterProximoMes(filtroMes),
    };
  }, [lancamentos, receitasExtra, filtroMes, saldoBaseInicial]);

  // Filtered Transactions for Table
  const lancamentosFiltrados = useMemo(() => {
    const busca = buscaOrigem.trim().toUpperCase();

    return lancamentos
      .filter((l) => {
        const noMes = l.vencimento.startsWith(filtroMes);
        const naOrigem =
          filtroOrigem === 'tudo'
            ? true
            : filtroOrigem === 'Entrada'
            ? l.tipo === 'receita'
            : filtroOrigem === 'Dinheiro'
            ? l.origem === 'Dinheiro'
            : l.origem === filtroOrigem;

        const texto = `${l.desc} ${l.fornecedor || ''} ${l.categoria || ''} ${l.origem}`.toUpperCase();
        const noBusca = !busca || texto.includes(busca);

        return noMes && naOrigem && noBusca;
      })
      .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());
  }, [lancamentos, filtroMes, filtroOrigem, buscaOrigem]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800 antialiased">
      {/* Login Screen Modal if not authenticated */}
      {!autenticado && (
        <LoginModal
          senhaSalva={senhaSalva}
          setSenhaSalva={handleSalvarSenha}
          onLoginSuccess={() => setAutenticado(true)}
        />
      )}

      {/* Toast feedback */}
      {mensagemToast && (
        <div
          id="toast-notificacao"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-xl transition-all ${
            mensagemToast.tipo === 'sucesso'
              ? 'bg-emerald-600'
              : mensagemToast.tipo === 'erro'
              ? 'bg-rose-600'
              : 'bg-blue-600'
          }`}
        >
          {mensagemToast.tipo === 'sucesso' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <span>{mensagemToast.texto}</span>
        </div>
      )}

      {/* Main Container */}
      <div id="conteudo-principal" className="mx-auto max-w-7xl px-3 sm:px-6 pt-5">
        {/* Top Header Card */}
        <header
          id="cabecalho-principal"
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <span>Gestão Financeira</span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      V12.7 Pro
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Saldo do mês atualizado conforme quitação das dívidas • Armazenamento local seguro
                  </p>
                </div>
              </div>

              {/* Action Buttons: Backup & Lock */}
              <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="btn-exportar-backup"
                  onClick={exportarDados}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow active:scale-95"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>FAZER BACKUP</span>
                </button>

                <button
                  type="button"
                  id="btn-importar-backup"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow active:scale-95"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>RESTAURAR BACKUP</span>
                </button>
                <input
                  type="file"
                  id="importFile"
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={processarImport}
                />

                <button
                  type="button"
                  id="btn-bloquear-tela"
                  onClick={() => setAutenticado(false)}
                  title="Bloquear aplicativo"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span>Bloquear</span>
                </button>
              </div>
            </div>

            {/* Filter Controls (Search, Card/Origin, Month) */}
            <div
              id="filtros-topo"
              className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3"
            >
              {/* Busca */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  🔎 Buscar Gastos
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    id="buscaOrigem"
                    placeholder="Descrição, fornecedor..."
                    value={buscaOrigem}
                    onChange={(e) => setBuscaOrigem(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Forma / Cartão */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  💳 Forma / Cartão
                </label>
                <select
                  id="filtroOrigem"
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="tudo">💳 Todos</option>
                  <option value="Entrada">💰 Receitas</option>
                  <option value="Dinheiro">💵 Dinheiro / Pix</option>
                  {cartoes.map((c, index) => (
                    <option key={c.id || `filtro-cartao-${c.nome}-${index}`} value={c.nome}>
                      💳 {c.nome}
                    </option>
                  ))}
                </select>
                {filtroOrigem !== 'tudo' && (
                  <button
                    type="button"
                    onClick={() => setFiltroOrigem('tudo')}
                    className="mt-1 text-[10px] font-bold text-slate-500 hover:text-emerald-700 underline"
                  >
                    Mostrar Todos
                  </button>
                )}
              </div>

              {/* Mês */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  📅 Mês de Referência
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    id="btn-mes-anterior"
                    title={`Mês anterior (${formatarNomeMes(mesAnterior, true)})`}
                    onClick={() => setFiltroMes(mesAnterior)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0 shadow-2xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <input
                    type="month"
                    id="filtroMes"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    id="btn-proximo-mes"
                    title={`Próximo mês (${formatarNomeMes(proximoMes, true)})`}
                    onClick={() => setFiltroMes(proximoMes)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0 shadow-2xs"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 7 Metric Dashboard Cards with Month-to-Month Balance Continuity */}
        <DashboardStats
          saldoInicial={saldoInicial}
          recOk={recOk}
          recPen={recPen}
          desOk={desOk}
          desPen={desPen}
          saldoDinamico={saldoDinamico}
          saldoTotal={saldoTotal}
          mesSelecionado={filtroMes}
          mesAnterior={mesAnterior}
          proximoMes={proximoMes}
          onEditarSaldoBase={() => {
            setValorTempSaldoBase(String(saldoBaseInicial || ''));
            setModalSaldoBaseAberto(true);
          }}
        />

        {/* Credit Cards & Monthly Invoices Bar */}
        <CardsBar
          cartoes={cartoes}
          lancamentos={lancamentos}
          mesSelecionado={filtroMes}
          cartaoFiltro={filtroOrigem}
          onSelectCartao={(nome) => setFiltroOrigem(nome)}
          onQuitarCartao={handleQuitarCartao}
          onAdicionarCartao={handleAdicionarCartao}
          onExcluirCartao={handleExcluirCartao}
        />

        {/* New / Edit Transaction Form */}
        <TransactionForm
          cartoes={cartoes}
          itemEditando={itemEditando}
          onSalvarLancamento={handleSalvarLancamento}
          onCancelarEdicao={() => setItemEditando(null)}
        />

        {/* Navigation Tabs */}
        <div id="abas-container" className="flex items-center gap-2 border-b border-slate-200 mb-5">
          <button
            type="button"
            id="btn-aba-tabela"
            onClick={() => setAbaAtiva('tabela')}
            className={`inline-flex items-center gap-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
              abaAtiva === 'tabela'
                ? 'border-emerald-600 bg-white text-emerald-700 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <ListOrdered className="h-4 w-4" />
            <span>📋 Lista de Lançamentos</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {lancamentosFiltrados.length}
            </span>
          </button>

          <button
            type="button"
            id="btn-aba-grafico"
            onClick={() => setAbaAtiva('grafico')}
            className={`inline-flex items-center gap-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
              abaAtiva === 'grafico'
                ? 'border-rose-600 bg-white text-rose-700 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>📊 Gráfico de Gastos (Torres)</span>
          </button>

          <button
            type="button"
            id="btn-aba-receitas"
            onClick={() => setAbaAtiva('receitas')}
            className={`inline-flex items-center gap-1.5 rounded-t-xl px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
              abaAtiva === 'receitas'
                ? 'border-teal-600 bg-white text-teal-700 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>💰 Lista de Receitas</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {receitasExtra.filter((r) => r.data.startsWith(filtroMes)).length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <main>
          {abaAtiva === 'tabela' && (
            <section id="aba-tabela">
              <TransactionsTable
                lancamentos={lancamentosFiltrados}
                onAlternarStatus={handleAlternarStatusLancamento}
                onEditar={(l) => {
                  setItemEditando(l);
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                onExcluir={handleExcluirLancamento}
              />
            </section>
          )}

          {abaAtiva === 'grafico' && (
            <section id="aba-grafico">
              <ExpenseCharts
                lancamentos={lancamentos}
                mesSelecionado={filtroMes}
              />
            </section>
          )}

          {abaAtiva === 'receitas' && (
            <section id="aba-receitas">
              <ExtraIncomeSection
                receitas={receitasExtra}
                mesSelecionado={filtroMes}
                onAdicionarReceita={handleAdicionarReceita}
                onEditarReceita={handleEditarReceita}
                onAlternarStatus={handleAlternarStatusReceita}
                onExcluirReceita={handleExcluirReceita}
              />
            </section>
          )}
        </main>

        {/* Modal de Ajuste de Saldo de Abertura Inicial */}
        {modalSaldoBaseAberto && (
          <div
            id="modal-saldo-base"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Saldo de Abertura Inicial</h3>
                    <p className="text-xs text-slate-500">Saldo inicial anterior aos lançamentos</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalSaldoBaseAberto(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Caso você já tivesse um saldo em conta antes do primeiro mês registrado no sistema, informe o valor abaixo.
                  Este valor serve como base histórica e será acumulado mês a mês automaticamente.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor de Abertura (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valorTempSaldoBase}
                    onChange={(e) => setValorTempSaldoBase(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Saldo base atual: <strong className="text-slate-600">{formatarMoeda(saldoBaseInicial)}</strong>
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalSaldoBaseAberto(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const num = parseFloat(valorTempSaldoBase.replace(',', '.'));
                      setSaldoBaseInicial(isNaN(num) ? 0 : num);
                      setModalSaldoBaseAberto(false);
                      exibirToast('Saldo de abertura inicial atualizado com sucesso!', 'sucesso');
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Salvar Saldo Inicial
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
