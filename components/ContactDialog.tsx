import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, Loader2, MessageCircle, Share2, X } from "lucide-react";
import React from "react";

const ContactDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = (
  props,
) => {
  const { isOpen, onClose } = props;
  const nameInputRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [msgData, setMsgData] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData),
      });
      const data = await res.json();
      if (data) {
        setMsgData({ name: "", email: "", message: "" });
        onClose();
      } else setIsError(true);
    } catch (e) {
      setIsError(true);
    }
    setIsLoading(false);
  }, [msgData, onClose]);

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto px-4 text-center"
      initialFocus={nameInputRef}
      open={isOpen}
      onClose={onClose}
    >
      <Dialog.Overlay className="fixed inset-0 bg-zinc-200/50 dark:bg-zinc-800/50" />

      <span className="inline-block h-screen align-middle" aria-hidden="true">
        &#8203;
      </span>

      <div className="my-8 inline-block w-full max-w-sm transform space-y-4 overflow-hidden rounded-xl border-2 border-zinc-300/50 bg-white p-6 text-left align-middle shadow-xl transition-all dark:border-zinc-600/50 dark:bg-zinc-800 md:max-w-md">
        <Dialog.Title className="flex items-center space-x-2 text-2xl font-bold md:text-4xl">
          <Share2 className="h-8 w-8" />
          <span>Reach Out</span>
        </Dialog.Title>

        <button
          type="button"
          className="absolute right-4 top-0 rounded-full bg-zinc-100 p-2 hover:bg-zinc-50 hover:text-emerald-600 focus:outline-emerald-600 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:hover:text-emerald-500"
          onClick={onClose}
        >
          <X />
        </button>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Transition
            show={isError}
            enter="transition duration-300"
            enterFrom="opacity-0 scale-0"
            enterTo="opacity-100 scale-100"
            leave="transition-opacity duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-0"
          >
            <div className="flex items-center space-x-4 rounded bg-rose-200/25 px-4 py-2 font-semibold text-rose-700 transition-opacity">
              <AlertTriangle />
              <p>Something went wrong!</p>
            </div>
          </Transition>
          <fieldset className="space-y-2">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600 dark:bg-zinc-700"
              name="name"
              id="name"
              placeholder="Jane Doe"
              value={msgData.name}
              onChange={(e) => setMsgData({ ...msgData, name: e.target.value })}
              ref={nameInputRef}
            />
          </fieldset>
          <fieldset className="space-y-2">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600 dark:bg-zinc-700"
              name="email"
              id="email"
              value={msgData.email}
              onChange={(e) =>
                setMsgData({ ...msgData, email: e.target.value })
              }
              placeholder="jane_doe@email.com"
            />
          </fieldset>
          <fieldset className="space-y-2">
            <label htmlFor="message">Message</label>
            <textarea
              className="h-24 w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600 dark:bg-zinc-700"
              name="message"
              id="message"
              value={msgData.message}
              onChange={(e) =>
                setMsgData({ ...msgData, message: e.target.value })
              }
              placeholder="Lorem ipsum dolor sit amet..."
            ></textarea>
          </fieldset>
        </form>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="flex items-center justify-center space-x-2 rounded px-4 py-2 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            <X />
            <span>Close</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center space-x-2 rounded bg-zinc-800 p-2 text-white hover:bg-black dark:bg-white dark:text-zinc-800 dark:hover:bg-zinc-200"
          >
            <span>Send Message</span>
            {isLoading ? (
              <Loader2 className="animate animate-spin" />
            ) : (
              <MessageCircle />
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ContactDialog;
