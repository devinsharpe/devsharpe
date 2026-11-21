import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ImageIcon, ImageOffIcon, SaveIcon, UserSquareIcon } from "lucide-react";
import { useState } from "react";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import { Form } from "~/components/_ui/form";
import { useToast } from "~/components/_ui/toast";
import type { MediaItem } from "~/components/media/media-library-item";
import { MediaPickerLibrary } from "~/components/media/media-picker-library";
import { useAppForm } from "~/forms/context.form";
import { linksProfileSchema, type LinksProfileInput } from "~/lib/links";
import { updateLinksProfile } from "~/server/functions/links.functions";

interface LinksProfileFormProps {
  /** The name at the top of the page (the site title, SITE_TITLE). */
  title: string;
  profile: { bio: string; photo: MediaItem | null };
}

const PHOTO_CLASSES =
  "size-24 shrink-0 border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800";

/** The top of /links: a photo from the media library and a short line. */
function LinksProfileForm({ title, profile }: LinksProfileFormProps) {
  const update = useServerFn(updateLinksProfile);
  const router = useRouter();
  const toast = useToast();
  // The picked photo, for its preview; the form holds only its id.
  const [photo, set_photo] = useState(profile.photo);
  const [is_picking, set_is_picking] = useState(false);

  const form = useAppForm({
    defaultValues: {
      bio: profile.bio,
      photoMediaId: profile.photo?.id ?? null,
    } as LinksProfileInput,
    validators: { onChange: linksProfileSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await update({ data: value });
        // The saved values become the new baseline, so Save disables again.
        formApi.reset({ bio: saved.bio ?? "", photoMediaId: saved.photoMediaId });
        toast.success({ title: "Links page updated" });
      } catch (error) {
        toast.danger({
          title: "Couldn't update the links page",
          description: error instanceof Error ? error.message : undefined,
        });
        return;
      }
      await router.invalidate();
    },
  });

  return (
    <form.AppForm>
      <Form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="photoMediaId"
          children={(field) => (
            <div className="flex items-center gap-4">
              {photo?.thumbnailUrl ? (
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.altText ?? ""}
                  className={`${PHOTO_CLASSES} object-cover`}
                />
              ) : (
                <div
                  className={`${PHOTO_CLASSES} flex items-center justify-center`}
                  aria-hidden
                >
                  <UserSquareIcon strokeWidth={1} size={32} className="opacity-60" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <p className="font-medium">{title}</p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => set_is_picking(true)}>
                    <ImageIcon strokeWidth={1.5} size={16} />
                    <span>{field.state.value ? "Change photo" : "Choose photo"}</span>
                  </Button>
                  {field.state.value && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        set_photo(null);
                        field.handleChange(null);
                      }}
                    >
                      <ImageOffIcon strokeWidth={1.5} size={16} />
                      <span>Remove photo</span>
                    </Button>
                  )}
                </div>
              </div>
              <Dialog.Root open={is_picking} onOpenChange={set_is_picking}>
                <Dialog.Content className="max-w-3xl gap-4">
                  <div className="-mx-2 px-2 pb-2 border-b">
                    <h2 className="text-2xl font-bold">Choose a photo</h2>
                  </div>
                  {is_picking && (
                    <MediaPickerLibrary
                      action="Use"
                      is_selected={(item) => item.id === field.state.value}
                      on_pick={(item) => {
                        set_photo(item);
                        field.handleChange(item.id);
                        set_is_picking(false);
                      }}
                      on_loaded={() => {}}
                      reload={0}
                    />
                  )}
                </Dialog.Content>
              </Dialog.Root>
            </div>
          )}
        />
        <p className="text-sm opacity-80">
          The name is the site title. The photo is cropped square around its
          subject; pick one from the media library (upload new ones there).
        </p>
        <form.AppField
          name="bio"
          children={(field) => (
            <field.TextAreaField
              label="Bio (optional)"
              placeholder="Software engineer and photographer in …"
              rows={2}
            />
          )}
        />
        <form.Subscribe
          selector={(state) =>
            [state.canSubmit, state.isSubmitting, state.isDefaultValue] as const
          }
          children={([can_submit, is_submitting, is_unchanged]) => (
            <Button
              type="submit"
              loading={is_submitting}
              disabled={!can_submit || is_unchanged}
            >
              <SaveIcon strokeWidth={1.5} size={16} />
              <span>Save Profile</span>
            </Button>
          )}
        />
      </Form>
    </form.AppForm>
  );
}

export { LinksProfileForm };
