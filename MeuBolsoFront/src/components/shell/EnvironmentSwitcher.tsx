import { useEffect, useId, useRef, useState } from 'react'
import type { Environment, EnvironmentRole } from '../../domain/environment'
import { useEnvironment } from '../../services/useEnvironment'
import { useLocale } from '../../i18n/useLocale'
import { getStoredLocale } from '../../i18n/localeStorage'
import { localizeThrownErrorMessage, translate } from '../../i18n/messages'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import { IconEnvironment } from './SidebarIcons'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 180
const ENVIRONMENT_NAME_MAX_LENGTH = 120
const ENVIRONMENT_DESCRIPTION_MAX_LENGTH = 280

const ROLE_LABELS: Record<EnvironmentRole, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatEnvironmentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

function EnvironmentListSection({
  title,
  items,
  activeEnvironmentId,
  onSelect,
  onView,
}: {
  title: string
  items: Environment[]
  activeEnvironmentId: string | null
  onSelect: (id: string) => void
  onView: (environment: Environment) => void
}) {
  return (
    <div className="environmentSection">
      <div className="environmentSectionTitle">{title}</div>
      {items.length === 0 ? (
        <div className="environmentEmpty">Nenhum ambiente</div>
      ) : (
        items.map((environment) => (
          <div
            key={environment.id}
            className={`environmentOptionRow ${environment.id === activeEnvironmentId ? 'environmentOptionRowActive' : ''}`}
          >
            <button type="button" className="environmentOption" onClick={() => onSelect(environment.id)}>
              <span className="environmentOptionText">
                <span className="environmentOptionName">{environment.name}</span>
                <span className="environmentOptionMeta">
                  {environment.participants.length} participante{environment.participants.length === 1 ? '' : 's'}
                </span>
              </span>
              <span className="environmentRolePill">{ROLE_LABELS[environment.role]}</span>
            </button>
            <button
              type="button"
              className="environmentViewBtn"
              onClick={() => onView(environment)}
              aria-label={`Ver informações de ${environment.name}`}
              title="Ver informações"
            >
              <EyeIcon />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function EnvironmentInfoModal({ environment, onClose }: { environment: Environment; onClose: () => void }) {
  return (
    <Modal title="Informações do ambiente" onClose={onClose}>
      <div className="environmentInfoHeader">
        <div>
          <div className="environmentInfoEyebrow">Ambiente</div>
          <div className="environmentInfoTitle">{environment.name}</div>
          <div className="environmentInfoMeta">
            {environment.createdByMe ? 'Criado por mim' : 'Compartilhado comigo'} - {ROLE_LABELS[environment.role]}
          </div>
        </div>
        <span className="environmentRolePill">{ROLE_LABELS[environment.role]}</span>
      </div>

      <div className="environmentInfoGrid">
        <div className="environmentInfoCard">
          <span>Descrição</span>
          <strong>{environment.description || 'Sem descrição'}</strong>
        </div>
        <div className="environmentInfoCard">
          <span>Criado em</span>
          <strong>{formatEnvironmentDate(environment.createdAt)}</strong>
        </div>
        <div className="environmentInfoCard">
          <span>Participantes</span>
          <strong>
            {environment.participants.length} participante{environment.participants.length === 1 ? '' : 's'}
          </strong>
        </div>
      </div>

      <div className="environmentInfoSection">
        <div className="environmentSectionTitle">Participantes</div>
        <div className="environmentInfoParticipants">
          {environment.participants.map((participant) => (
            <div className="environmentInfoParticipant" key={participant.userId}>
              <span>
                <strong>{participant.name}</strong>
                <small>
                  {participant.email}
                  {participant.userId === environment.ownerUserId ? ' - Criador' : ''}
                </small>
              </span>
              <span className="environmentRolePill">{ROLE_LABELS[participant.role]}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}

export default function EnvironmentSwitcher() {
  const {
    environments,
    activeEnvironment,
    activeEnvironmentId,
    canAdmin,
    setActiveEnvironmentId,
    createEnvironment,
    addMember,
    updateMemberRole,
    removeMember,
  } = useEnvironment()
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberRole, setMemberRole] = useState<EnvironmentRole>('VIEWER')
  const [infoEnvironment, setInfoEnvironment] = useState<Environment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggleOpen = () => {
    setOpen((v) => !v)
  }

  const selectEnvironment = (id: string) => {
    setActiveEnvironmentId(id)
    setOpen(false)
  }

  const submitEnvironment = async () => {
    setError(null)
    try {
      if (!newName.trim()) throw new Error(t('ERR_ENV_NAME'))
      if (newName.trim().length > ENVIRONMENT_NAME_MAX_LENGTH) {
        throw new Error(t('ERR_ENV_NAME_MAX'))
      }
      if (newDescription.trim().length > ENVIRONMENT_DESCRIPTION_MAX_LENGTH) {
        throw new Error(t('ERR_ENV_DESC_MAX'))
      }
      await createEnvironment({ name: newName.trim(), description: newDescription.trim() || undefined })
      setNewName('')
      setNewDescription('')
      setOpen(false)
    } catch (e) {
      const loc = getStoredLocale()
      setError(e instanceof Error ? localizeThrownErrorMessage(e.message, loc) : translate('ERR_ENV_CREATE', loc))
    }
  }

  const submitMember = async () => {
    if (!activeEnvironmentId) return
    setError(null)
    try {
      const email = memberEmail.trim()
      if (!EMAIL_PATTERN.test(email)) throw new Error(t('ERR_SHARE_EMAIL_INVALID'))
      if (email.length > EMAIL_MAX_LENGTH) throw new Error(t('ERR_SHARE_EMAIL_MAX'))
      await addMember(activeEnvironmentId, { email, role: memberRole })
      setMemberEmail('')
      setMemberRole('VIEWER')
    } catch (e) {
      const loc = getStoredLocale()
      setError(e instanceof Error ? localizeThrownErrorMessage(e.message, loc) : translate('ERR_SHARE_ADD', loc))
    }
  }

  return (
    <div className="environmentSwitchWrap" ref={wrapRef}>
      <button
        type="button"
        className="environmentSwitchBtn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={toggleOpen}
      >
        <span className="environmentSwitchIcon">
          <IconEnvironment />
        </span>
        <span className="environmentSwitchText">
          <span className="environmentSwitchLabel">Ambiente</span>
          <span className="environmentSwitchName">{activeEnvironment?.name ?? 'Selecionar ambiente'}</span>
        </span>
      </button>

      {open ? (
        <div className="environmentPanel" id={panelId} role="dialog" aria-label="Ambientes">
          <EnvironmentListSection
            title="Criados por mim"
            items={environments.createdByMe}
            activeEnvironmentId={activeEnvironmentId}
            onSelect={selectEnvironment}
            onView={setInfoEnvironment}
          />
          <EnvironmentListSection
            title="Compartilhados comigo"
            items={environments.sharedWithMe}
            activeEnvironmentId={activeEnvironmentId}
            onSelect={selectEnvironment}
            onView={setInfoEnvironment}
          />

          {activeEnvironment ? (
            <div className="environmentDetails">
              <div className="environmentSectionTitle">Informações</div>
              <div className="environmentDetailsTitle">{activeEnvironment.name}</div>
              {activeEnvironment.description ? <div className="environmentDetailsText">{activeEnvironment.description}</div> : null}
              <div className="environmentParticipants">
                {activeEnvironment.participants.map((participant) => (
                  <div className="environmentParticipant" key={participant.userId}>
                    <span className="environmentParticipantInfo">
                      <strong>{participant.name}</strong>
                      <small>{participant.email}</small>
                    </span>
                    {canAdmin && participant.userId !== activeEnvironment.ownerUserId ? (
                      <span className="environmentParticipantActions">
                        <Select
                          value={participant.role}
                          onChange={(e) =>
                            void updateMemberRole(activeEnvironment.id, participant.userId, e.target.value as EnvironmentRole)
                          }
                        >
                          <option value="VIEWER">Visualizador</option>
                          <option value="EDITOR">Editor</option>
                          <option value="ADMIN">Admin</option>
                        </Select>
                        <button
                          type="button"
                          className="smallBtn compactBtn"
                          onClick={() => void removeMember(activeEnvironment.id, participant.userId)}
                        >
                          Remover
                        </button>
                      </span>
                    ) : (
                      <span className="environmentRolePill">{ROLE_LABELS[participant.role]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {canAdmin && activeEnvironmentId ? (
            <div className="environmentForm">
              <div className="environmentSectionTitle">Compartilhar acesso</div>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                maxLength={EMAIL_MAX_LENGTH}
                required
              />
              <div className="environmentInlineFields">
                <Select value={memberRole} onChange={(e) => setMemberRole(e.target.value as EnvironmentRole)}>
                  <option value="VIEWER">Visualizador</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                <button type="button" className="btn compactBtn" onClick={() => void submitMember()}>
                  Adicionar
                </button>
              </div>
            </div>
          ) : null}

          <div className="environmentForm">
            <div className="environmentSectionTitle">Novo ambiente</div>
            <Input
              placeholder="Nome do ambiente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={ENVIRONMENT_NAME_MAX_LENGTH}
            />
            <Input
              placeholder="Descrição opcional"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              maxLength={ENVIRONMENT_DESCRIPTION_MAX_LENGTH}
            />
            <button type="button" className="btn compactBtn" onClick={() => void submitEnvironment()}>
              Criar ambiente
            </button>
          </div>

          {error ? <div className="emptyState environmentError">{error}</div> : null}
        </div>
      ) : null}

      {infoEnvironment ? <EnvironmentInfoModal environment={infoEnvironment} onClose={() => setInfoEnvironment(null)} /> : null}
    </div>
  )
}
