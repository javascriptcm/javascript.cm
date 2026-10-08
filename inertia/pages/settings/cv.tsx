import { Link, useForm, usePage } from '@inertiajs/react'
import { useRef, useState, type DragEvent } from 'react'
import { ArrowUpRight, FileUp, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import type { Data } from '@generated/data'
import DashboardLayout from '~/layouts/dashboard'
import { Seo } from '~/components/seo'
import { Button } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { WorkspaceHeader } from '~/components/dashboard/workspace-header'
import { FormSection } from '~/components/settings/form-section'
import { RadioCards, type RadioCardOption } from '~/components/settings/radio-cards'
import { cn, formatBytes, formatDate } from '~/lib/format'

type Cv = Data.User.Variants['forCv']
type Visibility = Cv['visibility']

const MAX_BYTES = 5 * 1024 * 1024

const VISIBILITY_OPTIONS: RadioCardOption<Visibility>[] = [
  {
    value: 'public',
    label: 'Tout le monde',
    description:
      'Toute personne qui visite votre profil peut le télécharger, y compris les recruteurs sans compte.',
  },
  {
    value: 'members',
    label: 'Membres connectés',
    note: 'par défaut',
    description:
      'Seules les personnes connectées à javascript.cm peuvent le télécharger. Les visiteurs sont invités à se connecter.',
  },
  {
    value: 'private',
    label: 'Moi uniquement',
    description:
      'Le CV n’apparaît pas sur votre profil. Seuls vous et l’équipe de modération y avez accès.',
  },
]

export default function SettingsCv({ cv }: { cv: Cv }) {
  const user = usePage().props.user!
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const upload = useForm<{ cv: File | null }>({ cv: null })
  const removal = useForm({})
  const visibility = useForm({ visibility: cv.visibility })

  const error = localError ?? upload.errors.cv
  const percent = upload.progress?.percentage ?? 0

  function openPicker() {
    inputRef.current?.click()
  }

  function send(file: File | undefined) {
    if (!file || upload.processing) return
    setLocalError(null)
    upload.clearErrors()
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      setLocalError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > MAX_BYTES) {
      setLocalError(`Ce fichier fait ${formatBytes(file.size)} : 5 Mo maximum.`)
      return
    }
    if (file.size === 0) {
      setLocalError('Ce fichier est vide.')
      return
    }
    upload.transform(() => ({ cv: file }))
    upload.post('/settings/cv', {
      forceFormData: true,
      preserveScroll: true,
      onFinish: () => {
        upload.reset()
        if (inputRef.current) inputRef.current.value = ''
      },
    })
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    send(event.dataTransfer.files?.[0])
  }

  function changeVisibility(value: Visibility) {
    const previous = visibility.data.visibility
    if (value === previous) return
    setLocalError(null)
    visibility.setData('visibility', value)
    visibility.transform(() => ({ visibility: value }))
    visibility.put('/settings/cv/visibility', {
      preserveScroll: true,
      onError: () => visibility.setData('visibility', previous),
    })
  }

  function destroy() {
    setLocalError(null)
    removal.delete('/settings/cv', {
      preserveScroll: true,
      onSuccess: () => setConfirmOpen(false),
    })
  }

  return (
    <>
      <Seo title="Votre CV" noindex />
      <WorkspaceHeader
        kicker="Paramètres · CV"
        title="Votre CV."
        lead={
          <>
            Un PDF à télécharger depuis{' '}
            <Link
              href={`/@${user.username}`}
              className="text-ink underline decoration-js decoration-2 underline-offset-4 hover:bg-js hover:text-js-ink"
            >
              votre profil
            </Link>
            , pour les recruteurs et les membres de la communauté — selon la visibilité que vous
            choisissez.
          </>
        }
      />

      <div className="mt-2">
        <FormSection
          index="01"
          title="Fichier"
          description="PDF uniquement, 5 Mo maximum. Un nouvel envoi remplace le précédent, qui est supprimé."
        >
          {cv.hasCv && (
            <div className="rounded-sm border border-ink bg-card">
              <div className="flex min-w-0 items-center gap-4 p-4">
                <span
                  className="grid h-14 w-11 shrink-0 place-items-end rounded-xs border border-ink bg-paper-2 p-1 font-mono text-[10px] font-bold tracking-[0.06em] text-ink"
                  aria-hidden="true"
                >
                  PDF
                </span>
                <div className="min-w-0">
                  <p
                    className="truncate text-[16px] font-semibold text-ink"
                    title={cv.originalName ?? undefined}
                  >
                    {cv.originalName}
                  </p>
                  <p className="label mt-1 tracking-[0.04em] normal-case">
                    {cv.size ? formatBytes(cv.size) : '—'} · envoyé le {formatDate(cv.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-3 sm:gap-2 sm:px-4">
                {cv.url && (
                  <a
                    href={cv.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-transparent px-2.5 text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:bg-paper-2 hover:text-ink"
                  >
                    Ouvrir <ArrowUpRight size={14} aria-hidden="true" />
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={openPicker}
                  disabled={upload.processing}
                >
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Remplacer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:text-danger sm:ml-auto"
                  onClick={() => setConfirmOpen(true)}
                  disabled={upload.processing}
                >
                  <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" /> Supprimer
                </Button>
              </div>
            </div>
          )}

          <div
            onDragOver={(event) => {
              event.preventDefault()
              if (!dragging) setDragging(true)
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setDragging(false)
              }
            }}
            onDrop={onDrop}
            className={cn(
              'rounded-sm border border-dashed p-5 transition-colors duration-150 sm:p-6',
              // Nothing to drag on a phone: "Remplacer" is enough there.
              cv.hasCv && !upload.processing && 'hidden sm:block',
              dragging ? 'border-ink bg-paper-2' : 'border-line-2',
              error && !dragging && 'border-danger'
            )}
          >
            {upload.processing ? (
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-[15px] font-semibold text-ink">Envoi en cours…</p>
                  <p className="font-mono text-[13px] text-ink tabular-nums">{percent} %</p>
                </div>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-xs bg-line"
                  role="progressbar"
                  aria-label="Envoi du CV"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={percent}
                >
                  <div
                    className="h-full bg-ink transition-[width] duration-200 ease-out"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <FileUp
                  size={22}
                  strokeWidth={1.5}
                  className={cn('shrink-0', dragging ? 'text-ink' : 'text-muted')}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-semibold text-ink">
                    {dragging ? (
                      <span className="mark">Déposez le fichier pour l’envoyer</span>
                    ) : cv.hasCv ? (
                      'Ou glissez un nouveau PDF ici pour remplacer le vôtre'
                    ) : (
                      'Glissez votre CV ici'
                    )}
                  </p>
                  <p className="mt-0.5 text-[13.5px] text-muted">
                    {cv.hasCv
                      ? 'PDF, 5 Mo maximum : l’ancien fichier sera supprimé.'
                      : 'ou choisissez-le sur votre appareil · PDF, 5 Mo maximum'}
                  </p>
                </div>
                {!cv.hasCv && (
                  <Button
                    onClick={openPicker}
                    className="self-start sm:self-auto"
                    aria-describedby={error ? 'cv-error' : undefined}
                  >
                    Choisir un fichier PDF
                  </Button>
                )}
              </div>
            )}
          </div>
          <label htmlFor="cv" className="sr-only">
            Fichier PDF de votre CV
          </label>
          <input
            ref={inputRef}
            id="cv"
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => send(event.target.files?.[0])}
          />
          {error && (
            <p id="cv-error" className="-mt-2 text-[13.5px] font-medium text-danger" role="alert">
              {error}
            </p>
          )}
        </FormSection>

        <FormSection
          index="02"
          title="Qui peut le consulter"
          description="Sur votre profil, le bouton « Télécharger le CV » n’apparaît qu’aux personnes autorisées. Vous pouvez changer d’avis à tout moment."
        >
          <p className="flex gap-3 border-l-2 border-js bg-paper-2 px-4 py-3.5 text-[14.5px] leading-relaxed text-ink-2">
            <ShieldAlert
              size={18}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-ink"
              aria-hidden="true"
            />
            <span>
              Votre CV contient des données personnelles (téléphone, adresse) : choisissez qui peut
              le consulter.
            </span>
          </p>
          <RadioCards
            name="cv-visibility"
            legend="Visibilité du CV"
            value={visibility.data.visibility}
            options={VISIBILITY_OPTIONS}
            onChange={changeVisibility}
            disabled={visibility.processing}
            columns={1}
            describedBy={visibility.errors.visibility ? 'cv-visibility-error' : undefined}
          />
          <p className="label -mt-2" aria-live="polite">
            {visibility.processing
              ? 'Enregistrement…'
              : visibility.recentlySuccessful
                ? 'Enregistré'
                : ''}
          </p>
          {visibility.errors.visibility && (
            <p id="cv-visibility-error" className="text-[13.5px] font-medium text-danger">
              {visibility.errors.visibility}
            </p>
          )}
        </FormSection>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={destroy}
        processing={removal.processing}
        confirmLabel="Supprimer le CV"
        title="Supprimer votre CV ?"
        description="Le fichier est effacé de nos serveurs et le bouton disparaît de votre profil. Vous pourrez en envoyer un autre à tout moment."
      />
    </>
  )
}

SettingsCv.layout = [DashboardLayout]
