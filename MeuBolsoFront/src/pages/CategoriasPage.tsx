import { useMemo, useState } from 'react'
import type { Category, TransactionType } from '../domain/finance'
import { useFinance } from '../services/useFinance'
import { useEnvironment } from '../services/useEnvironment'
import { useMediaQuery } from '../hooks/useMediaQuery'
import ActionIconButton from '../components/ui/ActionIconButton'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import EmojiPickerField from '../components/ui/EmojiPickerField'
import CategoryIcon from '../components/icons/CategoryIcon'
import PageLoader from '../components/PageLoader'
import Snackbar from '../components/ui/Snackbar'
import type { SnackbarTone } from '../components/ui/Snackbar'
import { useLocale } from '../i18n/useLocale'
import { getStoredLocale } from '../i18n/localeStorage'
import { localizeThrownErrorMessage, translate } from '../i18n/messages'

const CATEGORY_NAME_MAX_LENGTH = 80
const MOBILE_COLLAPSE_MQ = '(max-width: 700px)'

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <span className={`categoryCollapsibleChevron ${open ? 'categoryCollapsibleChevronOpen' : ''}`} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function CategoryRows({
  categories,
  variant,
  canEdit,
  onEdit,
  onDelete,
}: {
  categories: Category[]
  variant: 'despesa' | 'receita'
  canEdit: boolean
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
}) {
  const iconClass = variant === 'despesa' ? 'recentTxIconOut' : 'recentTxIconIn'
  const hint = variant === 'despesa' ? 'Categoria de despesa' : 'Categoria de receita'
  return (
    <>
      {categories.map((c) => (
        <div className="row" key={c.id}>
          <div className="rowLabel">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className={`recentTxIcon ${iconClass}`} aria-hidden="true">
                <CategoryIcon name={c.name} emoji={c.emoji} />
              </div>
              <div>
                <div className="rowName">{c.name}</div>
                <div className="rowHint">{hint}</div>
              </div>
            </div>
          </div>
          {canEdit ? (
            <div className="rowActions">
              <ActionIconButton action="edit" onClick={() => onEdit(c)} aria-label="Editar categoria" />
              <ActionIconButton action="delete" onClick={() => onDelete(c)} aria-label="Excluir categoria" />
            </div>
          ) : (
            <div className="rowActions" aria-hidden />
          )}
        </div>
      ))}
    </>
  )
}

export default function CategoriasPage() {
  const { loading, data, addCategory, updateCategory, deleteCategory } = useFinance()
  const { canEdit } = useEnvironment()
  const { t } = useLocale()
  const narrow = useMediaQuery(MOBILE_COLLAPSE_MQ)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('DESPESA')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mobileDespesasOpen, setMobileDespesasOpen] = useState(false)
  const [mobileReceitasOpen, setMobileReceitasOpen] = useState(false)
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ tone: SnackbarTone; message: string } | null>(null)

  const showSnackbar = (tone: SnackbarTone, message: string) => {
    setSnackbar({ tone, message })
  }

  const despesas = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === 'DESPESA').sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const receitas = useMemo(() => {
    if (!data) return []
    return data.categories.filter((c) => c.type === 'RECEITA').sort((a, b) => a.name.localeCompare(b.name))
  }, [data])

  const openCreateModal = () => {
    setEditingCategoryId(null)
    setName('')
    setType('DESPESA')
    setEmoji(null)
    setError(null)
    setModalOpen(true)
  }

  const openEditModal = (c: Category) => {
    setEditingCategoryId(c.id)
    setName(c.name)
    setType(c.type)
    setEmoji(c.emoji ?? null)
    setError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCategoryId(null)
    setName('')
    setEmoji(null)
    setError(null)
    setType('DESPESA')
  }

  const submitModal = async () => {
    setError(null)
    try {
      const trimmed = name.trim()
      if (trimmed.length < 2) throw new Error(t('ERR_CATEGORY_NAME_SHORT'))
      if (trimmed.length > CATEGORY_NAME_MAX_LENGTH) throw new Error(t('ERR_CATEGORY_NAME_MAX'))
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name: trimmed, emoji: emoji ?? undefined })
        showSnackbar('success', 'Categoria atualizada com sucesso.')
      } else {
        await addCategory({ name: trimmed, type, emoji: emoji ?? undefined })
        showSnackbar('success', 'Categoria criada com sucesso.')
      }
      closeModal()
    } catch (e) {
      const loc = getStoredLocale()
      setError(e instanceof Error ? localizeThrownErrorMessage(e.message, loc) : translate('ERR_SAVE_CATEGORY', loc))
    }
  }

  const confirmDeleteCategory = async () => {
    if (!deleteCandidateId || deleteLoading) return
    setDeleteLoading(true)
    setDeleteError(null)
    try {
      await deleteCategory(deleteCandidateId)
      setDeleteCandidateId(null)
      showSnackbar('success', 'Categoria excluída com sucesso.')
    } catch (e) {
      const loc = getStoredLocale()
      setDeleteError(e instanceof Error ? localizeThrownErrorMessage(e.message, loc) : translate('ERR_DELETE_CATEGORY', loc))
    } finally {
      setDeleteLoading(false)
    }
  }

  const rowHandlers = {
    onEdit: openEditModal,
    onDelete: (c: Category) => {
      setDeleteError(null)
      setDeleteCandidateId(c.id)
    },
  }

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Organize suas receitas e despesas</h1>
        <div className="card">
          <PageLoader />
        </div>
      </>
    )
  }

  const despesasCard =
    despesas.length === 0 ? (
      <div className="card">
        <div className="sectionTitle">Despesas</div>
        <EmptyState>Sem categorias de despesas.</EmptyState>
      </div>
    ) : narrow ? (
      <div className="card categoryCollapsible">
        <button
          type="button"
          className="categoryCollapsibleHeader"
          id="cat-head-despesas"
          aria-expanded={mobileDespesasOpen}
          aria-controls={mobileDespesasOpen ? 'cat-list-despesas' : undefined}
          onClick={() => setMobileDespesasOpen((v) => !v)}
        >
          <span className="sectionTitle">Despesas</span>
          <span className="categoryCollapsibleMeta">
            <span className="categoryCollapsibleCount">{despesas.length}</span>
            <ChevronIcon open={mobileDespesasOpen} />
          </span>
        </button>
        {mobileDespesasOpen ? (
          <div
            id="cat-list-despesas"
            className="list categoryCollapsibleBody"
            role="region"
            aria-labelledby="cat-head-despesas"
          >
            <CategoryRows categories={despesas} variant="despesa" canEdit={canEdit} {...rowHandlers} />
          </div>
        ) : null}
      </div>
    ) : (
      <div className="card">
        <div className="sectionTitle">Despesas</div>
        <div className="list">
          <CategoryRows categories={despesas} variant="despesa" canEdit={canEdit} {...rowHandlers} />
        </div>
      </div>
    )

  const receitasCard =
    receitas.length === 0 ? (
      <div className="card">
        <div className="sectionTitle">Receitas</div>
        <EmptyState>Sem categorias de receitas.</EmptyState>
      </div>
    ) : narrow ? (
      <div className="card categoryCollapsible">
        <button
          type="button"
          className="categoryCollapsibleHeader"
          id="cat-head-receitas"
          aria-expanded={mobileReceitasOpen}
          aria-controls={mobileReceitasOpen ? 'cat-list-receitas' : undefined}
          onClick={() => setMobileReceitasOpen((v) => !v)}
        >
          <span className="sectionTitle">Receitas</span>
          <span className="categoryCollapsibleMeta">
            <span className="categoryCollapsibleCount">{receitas.length}</span>
            <ChevronIcon open={mobileReceitasOpen} />
          </span>
        </button>
        {mobileReceitasOpen ? (
          <div
            id="cat-list-receitas"
            className="list categoryCollapsibleBody"
            role="region"
            aria-labelledby="cat-head-receitas"
          >
            <CategoryRows categories={receitas} variant="receita" canEdit={canEdit} {...rowHandlers} />
          </div>
        ) : null}
      </div>
    ) : (
      <div className="card">
        <div className="sectionTitle">Receitas</div>
        <div className="list">
          <CategoryRows categories={receitas} variant="receita" canEdit={canEdit} {...rowHandlers} />
        </div>
      </div>
    )

  return (
    <>
      <h1 className="pageTitle">Organize suas receitas e despesas</h1>

      <div className="toolbar">
        <div className="muted" style={{ fontSize: 14 }}>
          {despesas.length + receitas.length} categorias cadastradas
        </div>
        <Button onClick={() => openCreateModal()} disabled={!canEdit}>
          Nova Categoria
        </Button>
      </div>

      {narrow ? (
        <div className="categoryMobileStack">
          {despesasCard}
          {receitasCard}
        </div>
      ) : (
        <div className="grid2">
          {despesasCard}
          {receitasCard}
        </div>
      )}

      {modalOpen ? (
        <Modal
          title={editingCategoryId ? 'Editar categoria' : 'Nova Categoria'}
          onClose={closeModal}
          footer={
            <>
              <button type="button" className="smallBtn" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="btn" onClick={() => void submitModal()} disabled={!canEdit}>
                Salvar
              </button>
            </>
          }
        >
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Tipo</div>
              <Select
                value={type}
                disabled={Boolean(editingCategoryId)}
                onChange={(e) => setType(e.target.value as TransactionType)}
              >
                <option value="DESPESA">Despesas</option>
                <option value="RECEITA">Receitas</option>
              </Select>
            </div>
            <div className="field">
              <div className="label">Nome</div>
              <Input
                placeholder="Ex: Educação"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={CATEGORY_NAME_MAX_LENGTH}
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Ícone (emoji)</div>
              <EmojiPickerField value={emoji} onChange={setEmoji} id={editingCategoryId ? 'category-emoji-edit' : 'category-emoji-create'} />
            </div>
          </div>

          {error ? <div style={{ marginTop: 12 }} className="emptyState">{error}</div> : null}
        </Modal>
      ) : null}

      {deleteCandidateId ? (
        <ConfirmDialog
          title="Excluir categoria?"
          description="A categoria será removida. Só é possível excluir se não houver transações usando esta categoria."
          confirmLabel="Excluir"
          loading={deleteLoading}
          errorMessage={deleteError}
          onCancel={() => {
            setDeleteError(null)
            setDeleteCandidateId(null)
          }}
          onConfirm={() => void confirmDeleteCategory()}
        />
      ) : null}

      {snackbar ? <Snackbar tone={snackbar.tone} message={snackbar.message} onClose={() => setSnackbar(null)} /> : null}
    </>
  )
}
