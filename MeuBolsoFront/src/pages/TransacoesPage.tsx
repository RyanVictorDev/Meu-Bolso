import { useEffect, useMemo, useState } from 'react'
import {
  formatBRLFromCents,
  formatBRDate,
  formatCurrencyInput,
  formatCurrencyInputFromCents,
  isValidISODate,
  MAX_AMOUNT_CENTS,
  parseAmountToCents,
} from '../domain/finance'
import type { Transaction, TransactionType } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import { useEnvironment } from '../services/useEnvironment'
import Button from '../components/ui/Button'
import ActionIconButton from '../components/ui/ActionIconButton'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import DateInput from '../components/ui/DateInput'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import Snackbar from '../components/ui/Snackbar'
import PageLoader from '../components/PageLoader'
import type { SnackbarTone } from '../components/ui/Snackbar'

const TRANSACTION_DESCRIPTION_MAX_LENGTH = 240
const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 1000

function todayISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function TransacoesPage() {
  const currentMonth = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }, [])
  const currentMonthStart = useMemo(() => `${currentMonth}-01`, [currentMonth])

  const { loading, data, listTransactions, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const { activeEnvironmentId, canEdit } = useEnvironment()
  const [open, setOpen] = useState(false)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState(currentMonthStart)
  const [dateTo, setDateTo] = useState(todayISO())
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  const [type, setType] = useState<TransactionType>('DESPESA')
  const [categoryId, setCategoryId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ tone: SnackbarTone; message: string } | null>(null)

  const showSnackbar = (tone: SnackbarTone, message: string) => {
    setSnackbar({ tone, message })
  }

  const categoriesForType = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name))
  }, [data, type])

  const loadTransactions = async (nextPage = page, options?: { ignoreGlobalLoading?: boolean }) => {
    if ((!options?.ignoreGlobalLoading && loading) || !data || periodError) return
    setTransactionsLoading(true)
    setTransactionsError(null)
    try {
      const result = await listTransactions({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: debouncedSearch.trim() || undefined,
        page: nextPage,
        size: PAGE_SIZE,
      })
      setTransactions(result.content)
      setTotalElements(result.totalElements)
      setTotalPages(result.totalPages)
      setPage(result.page)
    } catch (e) {
      setTransactionsError(e instanceof Error ? e.message : 'Não foi possível carregar as transações')
      setTransactions([])
      setTotalElements(0)
      setTotalPages(0)
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    setPage(0)
  }, [dateFrom, dateTo, debouncedSearch, activeEnvironmentId])

  useEffect(() => {
    void loadTransactions(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, dateFrom, dateTo, debouncedSearch, activeEnvironmentId, loading, data])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeoutId)
  }, [search])

  useEffect(() => {
    if (!open) return
    if (categoryId) return
    if (categoriesForType.length === 0) return
    setCategoryId(categoriesForType[0].id)
  }, [open, categoryId, categoriesForType])

  const periodError = dateFrom && dateTo && dateFrom > dateTo ? 'A data inicial não pode ser maior que a final.' : null
  const periodLabel = useMemo(() => {
    if (dateFrom && dateTo) return `${formatBRDate(dateFrom)} até ${formatBRDate(dateTo)}`
    if (dateFrom) return `A partir de ${formatBRDate(dateFrom)}`
    if (dateTo) return `Até ${formatBRDate(dateTo)}`
    return 'Todos os períodos'
  }, [dateFrom, dateTo])

  const resetToCurrentMonth = () => {
    setDateFrom(currentMonthStart)
    setDateTo(todayISO())
  }

  const clearPeriod = () => {
    setDateFrom('')
    setDateTo('')
  }

  const resetForm = () => {
    setType('DESPESA')
    setCategoryId('')
    setDescription('')
    setAmount('')
    setOccurredOn(todayISO())
    setError(null)
    setEditingId(null)
  }

  const openForCreate = () => {
    resetForm()
    setOpen(true)
  }

  const openForEdit = (tx: NonNullable<typeof data>['transactions'][number]) => {
    setEditingId(tx.id)
    setType(tx.type)
    setCategoryId(tx.categoryId)
    setDescription(tx.description ?? '')
    setAmount(formatCurrencyInputFromCents(tx.amountCents))
    setOccurredOn(tx.occurredOn)
    setError(null)
    setDetailsId(null)
    setOpen(true)
  }

  const submit = async () => {
    setError(null)
    try {
      const cents = parseAmountToCents(amount)
      if (!cents) throw new Error('Valor inválido')
      if (cents > MAX_AMOUNT_CENTS) throw new Error('Valor excede o limite permitido')
      if (!categoryId) throw new Error('Selecione uma categoria')
      if (!occurredOn) throw new Error('Data inválida')
      if (!isValidISODate(occurredOn)) throw new Error('Data inválida')
      if (occurredOn < '2000-01-01' || occurredOn > '2200-12-31') {
        throw new Error('Data deve estar entre 2000-01-01 e 2200-12-31')
      }
      if (description.trim().length > TRANSACTION_DESCRIPTION_MAX_LENGTH) {
        throw new Error('Descrição deve ter no máximo 240 caracteres')
      }

      const payload = {
        type,
        categoryId,
        description: description.trim() || undefined,
        amountCents: cents,
        occurredOn,
      }

      const wasEditing = Boolean(editingId)
      if (editingId) {
        await updateTransaction(editingId, payload)
      } else {
        await addTransaction(payload)
      }

      setOpen(false)
      resetForm()
      await loadTransactions(wasEditing ? page : 0, { ignoreGlobalLoading: true })
      showSnackbar('success', wasEditing ? 'Transação atualizada com sucesso.' : 'Transação criada com sucesso.')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao salvar transação'
      setError(message)
      showSnackbar('error', message)
    }
  }

  const confirmDeleteTransaction = async () => {
    if (!deleteCandidateId || deleteLoading) return
    const deletedId = deleteCandidateId
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteTransaction(deletedId)
      const nextPage = transactions.length <= 1 && page > 0 ? page - 1 : page
      await loadTransactions(nextPage, { ignoreGlobalLoading: true })
      setDeleteCandidateId(null)
      if (detailsId === deletedId) setDetailsId(null)
      showSnackbar('success', 'Transação excluída com sucesso.')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao excluir transação'
      setDeleteError(message)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Gerencie suas receitas e despesas</h1>
        <div className="card">
          <PageLoader />
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="pageTitle">Gerencie suas receitas e despesas</h1>
      <div className="pageSubtitle">Período: {periodLabel}</div>

      <div className="toolbar">
        <Button
          variant="primary"
          onClick={() => {
            openForCreate()
          }}
          disabled={!canEdit}
        >
          Nova Transação
        </Button>
      </div>

      <div className="dateFilterCard">
        <div className="dateFilterHeader">
          <div>
            <div className="dateFilterTitle">Filtrar transações</div>
            <div className="dateFilterSubtitle">{totalElements} transação{totalElements === 1 ? '' : 'ões'} no período</div>
          </div>
          <div className="dateFilterActions">
            <button type="button" className="smallBtn" onClick={resetToCurrentMonth}>
              Mês atual
            </button>
            <button type="button" className="smallBtn" onClick={clearPeriod}>
              Limpar
            </button>
          </div>
        </div>
        <div className="dateFilterFields">
          <div className="field dateFilterSearch">
            <div className="label">Buscar</div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Descrição, categoria, usuário ou valor"
            />
          </div>
          <div className="field dateFilterDate">
            <div className="label">De</div>
            <DateInput value={dateFrom} onChange={setDateFrom} max={dateTo || undefined} />
          </div>
          <div className="field dateFilterDate">
            <div className="label">Até</div>
            <DateInput value={dateTo} onChange={setDateTo} min={dateFrom || undefined} />
          </div>
        </div>
        {periodError ? <div className="fieldError">{periodError}</div> : null}
      </div>

      {periodError ? (
        <EmptyState>{periodError}</EmptyState>
      ) : transactionsError ? (
        <div className="emptyState" role="alert">
          {transactionsError}{' '}
          <button type="button" className="smallBtn" onClick={() => void loadTransactions(page)}>
            Tentar novamente
          </button>
        </div>
      ) : transactionsLoading ? (
        <div className="card">
          <PageLoader />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState>Nenhuma transação registrada. Clique em &quot;Nova Transação&quot; para começar.</EmptyState>
      ) : (
        <>
          <div className="list">
            {transactions.map((tx) => {
              const cat = data.categories.find((c) => c.id === tx.categoryId)
              const categoryName = cat?.name ?? 'Categoria'
              const labelPrefix = cat?.emoji ? `${cat.emoji} ` : ''
              return (
                <div className="row rowClickable" key={tx.id} onClick={() => setDetailsId(tx.id)} role="button" tabIndex={0}>
                  <div className="rowLabel">
                    <div className="rowName">
                      {tx.type === 'DESPESA' ? 'Despesa: ' : 'Receita: '}
                      {labelPrefix}
                      {categoryName}
                    </div>
                    <div className="rowHint">{tx.description ? tx.description : `Em ${formatBRDate(tx.occurredOn)}`}</div>
                  </div>
                  <div className="rowActions" onClick={(e) => e.stopPropagation()}>
                    <div className={tx.type === 'DESPESA' ? 'txAmountOut' : 'txAmountIn'}>
                      {tx.type === 'DESPESA' ? '-' : '+'}
                      {formatBRLFromCents(tx.amountCents)}
                    </div>
                    {canEdit ? (
                      <>
                        <ActionIconButton action="edit" onClick={() => openForEdit(tx)} aria-label="Editar transação" />
                        <ActionIconButton
                          action="delete"
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteCandidateId(tx.id)
                          }}
                          aria-label="Excluir transação"
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="toolbar" style={{ marginTop: 14 }}>
            <div className="muted" style={{ fontSize: 14 }}>
              Página {page + 1} de {Math.max(totalPages, 1)}
            </div>
            <div className="dateFilterActions">
              <button type="button" className="smallBtn" disabled={page <= 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                Anterior
              </button>
              <button
                type="button"
                className="smallBtn"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        </>
      )}

      {open ? (
        <Modal
          title={editingId ? 'Editar Transação' : 'Nova Transação'}
          onClose={() => {
            setOpen(false)
            resetForm()
          }}
        >
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Tipo</div>
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType)
                  setCategoryId('')
                }}
              >
                <option value="RECEITA">Receita</option>
                <option value="DESPESA">Despesa</option>
              </Select>
            </div>

            <div className="field">
              <div className="label">Categoria</div>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categoriesForType.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji} ${c.name}` : c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="fieldGrid">
            <div className="field">
              <div className="label">Valor (R$)</div>
              <Input
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
                required
              />
            </div>
            <div className="field">
              <div className="label">Data</div>
              <DateInput value={occurredOn} onChange={setOccurredOn} required />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="field">
            <div className="label">Descrição (opcional)</div>
            <Input
              placeholder="Ex: aluguel, salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={TRANSACTION_DESCRIPTION_MAX_LENGTH}
            />
          </div>

          {error ? (
            <div style={{ marginTop: 12 }} className="emptyState">
              {error}
            </div>
          ) : null}

          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              className="smallBtn"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </button>
            <button type="button" className="btn" onClick={() => void submit()}>
              Salvar
            </button>
          </div>
        </Modal>
      ) : null}

      {detailsId && data ? (
        <Modal title="Detalhes da Transação" onClose={() => setDetailsId(null)}>
          {(() => {
            const tx = transactions.find((item) => item.id === detailsId)
            if (!tx) return <EmptyState>Transação não encontrada.</EmptyState>
            const cat = data.categories.find((c) => c.id === tx.categoryId)
            return (
              <div className="detailsGrid">
                <div>
                  <span className="detailsLabel">Tipo</span>
                  <strong>{tx.type === 'RECEITA' ? 'Receita' : 'Despesa'}</strong>
                </div>
                <div>
                  <span className="detailsLabel">Valor</span>
                  <strong className={tx.type === 'RECEITA' ? 'txAmountIn' : 'txAmountOut'}>
                    {tx.type === 'DESPESA' ? '-' : '+'}
                    {formatBRLFromCents(tx.amountCents)}
                  </strong>
                </div>
                <div>
                  <span className="detailsLabel">Categoria</span>
                  <strong>{cat?.name ?? 'Categoria'}</strong>
                </div>
                <div>
                  <span className="detailsLabel">Data da transação</span>
                  <strong>{formatBRDate(tx.occurredOn)}</strong>
                </div>
                <div>
                  <span className="detailsLabel">Criada em</span>
                  <strong>{new Date(tx.createdAt).toLocaleString('pt-BR')}</strong>
                </div>
                <div>
                  <span className="detailsLabel">Registrada por</span>
                  <strong>{tx.createdBy?.name ?? 'Usuário'}</strong>
                </div>
                <div className="detailsSpan">
                  <span className="detailsLabel">Descrição</span>
                  <strong>{tx.description || 'Sem descrição'}</strong>
                </div>
                {canEdit ? (
                  <div className="detailsActions detailsSpan">
                    <ActionIconButton action="edit" onClick={() => openForEdit(tx)} aria-label="Editar transação" />
                    <ActionIconButton
                      action="delete"
                      onClick={() => {
                        setDeleteError(null)
                        setDeleteCandidateId(tx.id)
                      }}
                      aria-label="Excluir transação"
                    />
                  </div>
                ) : null}
              </div>
            )
          })()}
        </Modal>
      ) : null}

      {deleteCandidateId ? (
        <ConfirmDialog
          title="Excluir transação?"
          description="Esta transação será removida definitivamente. Essa ação não pode ser desfeita."
          confirmLabel="Excluir"
          loading={deleteLoading}
          errorMessage={deleteError}
          onCancel={() => {
            setDeleteError(null)
            setDeleteCandidateId(null)
          }}
          onConfirm={() => void confirmDeleteTransaction()}
        />
      ) : null}

      {snackbar ? <Snackbar tone={snackbar.tone} message={snackbar.message} onClose={() => setSnackbar(null)} /> : null}
    </>
  )
}

