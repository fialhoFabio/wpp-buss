'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  dbGetConversationWithMessages,
  dbSearchProfiles,
  dbGetWhatsappAccountsWithPhoneNumbers,
} from 'lib/supabase';
import { type Conversation } from './chat-utils';

type Profile = {
  id: string;
  name: string | null;
};

type WabaAccount = {
  id: string;
  waba_id: string;
  display_name: string | null;
  status: string;
  owner_id: string;
  created_at: string;
  whatsapp_phone_numbers: Array<{
    id: string;
    phone_number_id: string;
    display_phone_number: string | null;
    verified_name: string | null;
    status: string;
    quality_rating: string | null;
    platform_type: string | null;
  }>;
};

const CopyButton = ({ text, title = 'Copiar' }: { text: string; title?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      title={title}
      className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:bg-orange-100 hover:text-orange-600"
    >
      {copied ? 'Copiado!' : 'Copiar'}
    </button>
  );
};

const DrawerContent = ({
  onClose,
  onLoadConversation,
}: {
  onClose: () => void;
  onLoadConversation: (conversation: Conversation) => void;
}) => {
  // Conversa por ID
  const [convId, setConvId] = useState('');
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState(false);

  // WABAs por Cliente
  const [clientInput, setClientInput] = useState('');
  const [loadingClient, setLoadingClient] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [searchProfiles, setSearchProfiles] = useState<Profile[]>([]);
  const [searchAccounts, setSearchAccounts] = useState<WabaAccount[]>([]);

  // Carregar conversa
  const handleLoadConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convId.trim()) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(convId.trim())) {
      setLoadError('ID inválido. Deve ser um UUID.');
      setLoadSuccess(false);
      return;
    }

    setLoadingConv(true);
    setLoadError(null);
    setLoadSuccess(false);

    try {
      const { data, error } = await dbGetConversationWithMessages(convId.trim());

      if (error) throw error;
      if (!data) {
        setLoadError('Conversa não encontrada no banco de dados.');
        return;
      }

      onLoadConversation(data as Conversation);
      setLoadSuccess(true);
      setConvId('');
    } catch (err: any) {
      console.error(err);
      setLoadError(err.message || 'Erro ao carregar a conversa.');
    } finally {
      setLoadingConv(false);
    }
  };

  // Buscar cliente e contas
  const handleSearchClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInput.trim()) return;

    setLoadingClient(true);
    setClientError(null);
    setSearchProfiles([]);
    setSearchAccounts([]);

    const query = clientInput.trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);

    try {
      const { data: profilesData, error: profilesError } = await dbSearchProfiles(query, isUuid);
      if (profilesError) throw profilesError;
      
      const resolvedProfiles: Profile[] = profilesData || [];
      setSearchProfiles(resolvedProfiles);

      const profileIds = resolvedProfiles.map((p) => p.id);
      const { data: accountsData, error: accountsError } = await dbGetWhatsappAccountsWithPhoneNumbers(
        profileIds,
        isUuid,
        query
      );
      if (accountsError) throw accountsError;
      setSearchAccounts((accountsData as WabaAccount[]) || []);
    } catch (err: any) {
      console.error(err);
      setClientError(err.message || 'Erro ao buscar dados do cliente.');
    } finally {
      setLoadingClient(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-orange-200 bg-orange-50 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠</span>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-orange-700">
              Debug — Conversas
            </h2>
            <p className="text-[10px] text-orange-600 font-medium">Ferramentas administrativas de depuração</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-8 w-8 items-center justify-center rounded-md text-orange-600 transition-colors hover:bg-orange-100 hover:text-orange-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Tool 1: Load conversation by ID */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Carregar Conversa por ID
          </h3>
          <form onSubmit={handleLoadConversation} className="space-y-3">
            <div>
              <label htmlFor="convId" className="block text-[11px] font-medium text-gray-500 mb-1">
                ID da Conversa (UUID)
              </label>
              <input
                id="convId"
                type="text"
                value={convId}
                onChange={(e) => setConvId(e.target.value)}
                placeholder="Ex: 8a9b2c3d-..."
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs font-mono placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingConv || !convId.trim()}
              className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {loadingConv ? 'Carregando...' : 'Carregar e Abrir'}
            </button>
          </form>

          {loadError && (
            <div className="mt-3 rounded-md bg-red-50 p-2 border border-red-100">
              <p className="text-[11px] font-medium text-red-700">✗ {loadError}</p>
            </div>
          )}
          {loadSuccess && (
            <div className="mt-3 rounded-md bg-emerald-50 p-2 border border-emerald-100">
              <p className="text-[11px] font-medium text-emerald-700">✓ Conversa carregada e selecionada!</p>
            </div>
          )}
        </div>

        {/* Tool 2: Search WABAs & Numbers */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Inspecionar Contas de Cliente
          </h3>
          <form onSubmit={handleSearchClient} className="space-y-3">
            <div>
              <label htmlFor="clientInput" className="block text-[11px] font-medium text-gray-500 mb-1">
                UUID ou Nome do Cliente
              </label>
              <input
                id="clientInput"
                type="text"
                value={clientInput}
                onChange={(e) => setClientInput(e.target.value)}
                placeholder="Ex: Nome do cliente ou UUID"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-xs placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingClient || !clientInput.trim()}
              className="inline-flex w-full items-center justify-center rounded-md bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {loadingClient ? 'Buscando...' : 'Buscar Contas'}
            </button>
          </form>

          {clientError && (
            <div className="mt-3 rounded-md bg-red-50 p-2 border border-red-100">
              <p className="text-[11px] font-medium text-red-700">✗ {clientError}</p>
            </div>
          )}

          {/* Results section */}
          {(!loadingClient && (searchProfiles.length > 0 || searchAccounts.length > 0)) && (
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
              {/* Profiles matched */}
              {searchProfiles.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Perfis Encontrados ({searchProfiles.length})
                  </p>
                  <ul className="divide-y divide-gray-100 rounded-md border border-gray-100 bg-gray-50 p-1">
                    {searchProfiles.map((p) => (
                      <li key={p.id} className="flex flex-col p-1.5 text-[11px] hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">{p.name || 'Sem nome'}</span>
                          <CopyButton text={p.id} title="Copiar ID do Usuário" />
                        </div>
                        <span className="font-mono text-[9px] text-gray-400 mt-0.5 truncate">{p.id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Accounts and numbers */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Contas de WhatsApp (WABAs) ({searchAccounts.length})
                </p>
                {searchAccounts.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Nenhuma conta de WhatsApp vinculada a este cliente.</p>
                ) : (
                  <div className="space-y-3">
                    {searchAccounts.map((acc) => (
                      <div key={acc.id} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-gray-800 truncate" title={acc.display_name || ''}>
                              {acc.display_name || 'Conta sem nome'}
                            </p>
                            {acc.waba_id && (
                              <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                                <span className="font-bold text-gray-400">WABA:</span>
                                <code className="font-mono text-gray-600 bg-gray-150 px-1 rounded">{acc.waba_id}</code>
                                <CopyButton text={acc.waba_id} title="Copiar WABA ID" />
                              </div>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                              acc.status === 'active'
                                ? 'bg-green-150 text-green-700'
                                : 'bg-red-150 text-red-700'
                            }`}
                          >
                            {acc.status}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-gray-400">
                          <span>Owner ID:</span>
                          <span className="font-mono truncate max-w-[120px]">{acc.owner_id}</span>
                          <CopyButton text={acc.owner_id} title="Copiar Owner ID" />
                        </div>

                        {/* Phone numbers under this account */}
                        <div className="mt-3 border-t border-gray-100 pt-2 space-y-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                            Números Conectados ({acc.whatsapp_phone_numbers.length})
                          </p>
                          {acc.whatsapp_phone_numbers.length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic">Nenhum número.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {acc.whatsapp_phone_numbers.map((num) => (
                                <li key={num.id} className="rounded border border-gray-100 bg-white p-2">
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-semibold text-gray-800 truncate">
                                        {num.display_phone_number || 'Sem número'}
                                      </p>
                                      {num.verified_name && (
                                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                          {num.verified_name}
                                        </p>
                                      )}
                                      <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px]">
                                        {num.quality_rating && (
                                          <span
                                            className={`rounded px-1 py-0.2 font-medium ${
                                              num.quality_rating === 'GREEN'
                                                ? 'bg-green-100 text-green-800'
                                                : num.quality_rating === 'YELLOW'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-red-100 text-red-800'
                                            }`}
                                          >
                                            {num.quality_rating}
                                          </span>
                                        )}
                                        {num.platform_type && (
                                          <span className="bg-gray-100 text-gray-600 rounded px-1 py-0.2">
                                            {num.platform_type}
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-400">
                                        <span>Phone ID:</span>
                                        <code className="font-mono text-gray-500 bg-gray-50 px-0.5 rounded">
                                          {num.phone_number_id}
                                        </code>
                                        <CopyButton text={num.phone_number_id} title="Copiar Phone Number ID" />
                                      </div>
                                    </div>
                                    <span
                                      className={`rounded px-1 py-0.2 text-[9px] font-medium shrink-0 ${
                                        num.status === 'VERIFIED'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {num.status}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatDebugDrawer = ({
  open,
  onClose,
  onLoadConversation,
}: {
  open: boolean;
  onClose: () => void;
  onLoadConversation: (conversation: Conversation) => void;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <DrawerContent onClose={onClose} onLoadConversation={onLoadConversation} />
      </div>
    </div>,
    document.body
  );
};
