"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Eye, EyeOff, ImageOff, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { ZodTypeAny } from "zod";
import { ConfirmDialog, Modal } from "@/components/admin/modal";
import { ResourceForm, toFormValues, type FieldConfig, type FormValues } from "@/components/admin/resource-form";
import { adminFetch } from "@/components/admin/api-client";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";

// Drag-and-drop code is only loaded on admin list pages.
// (Cast keeps the component's generic signature, which next/dynamic erases.)
const SortableList = dynamic(() => import("@/components/admin/sortable-list"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16 text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
}) as unknown as typeof import("@/components/admin/sortable-list").default;

export type Item = FormValues & { id: string; isActive: boolean; isFeatured?: boolean };

export type ManagerConfig = {
  endpoint: string;
  singular: string;
  plural: string;
  intro: string;
  schema: ZodTypeAny;
  fields: FieldConfig[] | ((items: Item[]) => FieldConfig[]);
  defaults: FormValues;
  thumb: (item: Item) => string | null;
  thumbFit?: "cover" | "contain";
  title: (item: Item) => string;
  subtitle?: (item: Item) => string | null;
  /** Show a "featured on home page" star toggle. */
  featurable?: boolean;
};

export function ResourceManager({
  config,
  initialItems,
  autoOpen = false,
}: {
  config: ManagerConfig;
  initialItems: Item[];
  autoOpen?: boolean;
}) {
  const toast = useToast();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (autoOpen) setEditing("new");
  }, [autoOpen]);

  const fields = typeof config.fields === "function" ? config.fields(items) : config.fields;
  const closeForm = useCallback(() => !saving && setEditing(null), [saving]);

  const save = async (values: FormValues) => {
    setSaving(true);
    try {
      if (editing === "new") {
        const { item } = await adminFetch<{ item: Item }>(config.endpoint, { method: "POST", json: values });
        setItems((list) => [...list, item]);
        toast.success(`${config.singular} added. It's live on the website now.`);
      } else if (editing) {
        const { item } = await adminFetch<{ item: Item }>(`${config.endpoint}/${editing.id}`, { method: "PUT", json: values });
        setItems((list) => list.map((i) => (i.id === item.id ? item : i)));
        toast.success("Changes saved.");
      }
      setEditing(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item: Item, flag: "isActive" | "isFeatured") => {
    setBusyId(item.id);
    try {
      const { item: updated } = await adminFetch<{ item: Item }>(`${config.endpoint}/${item.id}`, {
        method: "PATCH",
        json: { [flag]: !item[flag] },
      });
      setItems((list) => list.map((i) => (i.id === updated.id ? updated : i)));
      if (flag === "isActive") toast.success(updated.isActive ? "Now visible on the website." : "Hidden from the website.");
      else toast.success(updated.isFeatured ? "Featured on the home page." : "Removed from the home page.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminFetch(`${config.endpoint}/${toDelete.id}`, { method: "DELETE" });
      setItems((list) => list.filter((i) => i.id !== toDelete.id));
      toast.success(`${config.singular} deleted.`);
      setToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  };

  const reorder = async (next: Item[]) => {
    const previous = items;
    setItems(next);
    try {
      await adminFetch(`${config.endpoint}/reorder`, { method: "POST", json: { ids: next.map((i) => i.id) } });
      toast.success("New order saved.");
    } catch (error) {
      setItems(previous);
      toast.error(error instanceof Error ? error.message : "Could not save the new order.");
    }
  };

  const renderRow = (item: Item) => {
    const thumb = config.thumb(item);
    const subtitle = config.subtitle?.(item);
    const busy = busyId === item.id;
    return (
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 sm:h-16 sm:w-24">
          {thumb ? (
            <Image src={thumb} alt="" fill sizes="96px" className={config.thumbFit === "contain" ? "object-contain p-1.5" : "object-cover"} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted/60">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", !item.isActive && "text-muted")}>{config.title(item) || "Untitled"}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {!item.isActive && <span className="admin-badge bg-surface-2 text-muted">Hidden</span>}
            {config.featurable && item.isFeatured && <span className="admin-badge bg-gold/15 text-gold-strong">On home page</span>}
            {subtitle && <span className="truncate text-xs text-muted">{subtitle}</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin text-muted" />}
          {config.featurable && (
            <button
              type="button"
              onClick={() => toggle(item, "isFeatured")}
              disabled={busy}
              className={cn("admin-icon-btn", item.isFeatured && "text-gold")}
              title={item.isFeatured ? "Remove from home page" : "Feature on home page"}
              aria-label={item.isFeatured ? "Remove from home page" : "Feature on home page"}
            >
              <Star className={cn("h-[18px] w-[18px]", item.isFeatured && "fill-current")} />
            </button>
          )}
          <button
            type="button"
            onClick={() => toggle(item, "isActive")}
            disabled={busy}
            className="admin-icon-btn"
            title={item.isActive ? "Hide from website" : "Show on website"}
            aria-label={item.isActive ? "Hide from website" : "Show on website"}
          >
            {item.isActive ? <Eye className="h-[18px] w-[18px]" /> : <EyeOff className="h-[18px] w-[18px]" />}
          </button>
          <button type="button" onClick={() => setEditing(item)} className="admin-icon-btn" title="Edit" aria-label="Edit">
            <Pencil className="h-[18px] w-[18px]" />
          </button>
          <button type="button" onClick={() => setToDelete(item)} className="admin-icon-btn hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" title="Delete" aria-label="Delete">
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    );
  };

  const formId = "resource-form";
  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-sm text-muted">{config.intro}</p>
        <button type="button" onClick={() => setEditing("new")} className="admin-btn-primary shrink-0">
          <Plus className="h-4 w-4" /> Add {config.singular.toLowerCase()}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line px-6 py-16 text-center">
          <p className="font-medium">No {config.plural.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted">Click “Add {config.singular.toLowerCase()}” to create the first one.</p>
        </div>
      ) : (
        <>
          {items.length > 1 && <p className="mb-3 text-xs text-muted">Tip: drag the ⋮⋮ handle to change the order shown on the website.</p>}
          <SortableList items={items} onReorder={reorder} renderItem={renderRow} />
        </>
      )}

      <Modal
        open={editing !== null}
        onClose={closeForm}
        title={editing === "new" ? `Add ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}
        footer={
          <>
            <button type="button" onClick={closeForm} className="admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" form={formId} disabled={saving} className="admin-btn-primary">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing === "new" ? `Add ${config.singular.toLowerCase()}` : "Save changes"}
            </button>
          </>
        }
      >
        {editing !== null && (
          <ResourceForm
            key={editing === "new" ? "new" : editing.id}
            id={formId}
            fields={fields}
            schema={config.schema}
            defaultValues={toFormValues(fields, editing === "new" ? config.defaults : editing)}
            onSubmit={save}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        message={`“${toDelete ? config.title(toDelete) : ""}” will be removed from the website permanently. If you only want to hide it for now, use the eye icon instead.`}
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
