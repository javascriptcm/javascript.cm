import { Link, router, useForm } from '@inertiajs/react'
import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { ConfirmDialog } from '~/components/ui/confirm-dialog'
import { EmptyState } from '~/components/ui/empty-state'
import { Field, Input, Textarea } from '~/components/ui/field'
import { cn } from '~/lib/format'

export type TaxonomyItem = {
  id: number
  name: string
  slug: string
  description: string | null
  position?: number
  usage: string
  usageCount: number
}

type Config = {
  /** e.g. "/admin/tags" */
  baseUrl: string
  /** "tag" / "canal" */
  noun: string
  /** "Nouveau tag" / "Nouveau canal" */
  createTitle: string
  nameMax: number
  slugMax: number
  withPosition?: boolean
  nextPosition?: number
  publicHref: (item: TaxonomyItem) => string
  /** Returns a reason when the item cannot be deleted. */
  deleteBlocker?: (item: TaxonomyItem) => string | null
  deleteDescription: (item: TaxonomyItem) => string
}

/** Same rules as the server's slug helper (lowercase, ASCII, dashes). */
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type TaxonomyForm = { name: string; slug: string; description: string; position: number }

function TaxonomyFields({
  prefix,
  form,
  config,
  autoFocus,
  narrow = false,
}: {
  prefix: string
  form: ReturnType<typeof useForm<TaxonomyForm>>
  config: Config
  autoFocus?: boolean
  /** Rendered in the narrow side column on wide screens. */
  narrow?: boolean
}) {
  const { data, errors } = form
  const preview = slugify(data.name).slice(0, config.slugMax)
  const id = (field: string) => `${prefix}-${field}`
  return (
    <>
      <Field label="Nom" htmlFor={id('name')} error={errors.name}>
        <Input
          id={id('name')}
          value={data.name}
          onChange={(e) => form.setData('name', e.target.value)}
          maxLength={config.nameMax}
          invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${id('name')}-error` : undefined}
          autoFocus={autoFocus}
          required
        />
      </Field>
      <div
        className={cn(
          'grid gap-5',
          config.withPosition && 'sm:grid-cols-[minmax(0,1fr)_7rem]',
          config.withPosition && narrow && 'xl:grid-cols-1'
        )}
      >
        <Field
          label="Slug"
          htmlFor={id('slug')}
          error={errors.slug}
          optional
          hint={
            data.slug
              ? 'Utilisé dans les adresses publiques.'
              : preview
                ? `Automatique : ${preview}`
                : 'Généré à partir du nom.'
          }
        >
          <Input
            id={id('slug')}
            value={data.slug}
            onChange={(e) =>
              form.setData('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
            }
            placeholder={preview || 'auto'}
            maxLength={config.slugMax}
            autoCapitalize="none"
            spellCheck={false}
            className="font-mono text-[14px]"
            invalid={Boolean(errors.slug)}
            aria-describedby={errors.slug ? `${id('slug')}-error` : `${id('slug')}-hint`}
          />
        </Field>
        {config.withPosition && (
          <Field label="Position" htmlFor={id('position')} error={errors.position}>
            <Input
              id={id('position')}
              type="number"
              inputMode="numeric"
              min={0}
              max={999}
              value={Number.isNaN(data.position) ? '' : data.position}
              onChange={(e) => form.setData('position', e.target.valueAsNumber)}
              className="font-mono tabular-nums"
              invalid={Boolean(errors.position)}
            />
          </Field>
        )}
      </div>
      <Field label="Description" htmlFor={id('description')} error={errors.description} optional>
        <Textarea
          id={id('description')}
          rows={2}
          maxLength={255}
          value={data.description}
          onChange={(e) => form.setData('description', e.target.value)}
          className="min-h-20"
          invalid={Boolean(errors.description)}
        />
      </Field>
    </>
  )
}

function CreateForm({ config }: { config: Config }) {
  const form = useForm<TaxonomyForm>({
    name: '',
    slug: '',
    description: '',
    position: config.nextPosition ?? 0,
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    form.post(config.baseUrl, { preserveScroll: true, onSuccess: () => form.reset() })
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-5 rounded-sm border border-ink bg-card p-5 sm:p-6"
    >
      <p className="label text-ink">{config.createTitle}</p>
      <TaxonomyFields prefix="new" form={form} config={config} narrow />
      <Button type="submit" loading={form.processing} disabled={!form.data.name.trim()}>
        <Plus size={15} aria-hidden="true" /> Créer
      </Button>
    </form>
  )
}

function Row({ item, config, index }: { item: TaxonomyItem; config: Config; index: number }) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const form = useForm<TaxonomyForm>({
    name: item.name,
    slug: item.slug,
    description: item.description ?? '',
    position: item.position ?? 0,
  })
  const blocker = config.deleteBlocker?.(item) ?? null

  function save(event: FormEvent) {
    event.preventDefault()
    form.put(`${config.baseUrl}/${item.id}`, {
      preserveScroll: true,
      onSuccess: () => setEditing(false),
    })
  }

  function cancel() {
    form.reset()
    form.clearErrors()
    setEditing(false)
  }

  function destroy() {
    setDeleting(true)
    router.delete(`${config.baseUrl}/${item.id}`, {
      preserveScroll: true,
      onFinish: () => {
        setDeleting(false)
        setConfirming(false)
      },
    })
  }

  return (
    <li className="border-t border-line first:border-t-0">
      {editing ? (
        <form
          onSubmit={save}
          noValidate
          className="my-3 grid gap-5 rounded-sm border border-ink bg-card p-5"
          aria-label={`Modifier ${item.name}`}
        >
          <p className="label text-ink">Modifier « {item.name} »</p>
          <TaxonomyFields prefix={`edit-${item.id}`} form={form} config={config} autoFocus />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={cancel}>
              Annuler
            </Button>
            <Button type="submit" size="sm" loading={form.processing}>
              Enregistrer
            </Button>
          </div>
        </form>
      ) : (
        <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
          <span className="label pt-1 tabular-nums sm:pt-0">
            {config.withPosition
              ? String(item.position ?? 0).padStart(2, '0')
              : String(index).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <span className="text-[17px] font-semibold tracking-[-0.01em]">{item.name}</span>
              <Link
                href={config.publicHref(item)}
                className="group inline-flex items-center gap-0.5 font-mono text-[12.5px] text-muted hover:text-ink"
              >
                {item.slug}
                <ArrowUpRight
                  size={11}
                  className="opacity-60 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            </h3>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-[14px] text-ink-2">{item.description}</p>
            )}
            <p className="mt-1 font-mono text-[12px] text-muted">{item.usage}</p>
          </div>
          <div className="col-start-2 mt-3 flex gap-1.5 sm:col-start-3 sm:mt-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              aria-label={`Modifier ${item.name}`}
            >
              <Pencil size={14} aria-hidden="true" /> Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
              aria-label={`Supprimer ${item.name}`}
              className="text-danger hover:bg-danger hover:text-paper"
            >
              <Trash2 size={14} aria-hidden="true" />
            </Button>
          </div>
        </article>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => !deleting && setConfirming(false)}
        onConfirm={blocker ? () => setConfirming(false) : destroy}
        processing={deleting}
        confirmLabel={blocker ? 'Compris' : 'Supprimer'}
        title={
          blocker
            ? `Impossible de supprimer « ${item.name} »`
            : `Supprimer le ${config.noun} « ${item.name} » ?`
        }
        description={blocker ?? config.deleteDescription(item)}
      />
    </li>
  )
}

/**
 * Admin CRUD for a small taxonomy (tags, forum channels): creation form on
 * the side, editable index on the main column.
 */
export function TaxonomyManager({
  items,
  config,
  emptyTitle,
}: {
  items: TaxonomyItem[]
  config: Config
  emptyTitle: string
}) {
  return (
    <div className="mt-8 grid gap-10 xl:grid-cols-12 xl:gap-12">
      <div className="xl:order-last xl:col-span-4">
        <div className="xl:sticky xl:top-24">
          <CreateForm config={config} />
        </div>
      </div>
      <div className="min-w-0 xl:col-span-8">
        {items.length ? (
          <ul className="border-y border-line">
            {items.map((item, i) => (
              <Row
                key={`${item.id}-${item.slug}-${item.name}-${item.position}`}
                item={item}
                config={config}
                index={i + 1}
              />
            ))}
          </ul>
        ) : (
          <EmptyState
            code="000"
            title={emptyTitle}
            description="Créez le premier avec le formulaire."
          />
        )}
      </div>
    </div>
  )
}
