import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SaveIcon } from "lucide-react";
import { useState } from "react";
import Button from "~/components/_ui/button";
import { Form } from "~/components/_ui/form";
import { useToast } from "~/components/_ui/toast";
import { useAppForm } from "~/forms/context.form";
import { siteSubtitleSchema, type SiteSubtitleInput } from "~/lib/site";
import { updateSiteSubtitle } from "~/server/functions/site.functions";

interface SiteSubtitleFormProps {
  /** What the header currently shows. */
  subtitle: string;
  /** True while that's still the SITE_SUBTITLE default (never saved here). */
  is_default: boolean;
}

/** One-field form for the line under the site name in the header. */
function SiteSubtitleForm({ subtitle, is_default }: SiteSubtitleFormProps) {
  const update = useServerFn(updateSiteSubtitle);
  const router = useRouter();
  const toast = useToast();
  const [using_default, set_using_default] = useState(is_default);

  const form = useAppForm({
    defaultValues: { subtitle } as SiteSubtitleInput,
    validators: { onChange: siteSubtitleSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await update({ data: value });
        // The saved value becomes the new baseline, so Save disables again.
        formApi.reset({ subtitle: saved.subtitle });
        set_using_default(false);
        toast.success({ title: "Subtitle updated" });
      } catch (error) {
        toast.danger({
          title: "Couldn't update the subtitle",
          description: error instanceof Error ? error.message : undefined,
        });
        return;
      }
      // The header reads the subtitle in the root loader.
      await router.invalidate();
    },
  });

  return (
    <form.AppForm>
      <Form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.AppField
          name="subtitle"
          children={(field) => (
            <field.TextField
              label="Subtitle"
              placeholder="Senior Software Engineer & (Amateur) Photographer"
            />
          )}
        />
        <p className="text-sm opacity-80">
          Shown under your name in the site header. Leave it empty to hide it.
          {using_default && " This is the SITE_SUBTITLE default until you save."}
        </p>
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
              <span>Save Subtitle</span>
            </Button>
          )}
        />
      </Form>
    </form.AppForm>
  );
}

export { SiteSubtitleForm };
