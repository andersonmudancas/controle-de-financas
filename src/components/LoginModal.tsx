import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
  senhaSalva: string;
  setSenhaSalva: (senha: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLoginSuccess,
  senhaSalva,
  setSenhaSalva,
}) => {
  const [senhaInput, setSenhaInput] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');

  const isPrimeiroAcesso = !senhaSalva;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const trimmed = senhaInput.trim();
    if (!trimmed) {
      setErro('Por favor, digite uma senha de acesso.');
      return;
    }

    if (isPrimeiroAcesso) {
      setSenhaSalva(trimmed);
      onLoginSuccess();
    } else {
      if (trimmed === senhaSalva) {
        onLoginSuccess();
      } else {
        setErro('Senha incorreta! Tente novamente.');
      }
    }
  };

  return (
    <div
      id="tela-login"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm"
    >
      <div
        id="login-card-container"
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-inner">
          <Lock className="h-7 w-7" />
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-800">
          Meu Financeiro
        </h2>
        <p className="mt-1 text-center text-xs font-medium text-slate-500">
          {isPrimeiroAcesso
            ? 'Defina sua senha de acesso inicial para proteger seus dados'
            : 'Informe sua senha cadastrada para acessar o painel'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              id="campo-senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senhaInput}
              onChange={(e) => {
                setSenhaInput(e.target.value);
                setErro('');
              }}
              placeholder={isPrimeiroAcesso ? 'Crie uma senha...' : 'Senha de Acesso'}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-10 pr-10 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
              autoFocus
            />
            <button
              type="button"
              id="btn-toggle-senha"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              title={mostrarSenha ? 'Ocultar senha' : 'Ver senha'}
            >
              {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {erro && (
            <div
              id="alerta-erro-login"
              className="rounded-lg bg-rose-50 p-2.5 text-center text-xs font-semibold text-rose-600 border border-rose-200"
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            id="btn-entrar"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 active:scale-[0.99]"
          >
            <span>ENTRAR</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Controle seguro • Gestão Financeira V12.7
          </span>
        </div>
      </div>
    </div>
  );
};
