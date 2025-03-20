// src/composables/useDialog.ts
import { createApp, h, ref, onMounted, onBeforeUnmount, watch, defineComponent, type Component, type PropType, type VNode } from "vue";

export interface DialogOptions {
  component: Component;
  componentProps?: Record<string, any>;
  persistent?: boolean;
}

export interface DialogResult {
  onOk: (callback: (payload?: any) => void) => DialogResult;
  onCancel: (callback: () => void) => DialogResult;
  onDismiss: (callback: () => void) => DialogResult;
  close: (ok?: boolean, payload?: any) => void;
}

export interface SimpleDialogOptions {
  title?: string;
  message: string | VNode;
  confirmText?: string;
  cancelText?: string;
  persistent?: boolean;
  html?: boolean;
  showCancel?: boolean;
}

// Helper function to detect HTML content
function containsHtml(str: string): boolean {
  // Basic check for common HTML tags
  const htmlRegex = /<\/?[a-z][\s\S]*>/i;
  return htmlRegex.test(str);
}

// DialogWrapper component defined inline
const DialogWrapper = defineComponent({
  name: "DialogWrapper",
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const dialogVisible = ref(false);
    const dialogEl = ref<HTMLElement | null>(null);

    onMounted(() => {
      document.body.classList.add("overflow-hidden");
      setTimeout(() => {
        dialogVisible.value = props.isOpen;
      }, 50);

      if (!props.persistent) {
        window.addEventListener("keydown", handleKeyDown);
      }
    });

    onBeforeUnmount(() => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", handleKeyDown);
    });

    watch(
      () => props.isOpen,
      (newVal) => {
        if (!newVal) {
          dialogVisible.value = false;
        }
      }
    );

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape" && !props.persistent) {
        props.onClose();
      }
    }

    function handleBackdropClick(e: MouseEvent): void {
      if (!props.persistent && e.target === dialogEl.value) {
        props.onClose();
      }
    }

    return () =>
      h(
        "div",
        {
          ref: dialogEl,
          class: ["dialog-backdrop", { "dialog-visible": dialogVisible.value }],
          onClick: handleBackdropClick,
        },
        [
          h(
            "div",
            {
              class: ["dialog-container", { "dialog-container-visible": dialogVisible.value }],
            },
            slots.default ? slots.default() : []
          ),
        ]
      );
  },
});

// Simple Dialog component defined inline
const SimpleDialog = defineComponent({
  name: "SimpleDialog",
  props: {
    title: {
      type: String,
      default: "Konfirmasi",
    },
    message: {
      type: [String, Object] as PropType<string | VNode>,
      required: true,
    },
    confirmText: {
      type: String,
      default: "OK",
    },
    cancelText: {
      type: String,
      default: "Batal",
    },
    showCancel: {
      type: Boolean,
      default: true,
    },
    html: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function as PropType<(confirmed: boolean) => void>,
      required: true,
    },
  },
  setup(props) {
    function confirm(): void {
      props.onClose(true);
    }

    function cancel(): void {
      props.onClose(false);
    }

    // Determine if we should render as HTML
    const shouldRenderAsHtml = (): boolean => {
      if (props.html) return true;
      if (typeof props.message === "string") {
        return containsHtml(props.message);
      }
      return false;
    };

    return () =>
      h("div", { class: "simple-dialog" }, [
        // Header
        h("div", { class: "dialog-header" }, [h("h3", {}, props.title)]),

        // Body
        h("div", { class: "dialog-body" }, [
          shouldRenderAsHtml() && typeof props.message === "string" ? h("div", { innerHTML: props.message }) : h("p", {}, props.message),
        ]),

        // Footer
        h("div", { class: "dialog-footer" }, [
          // Hanya render tombol cancel jika showCancel true
          ...(props.showCancel
            ? [
                h(
                  "button",
                  {
                    class: "btn-cancel",
                    onClick: cancel,
                  },
                  props.cancelText
                ),
              ]
            : []),
          h(
            "button",
            {
              class: "btn-confirm",
              onClick: confirm,
            },
            props.confirmText
          ),
        ]),
      ]);
  },
});

// Add styles to document
function addStyles(): void {
  if (document.getElementById("dialog-styles")) return;

  const styleEl = document.createElement("style");
  styleEl.id = "dialog-styles";
  styleEl.textContent = `
     .dialog-backdrop {
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background-color: rgba(0, 0, 0, 0);
       display: flex;
       align-items: center;
       justify-content: center;
       z-index: 9999;
       transition: background-color 0.3s ease;
       pointer-events: none;
     }
     
     .dialog-visible {
       background-color: rgba(0, 0, 0, 0.5);
       pointer-events: auto;
     }
     
     .dialog-container {
       background-color: white;
       border-radius: 8px;
       box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
       max-width: 90%;
       max-height: 90%;
       overflow: auto;
       transform: scale(0.9);
       opacity: 0;
       transition: transform 0.3s ease, opacity 0.3s ease;
     }
     
     .dialog-container-visible {
       transform: scale(1);
       opacity: 1;
     }
 
     /* Simple Dialog Styles */
     .simple-dialog {
       width: 100%;
       min-width: 300px;
       max-width: 450px;
     }
     
     .dialog-header {
       padding: 15px 20px;
       border-bottom: 1px solid #eee;
     }
     
     .dialog-header h3 {
       margin: 0;
       font-size: 18px;
       font-weight: 600;
     }
     
     .dialog-body {
       padding: 20px;
     }
     
     .dialog-body p, .dialog-body div {
       margin: 0;
       line-height: 1.5;
     }
     
     .dialog-footer {
       display: flex;
       justify-content: flex-end;
       gap: 10px;
       padding: 15px 20px;
       border-top: 1px solid #eee;
     }
     
     .dialog-footer button {
       padding: 8px 16px;
       border: none;
       border-radius: 4px;
       font-size: 14px;
       cursor: pointer;
     }
     
     .btn-cancel {
       background-color: #f2f2f2;
       color: #333;
     }
     
     .btn-confirm {
       background-color: #3490dc;
       color: white;
     }
     
     .btn-cancel:hover {
       background-color: #e0e0e0;
     }
     
     .btn-confirm:hover {
       background-color: #2779bd;
     }
   `;
  document.head.appendChild(styleEl);
}

// Main dialog function
export function useDialog() {
  // Add styles on first use
  addStyles();

  const showDialog = (options: DialogOptions): DialogResult => {
    const { component, componentProps = {}, persistent = false } = options;

    // Create a div to mount our dialog
    const dialogContainer = document.createElement("div");
    document.body.appendChild(dialogContainer);

    // Create handlers
    let onOkFn: ((payload?: any) => void) | null = null;
    let onCancelFn: (() => void) | null = null;
    let onDismissFn: (() => void) | null = null;

    // Create a reactive property to track dialog state
    const isOpen = ref(true);

    // Function to close and clean up the dialog
    const close = (ok = false, payload?: any): void => {
      isOpen.value = false;

      // Call appropriate callbacks
      if (ok && onOkFn) {
        onOkFn(payload);
      } else if (!ok && onCancelFn) {
        onCancelFn();
      }

      if (onDismissFn) {
        onDismissFn();
      }

      // Wait for animation to complete before removing element
      setTimeout(() => {
        app.unmount();
        dialogContainer.remove();
      }, 300);
    };

    // Create and mount the dialog app
    const app = createApp({
      setup() {
        return () =>
          h(
            DialogWrapper,
            {
              isOpen: isOpen.value,
              persistent: persistent,
              onClose: () => close(false),
            },
            {
              default: () =>
                h(component, {
                  ...componentProps,
                  onClose: close,
                }),
            }
          );
      },
    });

    app.mount(dialogContainer);

    // Return the dialog interface
    const dialogResult: DialogResult = {
      onOk(callback) {
        onOkFn = callback;
        return dialogResult;
      },
      onCancel(callback) {
        onCancelFn = callback;
        return dialogResult;
      },
      onDismiss(callback) {
        onDismissFn = callback;
        return dialogResult;
      },
      close,
    };

    return dialogResult;
  };

  // Simple confirm dialog helper function
  const confirm = (options: SimpleDialogOptions | string): DialogResult => {
    // Handle if options is just a string (message)
    const opts: SimpleDialogOptions = typeof options === "string" ? { message: options } : options;

    // Auto-detect HTML in string message
    const hasHtmlContent = typeof opts.message === "string" && containsHtml(opts.message);

    return showDialog({
      component: SimpleDialog,
      componentProps: {
        title: opts.title || "Konfirmasi",
        message: opts.message,
        confirmText: opts.confirmText || "OK",
        cancelText: opts.cancelText || "Batal",
        html: opts.html !== undefined ? opts.html : hasHtmlContent,
        showCancel: opts.showCancel !== undefined ? opts.showCancel : true,
      },
      persistent: opts.persistent || false,
    });
  };

  // Alert dialog helper (same as confirm but without cancel button)
  const alert = (options: SimpleDialogOptions | string): DialogResult => {
    // Handle if options is just a string (message)
    const opts: SimpleDialogOptions = typeof options === "string" ? { message: options } : options;

    // Auto-detect HTML in string message
    const hasHtmlContent = typeof opts.message === "string" && containsHtml(opts.message);

    return showDialog({
      component: SimpleDialog,
      componentProps: {
        title: opts.title || "Pesan",
        message: opts.message,
        confirmText: opts.confirmText || "OK",
        html: opts.html !== undefined ? opts.html : hasHtmlContent,
        showCancel: false, // Tidak menampilkan tombol cancel untuk alert
      },
      persistent: opts.persistent || false,
    });
  };

  return {
    dialog: showDialog,
    confirm,
    alert,
  };
}
