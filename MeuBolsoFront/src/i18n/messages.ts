import type { AppLocale } from './localeStorage'

/** Chaves estáveis para UI e erros (pt-BR / en). */
export const M = {
  // API / rede
  ERR_UNEXPECTED: { ptBR: 'Erro inesperado', en: 'Unexpected error' },
  ERR_INVALID_RESPONSE: { ptBR: 'Resposta inválida do servidor', en: 'Invalid server response' },
  ERR_SESSION_EXPIRED: { ptBR: 'Sessão expirada', en: 'Session expired' },
  ERR_FINANCE_LOAD: { ptBR: 'Não foi possível carregar os dados financeiros', en: 'Could not load financial data' },
  ERR_TX_LIST_LOAD: { ptBR: 'Não foi possível carregar as transações', en: 'Could not load transactions' },
  ERR_SUMMARY_LOAD: { ptBR: 'Não foi possível carregar o resumo', en: 'Could not load summary' },
  ERR_AUTH_NOW: { ptBR: 'Não foi possível autenticar agora', en: 'Could not sign in right now' },
  ERR_SAVE_TX: { ptBR: 'Erro ao salvar transação', en: 'Could not save transaction' },
  ERR_DELETE_TX: { ptBR: 'Erro ao excluir transação', en: 'Could not delete transaction' },
  ERR_SAVE_CATEGORY: { ptBR: 'Erro ao salvar categoria', en: 'Could not save category' },
  ERR_DELETE_CATEGORY: { ptBR: 'Erro ao excluir categoria', en: 'Could not delete category' },
  ERR_SAVE_GOAL: { ptBR: 'Erro ao salvar objetivo', en: 'Could not save goal' },
  ERR_CONTRIBUTION: { ptBR: 'Erro ao registrar aporte', en: 'Could not record contribution' },
  ERR_DELETE_GOAL: { ptBR: 'Erro ao excluir objetivo', en: 'Could not delete goal' },
  ERR_ENV_NAME: { ptBR: 'Informe um nome para o ambiente', en: 'Enter an environment name' },

  // Backend — auth
  API_INVALID_CREDENTIALS: { ptBR: 'E-mail ou senha inválidos.', en: 'Invalid email or password.' },
  API_EMAIL_TAKEN: { ptBR: 'Este e-mail já está cadastrado.', en: 'This email is already registered.' },
  API_INVALID_REFRESH: { ptBR: 'Token de atualização inválido', en: 'Invalid refresh token' },
  API_REFRESH_EXPIRED: { ptBR: 'Token de atualização expirado', en: 'Refresh token expired' },
  API_USER_NOT_FOUND: { ptBR: 'Utilizador não encontrado', en: 'User not found' },

  // Backend — finance / goals / environment (mensagens exatas do servidor)
  API_CATEGORY_NOT_FOUND: { ptBR: 'Categoria não encontrada', en: 'Category not found' },
  API_CATEGORY_DUPLICATE: { ptBR: 'Já existe uma categoria com este nome', en: 'A category with this name already exists' },
  API_CATEGORY_HAS_TX: {
    ptBR: 'Não é possível excluir: existem transações nesta categoria.',
    en: 'Cannot delete: there are transactions in this category.',
  },
  API_INVALID_CATEGORY: { ptBR: 'Categoria inválida', en: 'Invalid category' },
  API_TYPE_MISMATCH: {
    ptBR: 'O tipo não corresponde à categoria',
    en: 'Transaction type must match category type',
  },
  API_TX_NOT_FOUND: { ptBR: 'Transação não encontrada', en: 'Transaction not found' },
  API_BUDGET_EXPENSE_ONLY: {
    ptBR: 'Orçamento só para despesas',
    en: 'Budget only allowed for DESPESA categories',
  },
  API_INVALID_MONTH: {
    ptBR: 'Formato de mês inválido. Use AAAA-MM',
    en: 'Invalid month format. Use YYYY-MM',
  },
  API_DATE_RANGE: {
    ptBR: 'A data inicial deve ser anterior ou igual à final',
    en: 'dateFrom must be before or equal to dateTo',
  },
  API_INVALID_OCCURRED_ON: {
    ptBR: 'Formato de data inválido. Use AAAA-MM-DD',
    en: 'Invalid occurredOn format. Use YYYY-MM-DD',
  },
  API_TX_DATE_RANGE: {
    ptBR: 'A data da transação deve estar entre 2000-01-01 e 2200-12-31',
    en: 'Transaction date must be between 2000-01-01 and 2200-12-31',
  },
  API_GOAL_NOT_FOUND: { ptBR: 'Meta não encontrada', en: 'Goal not found' },
  API_GOAL_ARCHIVED_CONTRIB: {
    ptBR: 'Não é possível aportar em uma meta arquivada',
    en: 'Cannot contribute to an archived goal',
  },
  API_GOAL_DUE_REQUIRED: { ptBR: 'Informe o prazo da meta', en: 'Enter the goal deadline' },
  API_GOAL_DUE_PAST: {
    ptBR: 'O prazo da meta não pode ser no passado',
    en: 'The goal deadline cannot be in the past',
  },
  API_GOAL_DATE_FORMAT: {
    ptBR: 'Formato de data inválido. Use AAAA-MM-DD',
    en: 'Invalid date format. Use YYYY-MM-DD',
  },
  API_CONTRIB_FUTURE: {
    ptBR: 'A data do aporte não pode ser no futuro',
    en: 'Contribution date cannot be in the future',
  },
  API_CONTRIB_AFTER_DUE: {
    ptBR: 'A data do aporte não pode passar do prazo da meta',
    en: 'Contribution date cannot be after the goal deadline',
  },
  API_ENV_USER_NOT_FOUND: { ptBR: 'Utilizador não encontrado', en: 'User not found' },
  API_ENV_MEMBER_NOT_FOUND: { ptBR: 'Membro não encontrado', en: 'Member not found' },
  API_ENV_CREATOR_REMOVE: {
    ptBR: 'O criador do ambiente não pode ser removido',
    en: 'The environment creator cannot be removed',
  },
  API_ENV_NO_EDIT: {
    ptBR: 'Não tem permissão para editar este ambiente',
    en: 'You do not have permission to edit this environment',
  },
  API_ENV_ACCESS_DENIED: { ptBR: 'Acesso ao ambiente negado', en: 'Environment access denied' },
  API_ENV_ADMIN_ONLY: {
    ptBR: 'Apenas administradores podem alterar este ambiente',
    en: 'Only admins can change this environment',
  },
  API_VALIDATION_FAILED: { ptBR: 'Validação falhou', en: 'Validation failed' },
  API_BAD_REQUEST: { ptBR: 'Requisição inválida', en: 'Invalid request' },
  API_DUPLICATE_RECORD: {
    ptBR: 'Registo duplicado ou inválido',
    en: 'Duplicate or invalid record',
  },
  API_SERVER_ERROR: { ptBR: 'Erro inesperado no servidor', en: 'Unexpected server error' },
  API_RATE_LIMIT: {
    ptBR: 'Muitas tentativas de login. Tente novamente mais tarde.',
    en: 'Too many login attempts. Please try again later.',
  },

  // Validação cliente — período
  ERR_DATE_FROM_AFTER_TO: {
    ptBR: 'A data inicial não pode ser maior que a final.',
    en: 'The start date cannot be after the end date.',
  },

  // Login — campos
  AUTH_NAME_MIN: { ptBR: 'Informe um nome com pelo menos 2 caracteres.', en: 'Enter a name with at least 2 characters.' },
  AUTH_NAME_MAX: { ptBR: 'O nome deve ter no máximo 120 caracteres.', en: 'Name must be at most 120 characters.' },
  AUTH_EMAIL_REQUIRED: { ptBR: 'Informe seu e-mail.', en: 'Enter your email.' },
  AUTH_EMAIL_INVALID: { ptBR: 'Informe um e-mail válido.', en: 'Enter a valid email.' },
  AUTH_EMAIL_MAX: { ptBR: 'O e-mail deve ter no máximo 180 caracteres.', en: 'Email must be at most 180 characters.' },
  AUTH_PASSWORD_REQUIRED: { ptBR: 'Informe sua senha.', en: 'Enter your password.' },
  AUTH_PASSWORD_MIN: { ptBR: 'A senha deve ter pelo menos 8 caracteres.', en: 'Password must be at least 8 characters.' },
  AUTH_PASSWORD_MAX: { ptBR: 'A senha deve ter no máximo 80 caracteres.', en: 'Password must be at most 80 characters.' },
  AUTH_REVIEW_FIELDS: {
    ptBR: 'Revise os campos destacados para continuar.',
    en: 'Review the highlighted fields to continue.',
  },
  AUTH_FIELD_NAME: {
    ptBR: 'Informe um nome entre 2 e 120 caracteres.',
    en: 'Enter a name between 2 and 120 characters.',
  },
  AUTH_FIELD_EMAIL: {
    ptBR: 'Informe um e-mail válido com até 180 caracteres.',
    en: 'Enter a valid email up to 180 characters.',
  },
  AUTH_FIELD_PASSWORD: {
    ptBR: 'A senha deve ter entre 8 e 80 caracteres.',
    en: 'Password must be between 8 and 80 characters.',
  },

  // Transações / categorias / objetivos — formulário (cliente)
  ERR_AMOUNT_INVALID: { ptBR: 'Valor inválido', en: 'Invalid amount' },
  ERR_AMOUNT_MAX: { ptBR: 'Valor excede o limite permitido', en: 'Amount exceeds the allowed limit' },
  ERR_CATEGORY_REQUIRED: { ptBR: 'Selecione uma categoria', en: 'Select a category' },
  ERR_DATE_INVALID: { ptBR: 'Data inválida', en: 'Invalid date' },
  ERR_DATE_RANGE_CLIENT: {
    ptBR: 'Data deve estar entre 2000-01-01 e 2200-12-31',
    en: 'Date must be between 2000-01-01 and 2200-12-31',
  },
  ERR_DESC_MAX_240: {
    ptBR: 'Descrição deve ter no máximo 240 caracteres',
    en: 'Description must be at most 240 characters',
  },
  ERR_CATEGORY_NAME_SHORT: {
    ptBR: 'Nome da categoria inválido',
    en: 'Invalid category name',
  },
  ERR_CATEGORY_NAME_MAX: {
    ptBR: 'Nome da categoria deve ter no máximo 80 caracteres',
    en: 'Category name must be at most 80 characters',
  },
  ERR_GOAL_NAME_REQUIRED: { ptBR: 'Informe um nome para a meta', en: 'Enter a name for the goal' },
  ERR_GOAL_NAME_MAX: {
    ptBR: 'Nome da meta deve ter no máximo 120 caracteres',
    en: 'Goal name must be at most 120 characters',
  },
  ERR_GOAL_DESC_MAX: {
    ptBR: 'Descrição deve ter no máximo 280 caracteres',
    en: 'Description must be at most 280 characters',
  },
  ERR_TARGET_REQUIRED: { ptBR: 'Informe um valor alvo válido', en: 'Enter a valid target amount' },
  ERR_TARGET_MAX: { ptBR: 'Valor alvo excede o limite permitido', en: 'Target amount exceeds the limit' },
  ERR_DUE_REQUIRED: { ptBR: 'Informe o prazo da meta', en: 'Enter the goal deadline' },
  ERR_DUE_INVALID: { ptBR: 'Prazo da meta inválido', en: 'Invalid goal deadline' },
  ERR_DUE_PAST: { ptBR: 'O prazo da meta não pode ser no passado', en: 'The goal deadline cannot be in the past' },
  ERR_CONTRIB_AMOUNT: { ptBR: 'Informe um aporte válido', en: 'Enter a valid contribution' },
  ERR_CONTRIB_MAX: { ptBR: 'Aporte excede o limite permitido', en: 'Contribution exceeds the limit' },
  ERR_CONTRIB_DATE_REQUIRED: { ptBR: 'Informe a data do aporte', en: 'Enter the contribution date' },
  ERR_CONTRIB_DATE_INVALID: { ptBR: 'Data do aporte inválida', en: 'Invalid contribution date' },
  ERR_NOTE_MAX_180: {
    ptBR: 'Observação deve ter no máximo 180 caracteres',
    en: 'Note must be at most 180 characters',
  },

  // Repositório local (mesmos conceitos da API)
  LOCAL_FIELD_POSITIVE: { ptBR: 'deve ser maior que zero', en: 'must be greater than zero' },
  LOCAL_FIELD_MAX: { ptBR: 'excede o limite permitido', en: 'exceeds the allowed limit' },
  LOCAL_FIELD_NON_NEG: { ptBR: 'deve ser maior ou igual a zero', en: 'must be greater than or equal to zero' },
  LOCAL_DATE_INVALID: { ptBR: 'Data inválida', en: 'Invalid date' },
  LOCAL_DATE_RANGE: {
    ptBR: 'Data deve estar entre 2000-01-01 e 2200-12-31',
    en: 'Date must be between 2000-01-01 and 2200-12-31',
  },
  LOCAL_GOAL_DUE_REQUIRED: { ptBR: 'Informe o prazo da meta', en: 'Enter the goal deadline' },
  LOCAL_GOAL_DUE_INVALID: { ptBR: 'Prazo da meta inválido', en: 'Invalid goal deadline' },
  LOCAL_GOAL_DUE_PAST: {
    ptBR: 'O prazo da meta não pode ser no passado',
    en: 'The goal deadline cannot be in the past',
  },
  LOCAL_GOAL_NAME_REQUIRED: { ptBR: 'Informe um nome para a meta', en: 'Enter a name for the goal' },
  LOCAL_GOAL_NAME_MAX: {
    ptBR: 'Nome da meta deve ter no máximo 120 caracteres',
    en: 'Goal name must be at most 120 characters',
  },
  LOCAL_GOAL_DESC_MAX: {
    ptBR: 'Descrição deve ter no máximo 280 caracteres',
    en: 'Description must be at most 280 characters',
  },
  LOCAL_GOAL_ARCHIVED: {
    ptBR: 'Não é possível aportar em uma meta arquivada',
    en: 'Cannot contribute to an archived goal',
  },
  LOCAL_CONTRIB_DATE_INVALID: { ptBR: 'Data do aporte inválida', en: 'Invalid contribution date' },
  LOCAL_CONTRIB_FUTURE: {
    ptBR: 'A data do aporte não pode ser no futuro',
    en: 'Contribution date cannot be in the future',
  },
  LOCAL_CONTRIB_AFTER_DUE: {
    ptBR: 'A data do aporte não pode passar do prazo da meta',
    en: 'Contribution date cannot be after the goal deadline',
  },
  LOCAL_NOTE_MAX: {
    ptBR: 'Observação deve ter no máximo 180 caracteres',
    en: 'Note must be at most 180 characters',
  },
  LOCAL_TYPE_INVALID: { ptBR: 'Tipo inválido', en: 'Invalid type' },
  LOCAL_CATEGORY_NAME_LEN: {
    ptBR: 'Nome da categoria deve ter entre 2 e 80 caracteres',
    en: 'Category name must be between 2 and 80 characters',
  },
  LOCAL_ICON_MAX: { ptBR: 'Ícone deve ter no máximo 16 caracteres', en: 'Icon must be at most 16 characters' },
  LOCAL_CATEGORY_NOT_FOUND: { ptBR: 'Categoria não encontrada', en: 'Category not found' },
  LOCAL_CATEGORY_DUP: {
    ptBR: 'Já existe uma categoria com este nome',
    en: 'A category with this name already exists',
  },
  LOCAL_CATEGORY_DELETE_TX: {
    ptBR: 'Não é possível excluir: existem transações nesta categoria.',
    en: 'Cannot delete: there are transactions in this category.',
  },
  LOCAL_DESC_MAX: {
    ptBR: 'Descrição deve ter no máximo 240 caracteres',
    en: 'Description must be at most 240 characters',
  },
  LOCAL_CATEGORY_INVALID: { ptBR: 'Categoria inválida', en: 'Invalid category' },
  LOCAL_TYPE_CATEGORY_MISMATCH: {
    ptBR: 'Tipo não corresponde à categoria',
    en: 'Type does not match the category',
  },
  LOCAL_TX_NOT_FOUND: { ptBR: 'Transação não encontrada', en: 'Transaction not found' },
  LOCAL_MONTH_INVALID: { ptBR: 'Mês inválido', en: 'Invalid month' },
  LOCAL_BUDGET_EXPENSE: {
    ptBR: 'Orçamento só para despesas',
    en: 'Budget is only for expenses',
  },
  LOCAL_GOAL_NOT_FOUND: { ptBR: 'Meta não encontrada', en: 'Goal not found' },

  // Ambiente — validação cliente
  ERR_ENV_NAME_MAX: {
    ptBR: 'Nome do ambiente deve ter no máximo 120 caracteres',
    en: 'Environment name must be at most 120 characters',
  },
  ERR_ENV_DESC_MAX: {
    ptBR: 'Descrição deve ter no máximo 280 caracteres',
    en: 'Description must be at most 280 characters',
  },
  ERR_ENV_CREATE: { ptBR: 'Erro ao criar ambiente', en: 'Could not create environment' },
  ERR_SHARE_EMAIL_INVALID: {
    ptBR: 'Informe um e-mail válido para compartilhar',
    en: 'Enter a valid email to share with',
  },
  ERR_SHARE_EMAIL_MAX: {
    ptBR: 'E-mail deve ter no máximo 180 caracteres',
    en: 'Email must be at most 180 characters',
  },
  ERR_SHARE_ADD: { ptBR: 'Erro ao adicionar membro', en: 'Could not add member' },

  // UI — menu (opcional)
  UI_LANGUAGE: { ptBR: 'Idioma', en: 'Language' },
} as const

export type MessageKey = keyof typeof M

export function translate(key: MessageKey, locale: AppLocale): string {
  const row = M[key]
  const lang = locale === 'en' ? 'en' : 'ptBR'
  return row[lang]
}

/** Mensagem da API (texto exato) → chave do catálogo. */
export const SERVER_MESSAGE_TO_KEY: Record<string, MessageKey> = {
  'Sessão expirada': 'ERR_SESSION_EXPIRED',
  'Invalid credentials': 'API_INVALID_CREDENTIALS',
  'Email already registered': 'API_EMAIL_TAKEN',
  'Invalid refresh token': 'API_INVALID_REFRESH',
  'Refresh token expired': 'API_REFRESH_EXPIRED',
  'User not found': 'API_USER_NOT_FOUND',
  'Categoria não encontrada': 'API_CATEGORY_NOT_FOUND',
  'Já existe uma categoria com este nome': 'API_CATEGORY_DUPLICATE',
  'Não é possível excluir: existem transações nesta categoria.': 'API_CATEGORY_HAS_TX',
  'Invalid category': 'API_INVALID_CATEGORY',
  'Transaction type must match category type': 'API_TYPE_MISMATCH',
  'Transação não encontrada': 'API_TX_NOT_FOUND',
  'Budget only allowed for DESPESA categories': 'API_BUDGET_EXPENSE_ONLY',
  'Invalid month format. Use YYYY-MM': 'API_INVALID_MONTH',
  'dateFrom must be before or equal to dateTo': 'API_DATE_RANGE',
  'Invalid occurredOn format. Use YYYY-MM-DD': 'API_INVALID_OCCURRED_ON',
  'Transaction date must be between 2000-01-01 and 2200-12-31': 'API_TX_DATE_RANGE',
  'Meta não encontrada': 'API_GOAL_NOT_FOUND',
  'Não é possível aportar em uma meta arquivada': 'API_GOAL_ARCHIVED_CONTRIB',
  'Informe o prazo da meta': 'API_GOAL_DUE_REQUIRED',
  'O prazo da meta não pode ser no passado': 'API_GOAL_DUE_PAST',
  'Invalid date format. Use YYYY-MM-DD': 'API_GOAL_DATE_FORMAT',
  'A data do aporte não pode ser no futuro': 'API_CONTRIB_FUTURE',
  'A data do aporte não pode passar do prazo da meta': 'API_CONTRIB_AFTER_DUE',
  'Usuário não encontrado': 'API_ENV_USER_NOT_FOUND',
  'Membro não encontrado': 'API_ENV_MEMBER_NOT_FOUND',
  'O criador do ambiente não pode ser removido': 'API_ENV_CREATOR_REMOVE',
  'Você não tem permissão para editar este ambiente': 'API_ENV_NO_EDIT',
  'Acesso ao ambiente negado': 'API_ENV_ACCESS_DENIED',
  'Apenas admins podem alterar este ambiente': 'API_ENV_ADMIN_ONLY',
  'Validation failed': 'API_VALIDATION_FAILED',
  'Requisição inválida': 'API_BAD_REQUEST',
  'Registro duplicado ou inválido': 'API_DUPLICATE_RECORD',
  'Unexpected server error': 'API_SERVER_ERROR',
  'Muitas tentativas de login. Tente novamente mais tarde.': 'API_RATE_LIMIT',
}

/** Mensagens do repositório local / throws (PT) → chave. */
export const LOCAL_THROW_TO_KEY: Record<string, MessageKey> = {
  'Data inválida': 'ERR_DATE_INVALID',
  'Data deve estar entre 2000-01-01 e 2200-12-31': 'ERR_DATE_RANGE_CLIENT',
  'Informe o prazo da meta': 'ERR_DUE_REQUIRED',
  'Prazo da meta inválido': 'ERR_DUE_INVALID',
  'O prazo da meta não pode ser no passado': 'ERR_DUE_PAST',
  'Informe um nome para a meta': 'ERR_GOAL_NAME_REQUIRED',
  'Nome da meta deve ter no máximo 120 caracteres': 'ERR_GOAL_NAME_MAX',
  'Descrição deve ter no máximo 280 caracteres': 'ERR_GOAL_DESC_MAX',
  'Não é possível aportar em uma meta arquivada': 'API_GOAL_ARCHIVED_CONTRIB',
  'Data do aporte inválida': 'ERR_CONTRIB_DATE_INVALID',
  'A data do aporte não pode ser no futuro': 'API_CONTRIB_FUTURE',
  'A data do aporte não pode passar do prazo da meta': 'API_CONTRIB_AFTER_DUE',
  'Observação deve ter no máximo 180 caracteres': 'ERR_NOTE_MAX_180',
  'Tipo inválido': 'LOCAL_TYPE_INVALID',
  'Nome da categoria deve ter entre 2 e 80 caracteres': 'LOCAL_CATEGORY_NAME_LEN',
  'Ícone deve ter no máximo 16 caracteres': 'LOCAL_ICON_MAX',
  'Categoria não encontrada': 'API_CATEGORY_NOT_FOUND',
  'Já existe uma categoria com este nome': 'API_CATEGORY_DUPLICATE',
  'Não é possível excluir: existem transações nesta categoria.': 'API_CATEGORY_HAS_TX',
  'Descrição deve ter no máximo 240 caracteres': 'ERR_DESC_MAX_240',
  'Categoria inválida': 'API_INVALID_CATEGORY',
  'Tipo não corresponde à categoria': 'LOCAL_TYPE_CATEGORY_MISMATCH',
  'Transação não encontrada': 'API_TX_NOT_FOUND',
  'Mês inválido': 'LOCAL_MONTH_INVALID',
  'Orçamento só para despesas': 'API_BUDGET_EXPENSE_ONLY',
  'Meta não encontrada': 'API_GOAL_NOT_FOUND',
  'Valor inválido': 'ERR_AMOUNT_INVALID',
  'Valor excede o limite permitido': 'ERR_AMOUNT_MAX',
  'Selecione uma categoria': 'ERR_CATEGORY_REQUIRED',
  'Informe um aporte válido': 'ERR_CONTRIB_AMOUNT',
  'Aporte excede o limite permitido': 'ERR_CONTRIB_MAX',
  'Informe a data do aporte': 'ERR_CONTRIB_DATE_REQUIRED',
  'Nome da categoria inválido': 'ERR_CATEGORY_NAME_SHORT',
  'Nome da categoria deve ter no máximo 80 caracteres': 'ERR_CATEGORY_NAME_MAX',
  'Informe um valor alvo válido': 'ERR_TARGET_REQUIRED',
  'Valor alvo excede o limite permitido': 'ERR_TARGET_MAX',
}

export function resolveMessageKeyFromServerMessage(message: string): MessageKey | null {
  const trimmed = message.trim()
  return SERVER_MESSAGE_TO_KEY[trimmed] ?? null
}

export function resolveMessageKeyFromLocalThrow(message: string): MessageKey | null {
  const trimmed = message.trim()
  return LOCAL_THROW_TO_KEY[trimmed] ?? null
}

/** Reconhece mensagem já traduzida (pt ou en) e devolve a chave. */
export function findMessageKeyFromLocalizedText(msg: string): MessageKey | null {
  const t = msg.trim()
  const fromMaps = SERVER_MESSAGE_TO_KEY[t] ?? LOCAL_THROW_TO_KEY[t]
  if (fromMaps) return fromMaps
  for (const key of Object.keys(M) as MessageKey[]) {
    const row = M[key]
    if (row.ptBR === t || row.en === t) return key
  }
  return null
}

/** Traduz erro HTTP + mensagem do corpo (ou fallback). */
export function localizeApiError(status: number, serverMessage: string, locale: AppLocale): string {
  const key = resolveMessageKeyFromServerMessage(serverMessage)
  if (key) return translate(key, locale)
  if (status === 401) return translate('API_INVALID_CREDENTIALS', locale)
  if (status === 503 || status === 502) return translate('ERR_UNEXPECTED', locale)
  if (serverMessage.trim()) return serverMessage
  return translate('ERR_UNEXPECTED', locale)
}

export function localizeThrownErrorMessage(message: string, locale: AppLocale): string {
  const key = findMessageKeyFromLocalizedText(message)
  if (key) return translate(key, locale)
  return message
}
