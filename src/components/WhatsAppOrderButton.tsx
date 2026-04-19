"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getWhatsAppTargets, getWhatsAppUrl } from "@/lib/site";

interface WhatsAppOrderButtonProps {
  message?: string;
  className: string;
  children: ReactNode;
  ariaLabel?: string;
  onTargetOpen?: () => void;
}

function formatDisplayNumber(number: string) {
  return `+${number}`;
}

export default function WhatsAppOrderButton({
  message,
  className,
  children,
  ariaLabel,
  onTargetOpen,
}: WhatsAppOrderButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const targets = useMemo(() => getWhatsAppTargets(message), [message]);
  const primaryTarget = targets[0] ?? {
    label: "واتساب",
    number: "",
    href: getWhatsAppUrl(message),
  };

  const openAllTargets = () => {
    setIsPickerOpen(false);
    onTargetOpen?.();

    for (const target of targets) {
      window.open(target.href, "_blank", "noopener,noreferrer");
    }
  };

  if (targets.length <= 1) {
    return (
      <motion.a
        href={primaryTarget.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={ariaLabel}
        onClick={onTargetOpen}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        className={className}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label={ariaLabel}
        onClick={() => setIsPickerOpen(true)}
      >
        {children}
      </motion.button>

      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#081018]/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPickerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-[30px] border border-white/60 bg-white p-6 shadow-[0_28px_80px_rgba(7,18,14,0.24)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#1a5c3a]/70">
                    اختيار واتساب
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold text-[#1a1a2e]">
                    أرسل الطلب إلى أكثر من رقم
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    اختر الرقم المناسب أو افتح نفس الطلب لكل الأرقام المجهزة. كل رقم سيفتح في محادثة مستقلة داخل واتساب.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="إغلاق"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {targets.map((target) => (
                  <a
                    key={`${target.label}-${target.number}`}
                    href={target.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#dfe9e2] bg-[#f8fbf9] px-4 py-4 transition-colors hover:border-[#25D366]/45 hover:bg-[#eefaf1]"
                    onClick={() => {
                      setIsPickerOpen(false);
                      onTargetOpen?.();
                    }}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-[#153226]">{target.label}</p>
                      <p dir="ltr" className="mt-1 text-xs font-medium text-gray-500">
                        {formatDisplayNumber(target.number)}
                      </p>
                    </div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_12px_24px_rgba(37,211,102,0.18)]">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>

              <button
                type="button"
                onClick={openAllTargets}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a5c3a] px-4 py-4 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(26,92,58,0.22)] transition-colors hover:bg-[#13452b]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                افتح الطلب لكل الأرقام
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}