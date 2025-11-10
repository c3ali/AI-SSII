import { toast } from "sonner"

export type ToastType = "success" | "error" | "warning" | "info" | "loading"

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const showToast = (
    type: ToastType,
    message: string,
    options?: ToastOptions
  ) => {
    const toastOptions = {
      description: options?.description,
      duration: options?.duration,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    }

    switch (type) {
      case "success":
        return toast.success(message, toastOptions)
      case "error":
        return toast.error(message, toastOptions)
      case "warning":
        return toast.warning(message, toastOptions)
      case "info":
        return toast.info(message, toastOptions)
      case "loading":
        return toast.loading(message, toastOptions)
      default:
        return toast(message, toastOptions)
    }
  }

  return {
    toast: showToast,
    success: (message: string, options?: ToastOptions) =>
      showToast("success", message, options),
    error: (message: string, options?: ToastOptions) =>
      showToast("error", message, options),
    warning: (message: string, options?: ToastOptions) =>
      showToast("warning", message, options),
    info: (message: string, options?: ToastOptions) =>
      showToast("info", message, options),
    loading: (message: string, options?: ToastOptions) =>
      showToast("loading", message, options),
    dismiss: toast.dismiss,
  }
}
