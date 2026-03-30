import { useMemo, useState } from 'react'
import type { TransactionType } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import EmojiPickerField from '../components/ui/EmojiPickerField'
import CategoryIcon from '../components/icons/CategoryIcon'

export default function CategoriasPage() {
  const { loading, data, addCategory } = useFinance()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('DESPESA')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const despesas = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === 'DESPESA').sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const receitas = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === 'RECEITA').sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const submit = async () => {
    setError(null)
    try {
      const trimmed = name.trim()
      if (trimmed.length < 2) throw new Error('Nome da categoria inválido')
      await addCategory({ name: trimmed, type, emoji: emoji ?? undefined })
      setOpen(false)
      setName('')
      setEmoji(null)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar categoria')
    }
  }

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Organize suas receitas e despesas</h1>
        <div className="card">
          <div className="muted">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="pageTitle">Organize suas receitas e despesas</h1>

      <div className="toolbar">
        <div className="muted" style={{ fontSize: 14 }}>
          {despesas.length + receitas.length} categorias cadastradas
        </div>
        <Button
          onClick={() => {
            setEmoji(null)
            setOpen(true)
          }}
        >
          Nova Categoria
        </Button>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="sectionTitle">Despesas</div>
          {despesas.length === 0 ? (
            <EmptyState>Sem categorias de despesas.</EmptyState>
          ) : (
            <div className="list">
              {despesas.map((c) => (
                <div className="row" key={c.id}>
                  <div className="rowLabel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="recentTxIcon recentTxIconOut" aria-hidden="true">
                        <CategoryIcon name={c.name} emoji={c.emoji} />
                      </div>
                      <div>
                        <div className="rowName">{c.name}</div>
                        <div className="rowHint">Categoria de despesa</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="sectionTitle">Receitas</div>
          {receitas.length === 0 ? (
            <EmptyState>Sem categorias de receitas.</EmptyState>
          ) : (
            <div className="list">
              {receitas.map((c) => (
                <div className="row" key={c.id}>
                  <div className="rowLabel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="recentTxIcon recentTxIconIn" aria-hidden="true">
                        <CategoryIcon name={c.name} emoji={c.emoji} />
                      </div>
                      <div>
                        <div className="rowName">{c.name}</div>
                        <div className="rowHint">Categoria de receita</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {open ? (
        <Modal
          title="Nova Categoria"
          onClose={() => {
            setOpen(false)
            setName('')
            setEmoji(null)
            setError(null)
            setType('DESPESA')
          }}
          footer={
            <>
              <button
                type="button"
                className="smallBtn"
                onClick={() => {
                  setOpen(false)
                  setName('')
                  setEmoji(null)
                  setError(null)
                  setType('DESPESA')
                }}
              >
                Cancelar
              </button>
              <button type="button" className="btn" onClick={() => void submit()}>
                Salvar
              </button>
            </>
          }
        >
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Tipo</div>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                <option value="DESPESA">Despesas</option>
                <option value="RECEITA">Receitas</option>
              </Select>
            </div>
            <div className="field">
              <div className="label">Nome</div>
              <Input placeholder="Ex: Educação" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Ícone (emoji)</div>
              <EmojiPickerField value={emoji} onChange={setEmoji} id="category-emoji-search" />
            </div>
          </div>

          {error ? <div style={{ marginTop: 12 }} className="emptyState">{error}</div> : null}
        </Modal>
      ) : null}
    </>
  )
}

