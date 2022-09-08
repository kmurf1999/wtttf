import ClientOnlyPortal from "./ClientOnlyPortal";

type ModalAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "default";
  disabled?: boolean;
};

const ModalActionClassBase = "inline-flex grow btn";

const ModalActionClass = {
  primary: `${ModalActionClassBase} btn-primary`,
  default: `${ModalActionClassBase} btn-outline`,
};

export default function Modal({
  isOpen,
  close,
  children,
  actions,
}: {
  children: React.ReactNode;
  isOpen: boolean;
  close: () => void;
  actions?: ModalAction[];
}) {
  return isOpen ? (
    <ClientOnlyPortal selector="body">
      <div
        className="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">
              <div className="bg-white px-4 pt-5 pb-4 flex flex-col gap-4">
                {children}
              </div>
              <div className="bg-gray-50 px-4 py-3 flex flex-row-reverse gap-4">
                {actions?.map(({ label, onClick, variant, disabled }, i) => (
                  <button
                    key={i}
                    type="button"
                    className={ModalActionClass[variant || "default"]}
                    onClick={onClick}
                    disabled={disabled}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnlyPortal>
  ) : null;
}
