"use client"

import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`rounded-lg shadow-lg p-4 flex items-start gap-3 ${
              toast.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : toast.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : toast.type === "warning"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : toast.type === "info"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-white text-gray-800 border border-gray-200"
            }`}
          >
            <div className="flex-1">
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
            </div>
            <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

