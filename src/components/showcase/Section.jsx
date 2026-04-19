import { motion } from "framer-motion";

export default function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  contentClassName = "",
  divider = true,
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 ${divider ? "border-t border-gray-800/50" : ""} py-8 lg:py-10 ${className}`}
    >
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        {(eyebrow || title) && (
          <motion.header
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-5 lg:mb-6"
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              {eyebrow && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-medium">
                  {eyebrow}
                </span>
              )}
              {eyebrow && title && (
                <span className="text-gray-700">·</span>
              )}
              {title && (
                <h2 className="text-lg lg:text-xl font-semibold text-gray-100 tracking-tight">
                  {title}
                </h2>
              )}
            </div>
            {description && (
              <p className="mt-2 text-xs lg:text-sm text-gray-400 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </motion.header>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className={contentClassName}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
