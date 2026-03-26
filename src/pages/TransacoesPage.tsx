import { useEffect, useMemo, useState } from 'react'
import { CURRENT_MONTH } from '../mocks/seed'
import { formatBRLFromCents, monthLabelFromYYYYMM, parseAmountToCents } from '../domain/finance'
import type { TransactionType } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import PillTabs from '../components/ui/PillTabs'

const FILTER_TABS = [{ value: 'TODOS' as const, label: 'Todos' }]

function todayISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function TransacoesPage() {
  const { loading, data, addTransaction } = useFinance()
  const [open, setOpen] = useState(false)
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
    const inMonth = data.transactions.filter((t) => t.occurredOn.startsWith(CURRENT_MONTH))
    if (filter === 'TODOS') return inMonth
    return inMonth
  }, [data, filter])

  useEffect(() => {
    if (!open) return
    if (categoryId) return
    if (categoriesForType.length === 0) return
    setCategoryId(categoriesForType[0].id)
  }, [open, categoryId, categoriesForType])

  const monthLabel = useMemo(() => monthLabelFromYYYYMM(CURRENT_MONTH), [])

  const resetForm = () => {
    setType('DESPESA')
    setCategoryId('')
    setDescription('')
    setAmount('')
    setOccurredOn(todayISO())
    setError(null)
  }

  const submit = async () => {
    setError(null)
    try {
      const cents = parseAmountToCents(amount)
      if (cents === null) throw new Error('Valor inválido')
      if (!categoryId) throw new Error('Selecione uma categoria')
      if (!occurredOn) throw new Error('Data inválida')

      await addTransaction({
        type,
        categoryId,
        description: description.trim() || undefined,
        amountCents: cents,
        occurredOn,
      })

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
          <div className="muted">Carregando...</div>
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
            setOpen(true)
            setError(null)
          }}
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
              const categoryName = data.categories.find((c) => c.id === tx.categoryId)?.name ?? 'Categoria'
              return (
                <div className="row" key={tx.id}>
                  <div className="rowLabel">
                    <div className="rowName">
                      {tx.type === 'DESPESA' ? 'Despesa: ' : 'Receita: '}
                      {categoryName}
                    </div>
                    <div className="rowHint">{tx.description ? tx.description : `Em ${tx.occurredOn}`}</div>
                  </div>
                  <div style={{ fontWeight: 750, color: 'var(--text-h)' }}>
                    {tx.type === 'DESPESA' ? '-' : ''}
                    {formatBRLFromCents(tx.amountCents)}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {open ? (
        <Modal
          title="Nova Transação"
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
                    {c.name}
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
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="field">
              <div className="label">Data</div>
              <Input type="date" value={occurredOn} onChange={(e) => setOccurredOn(e.target.value)} />
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="field">
            <div className="label">Descrição (opcional)</div>
            <Input placeholder="Ex: aluguel, salário..." value={description} onChange={(e) => setDescription(e.target.value)} />
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
    </>
  )
}

