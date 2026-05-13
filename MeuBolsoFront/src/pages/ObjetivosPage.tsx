import { useMemo, useState } from 'react'
import {
  formatBRLFromCents,
  formatBRDate,
  formatCurrencyInput,
  formatCurrencyInputFromCents,
  isValidISODate,
  MAX_AMOUNT_CENTS,
  parseAmountToCents,
} from '../domain/finance'
import type { Goal } from '../domain/finance'
import { useEnvironment } from '../services/useEnvironment'
import { useFinance } from '../services/useFinance'
import ActionIconButton from '../components/ui/ActionIconButton'
import Button from '../components/ui/Button'
import DateInput from '../components/ui/DateInput'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import PageLoader from '../components/PageLoader'

const GOAL_NAME_MAX_LENGTH = 120
const GOAL_DESCRIPTION_MAX_LENGTH = 280
const GOAL_CONTRIBUTION_NOTE_MAX_LENGTH = 180

function todayISO() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function ObjetivosPage() {
  const { loading, data, addGoal, updateGoal, deleteGoal, addGoalContribution } = useFinance()
  const { canEdit } = useEnvironment()
  const [goalModal, setGoalModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [dueOn, setDueOn] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [contributionDate, setContributionDate] = useState(todayISO())
  const [contributionNote, setContributionNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const today = useMemo(() => todayISO(), [])
  const goals = useMemo(() => data?.goals.filter((goal) => !goal.archived) ?? [], [data])
  const contributionMaxDate = contributionGoal?.dueOn && contributionGoal.dueOn < today ? contributionGoal.dueOn : today

  const resetGoalForm = () => {
    setEditingGoal(null)
    setName('')
    setDescription('')
    setTarget('')
    setDueOn('')
    setError(null)
  }

  const openGoalForm = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal)
      setName(goal.name)
      setDescription(goal.description ?? '')
      setTarget(formatCurrencyInputFromCents(goal.targetCents))
      setDueOn(goal.dueOn ?? '')
    } else {
      resetGoalForm()
    }
    setGoalModal(true)
  }

  const submitGoal = async () => {
    setError(null)
    try {
      const targetCents = parseAmountToCents(target)
      if (!name.trim()) throw new Error('Informe um nome para a meta')
      if (name.trim().length > GOAL_NAME_MAX_LENGTH) throw new Error('Nome da meta deve ter no máximo 120 caracteres')
      if (description.trim().length > GOAL_DESCRIPTION_MAX_LENGTH) {
        throw new Error('Descrição deve ter no máximo 280 caracteres')
      }
      if (!targetCents) throw new Error('Informe um valor alvo válido')
      if (targetCents > MAX_AMOUNT_CENTS) throw new Error('Valor alvo excede o limite permitido')
      if (!dueOn) throw new Error('Informe o prazo da meta')
      if (!isValidISODate(dueOn)) throw new Error('Prazo da meta inválido')
      if (dueOn < today) throw new Error('O prazo da meta não pode ser no passado')
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        targetCents,
        dueOn,
      }
      if (editingGoal) {
        await updateGoal(editingGoal.id, { ...payload, archived: editingGoal.archived })
      } else {
        await addGoal(payload)
      }
      setGoalModal(false)
      resetGoalForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar objetivo')
    }
  }

  const submitContribution = async () => {
    if (!contributionGoal) return
    setError(null)
    try {
      const amountCents = parseAmountToCents(contributionAmount)
      if (!amountCents) throw new Error('Informe um aporte válido')
      if (amountCents > MAX_AMOUNT_CENTS) throw new Error('Aporte excede o limite permitido')
      if (!contributionDate) throw new Error('Informe a data do aporte')
      if (!isValidISODate(contributionDate)) throw new Error('Data do aporte inválida')
      if (contributionDate > today) throw new Error('A data do aporte não pode ser no futuro')
      if (contributionGoal.dueOn && contributionDate > contributionGoal.dueOn) {
        throw new Error('A data do aporte não pode passar do prazo da meta')
      }
      if (contributionNote.trim().length > GOAL_CONTRIBUTION_NOTE_MAX_LENGTH) {
        throw new Error('Observação deve ter no máximo 180 caracteres')
      }
      await addGoalContribution(contributionGoal.id, {
        amountCents,
        contributedOn: contributionDate,
        note: contributionNote.trim() || undefined,
      })
      setContributionGoal(null)
      setContributionAmount('')
      setContributionDate(todayISO())
      setContributionNote('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao registrar aporte')
    }
  }

  const confirmDeleteGoal = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta e seus aportes? Esta ação não pode ser desfeita.')) return
    await deleteGoal(id)
  }

  if (loading || !data) {
    return (
      <>
        <h1 className="pageTitle">Objetivos e Investimentos</h1>
        <div className="card">
          <PageLoader />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Objetivos e Investimentos</h1>
          <div className="pageSubtitle">Crie metas e registre aportes para acompanhar seu progresso.</div>
        </div>
        <Button onClick={() => openGoalForm()} disabled={!canEdit}>
          Nova Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState>Nenhuma meta ativa. Crie uma meta para começar a acompanhar seus aportes.</EmptyState>
      ) : (
        <div className="goalsGrid">
          {goals.map((goal) => {
            const progress = Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100))
            return (
              <div className="card goalCard" key={goal.id}>
                <div className="cardHeader">
                  <div>
                    <div className="sectionTitle">{goal.name}</div>
                    <div className="muted">{goal.description || 'Sem descrição'}</div>
                  </div>
                  <div className="environmentRolePill">{progress}%</div>
                </div>
                <div className="goalProgressBar" aria-label={`Progresso de ${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="goalAmounts">
                  <strong>{formatBRLFromCents(goal.currentCents)}</strong>
                  <span>de {formatBRLFromCents(goal.targetCents)}</span>
                </div>
                {goal.dueOn ? <div className="rowHint">Prazo: {formatBRDate(goal.dueOn)}</div> : null}
                <div className="goalActions">
                  <Button variant="secondary" onClick={() => setContributionGoal(goal)} disabled={!canEdit}>
                    Adicionar aporte
                  </Button>
                  {canEdit ? (
                    <>
                      <ActionIconButton action="edit" onClick={() => openGoalForm(goal)} aria-label="Editar meta" />
                      <ActionIconButton action="delete" onClick={() => void confirmDeleteGoal(goal.id)} aria-label="Excluir meta" />
                    </>
                  ) : null}
                </div>
                {goal.contributions.length > 0 ? (
                  <div className="goalContributionList">
                    {goal.contributions.slice(0, 3).map((contribution) => (
                      <div className="goalContributionRow" key={contribution.id}>
                        <span>{formatBRDate(contribution.contributedOn)}</span>
                        <strong>{formatBRLFromCents(contribution.amountCents)}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {goalModal ? (
        <Modal
          title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
          onClose={() => {
            setGoalModal(false)
            resetGoalForm()
          }}
        >
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Nome</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Reserva de emergência"
                required
                maxLength={GOAL_NAME_MAX_LENGTH}
              />
            </div>
            <div className="field">
              <div className="label">Valor alvo (R$)</div>
              <Input
                value={target}
                onChange={(e) => setTarget(formatCurrencyInput(e.target.value))}
                inputMode="decimal"
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Prazo</div>
              <DateInput value={dueOn} onChange={setDueOn} min={today} required />
            </div>
            <div className="field">
              <div className="label">Descrição</div>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo da meta"
                maxLength={GOAL_DESCRIPTION_MAX_LENGTH}
              />
            </div>
          </div>
          {error ? <div className="emptyState environmentError">{error}</div> : null}
          <div className="detailsActions" style={{ marginTop: 14 }}>
            <button type="button" className="smallBtn" onClick={() => setGoalModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn" onClick={() => void submitGoal()}>
              Salvar
            </button>
          </div>
        </Modal>
      ) : null}

      {contributionGoal ? (
        <Modal title="Adicionar Aporte" onClose={() => setContributionGoal(null)}>
          <div className="fieldGrid">
            <div className="field">
              <div className="label">Valor (R$)</div>
              <Input
                value={contributionAmount}
                onChange={(e) => setContributionAmount(formatCurrencyInput(e.target.value))}
                inputMode="decimal"
                placeholder="0,00"
                required
              />
            </div>
            <div className="field">
              <div className="label">Data</div>
              <DateInput value={contributionDate} onChange={setContributionDate} max={contributionMaxDate} required />
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className="field">
            <div className="label">Observação</div>
            <Input
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              placeholder="Opcional"
              maxLength={GOAL_CONTRIBUTION_NOTE_MAX_LENGTH}
            />
          </div>
          {error ? <div className="emptyState environmentError">{error}</div> : null}
          <div className="detailsActions" style={{ marginTop: 14 }}>
            <button type="button" className="smallBtn" onClick={() => setContributionGoal(null)}>
              Cancelar
            </button>
            <button type="button" className="btn" onClick={() => void submitContribution()}>
              Salvar aporte
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
