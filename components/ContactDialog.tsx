import { Dialog, Transition } from "@headlessui/react";
import {
  UilChannel,
  UilTimes,
  UilMessage,
  UilSpin,
  UilExclamationTriangle
} from "@iconscout/react-unicons";
import React from "react";

const ContactDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = (
  props
) => {
  const { isOpen, onClose } = props;
  const nameInputRef = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [msgData, setMsgData] = React.useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgData)
      });
      const data = await res.json();
      if (data) onClose();
      else setIsError(true);
    } catch (e) {
      setIsError(true);
    }
    setIsLoading(false);
  }, [msgData, onClose]);

  return (
    <Dialog
      as="div"
      className="fixed inset-0 z-50 overflow-y-auto text-center"
      initialFocus={nameInputRef}
      open={isOpen}
      onClose={onClose}
    >
      <Dialog.Overlay className="fixed inset-0 bg-zinc-200/50" />

      <span className="inline-block h-screen align-middle" aria-hidden="true">
        &#8203;
      </span>

      <div className="inline-block w-full max-w-sm p-6 my-8 space-y-4 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl md:max-w-md rounded-xl">
        <Dialog.Title className="flex items-center space-x-2 text-2xl font-bold md:text-4xl text-zinc-800">
          <UilChannel className="w-8 h-8" />
          <span>Reach Out</span>
        </Dialog.Title>

        <button
          type="button"
          className="absolute top-0 p-2 rounded-full right-4 bg-zinc-100 focus:outline-emerald-600 hover:text-emerald-600 hover:bg-zinc-50"
          onClick={onClose}
        >
          <UilTimes />
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
            <div className="flex items-center px-4 py-2 space-x-4 font-semibold transition-opacity rounded bg-rose-200/25 text-rose-700">
              <UilExclamationTriangle />
              <p>Something went wrong!</p>
            </div>
          </Transition>
          <fieldset className="space-y-2">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
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
              className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
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
              className="w-full h-24 rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
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
            className="flex items-center justify-center px-4 py-2 space-x-2 rounded hover:bg-zinc-200"
          >
            <UilTimes />
            <span>Close</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center w-full p-2 space-x-2 text-white rounded bg-zinc-800 hover:bg-black"
          >
            <span>Send Message</span>
            {isLoading ? (
              <UilSpin className="animate animate-spin" />
            ) : (
              <UilMessage />
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ContactDialog;
