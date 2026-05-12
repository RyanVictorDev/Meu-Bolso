import { useEffect, useMemo, useState } from 'react'
import {
  formatBRLFromCents,
  formatCurrencyInput,
  formatCurrencyInputFromCents,
  isValidISODate,
  MAX_AMOUNT_CENTS,
  monthLabelFromYYYYMM,
  parseAmountToCents,
} from '../domain/finance'
import type { TransactionType } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import { useEnvironment } from '../services/useEnvironment'
import Button from '../components/ui/Button'
import ActionIconButton from '../components/ui/ActionIconButton'
import DateInput from '../components/ui/DateInput'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import PillTabs from '../components/ui/PillTabs'
import PageLoader from '../components/PageLoader'

const FILTER_TABS = [{ value: 'TODOS' as const, label: 'Todos' }]
const TRANSACTION_DESCRIPTION_MAX_LENGTH = 240

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

  const { loading, data, addTransaction, updateTransaction, deleteTransaction } = useFinance()
  const { canEdit } = useEnvironment()
  const [open, setOpen] = useState(false)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<(typeof FILTER_TABS)[number]['value']>('TODOS')

  const [type, setType] = useState<TransactionType>('DESPESA')
  const [categoryId, setCategoryId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [occurredOn, setOccurredOn] = useState(todayISO())
  const [error, setError] = useState<string | null>(null)

  const categoriesForType = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name))
  }, [data, type])

  const transactions = useMemo(() => {
    if (!data) return []
    const inMonth = data.transactions.filter((t) => t.occurredOn.startsWith(currentMonth))
    if (filter === 'TODOS') return inMonth
    return inMonth
  }, [currentMonth, data, filter])

  useEffect(() => {
    if (!open) return
    if (categoryId) return
    if (categoriesForType.length === 0) return
    setCategoryId(categoriesForType[0].id)
  }, [open, categoryId, categoriesForType])

  const monthLabel = useMemo(() => monthLabelFromYYYYMM(currentMonth), [currentMonth])

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

      if (editingId) {
        await updateTransaction(editingId, payload)
      } else {
        await addTransaction(payload)
      }

      setOpen(false)
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar transação')
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
      <div className="pageSubtitle">{monthLabel}</div>

      <div className="toolbar">
        <PillTabs items={FILTER_TABS} value={filter} onChange={setFilter} />
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

      {transactions.length === 0 ? (
        <EmptyState>Nenhuma transação registrada. Clique em &quot;Nova Transação&quot; para começar.</EmptyState>
      ) : (
        <div className="list">
          {transactions
            .slice()
            .sort((a, b) => b.occurredOn.localeCompare(a.occurredOn))
            .map((tx) => {
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
                    <div className="rowHint">{tx.description ? tx.description : `Em ${tx.occurredOn}`}</div>
                  </div>
                  <div className="rowActions" onClick={(e) => e.stopPropagation()}>
                    <div className={tx.type === 'DESPESA' ? 'txAmountOut' : 'txAmountIn'}>
                      {tx.type === 'DESPESA' ? '-' : '+'}
                      {formatBRLFromCents(tx.amountCents)}
                    </div>
                    {canEdit ? (
                      <>
                        <ActionIconButton action="edit" onClick={() => openForEdit(tx)} aria-label="Editar transação" />
                        <ActionIconButton action="delete" onClick={() => void deleteTransaction(tx.id)} aria-label="Excluir transação" />
                      </>
                    ) : null}
                  </div>
                </div>
              )
            })}
        </div>
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
            const tx = data.transactions.find((item) => item.id === detailsId)
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
                  <strong>{tx.occurredOn}</strong>
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
                        void deleteTransaction(tx.id)
                        setDetailsId(null)
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
    </>
  )
}

