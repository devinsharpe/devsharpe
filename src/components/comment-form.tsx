import { useState } from "react";
import { z } from "zod";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { addComment } from "~/server/functions/posts.functions";
import { commentInputSchema } from "~/lib/posts";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const add = useServerFn(addComment);
  const [errors, setErrors] = useState<
    Record<string, Array<string> | undefined>
  >({});
  const [pending, setPending] = useState(false);

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const values = Object.fromEntries(new FormData(form));
        // Same schema the server enforces, run early for instant feedback.
        const parsed = commentInputSchema.safeParse({ ...values, postId });
        if (!parsed.success) {
          setErrors(z.flattenError(parsed.error).fieldErrors);
          return;
        }
        setErrors({});
        setPending(true);
        try {
          await add({ data: parsed.data });
          form.reset();
          // Re-run the loader so the list reflects the persisted write.
          await router.invalidate({ sync: true });
        } finally {
          setPending(false);
        }
      }}
    >
      <label>
        Name
        <input name="author" maxLength={40} />
        {errors.author && <span className="error">{errors.author[0]}</span>}
      </label>
      <label>
        Comment
        <textarea name="body" rows={3} maxLength={500} />
        {errors.body && <span className="error">{errors.body[0]}</span>}
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
