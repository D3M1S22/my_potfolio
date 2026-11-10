import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { PROJECTS, type Project } from '@/data/projects';
import { setScrollLocked } from '@/lib/scroll-lock';

/** Public-folder paths that also work when the site is served from a sub-path. */
const asset = (src: string) => `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}`;

interface ProjectTileProps {
  project: Project;
  onOpen: (id: string) => void;
}

const ProjectTile = ({ project, onOpen }: ProjectTileProps) => (
  <li className="snap-start shrink-0 w-[78%] sm:w-auto">
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      aria-haspopup="dialog"
      className="group/tile block w-full text-left rounded-xl overflow-hidden border border-[var(--color-glass-border)]
                 bg-[var(--color-surface-50)] transition-[transform,border-color,box-shadow] duration-200 ease-out
                 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent)_55%,transparent)]
                 hover:shadow-[0_12px_30px_-12px_color-mix(in_oklab,var(--accent)_45%,transparent)]
                 active:translate-y-0"
    >
      <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface-100)]">
        <img
          src={asset(project.image.src)}
          alt=""
          width={project.image.width}
          height={project.image.height}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover/tile:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-text leading-tight">{project.title}</h3>
          <span className="font-mono text-xs text-text-muted shrink-0">{project.year}</span>
        </div>
        <p className="mt-1.5 text-sm leading-snug text-text-body">{project.summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full px-2.5 py-0.5 font-mono text-[11px] text-text-muted border border-[var(--color-glass-border)]"
            >
              {tag}
            </li>
          ))}
        </ul>
        <span className="sr-only">Open project details</span>
      </div>
    </button>
  </li>
);

interface ProjectDialogProps {
  project: Project | null;
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}

const ProjectDialog = ({ project, index, onClose, onStep }: ProjectDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Open/close the native modal (focus trap, Escape and top layer for free)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      dialog.showModal();
      setScrollLocked(true);
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  useEffect(() => () => setScrollLocked(false), []);

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'ArrowRight') onStep(1);
    if (e.key === 'ArrowLeft') onStep(-1);
  };

  // Portal to <body>: keeps the modal out of the animated, clipped card
  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="project-dialog-title"
      data-lenis-prevent
      onKeyDown={onKeyDown}
      onClose={() => {
        setScrollLocked(false);
        onClose();
      }}
      // Click on the backdrop (the dialog element itself) closes it
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="project-dialog p-0 w-[min(56rem,calc(100vw-2rem))] max-h-[calc(100svh-2rem)] rounded-2xl
                 bg-[var(--color-surface)] text-text border border-[var(--color-glass-border)] overflow-y-auto overscroll-contain"
    >
      {project && (
        <article>
          <div className="relative">
            <img
              src={asset(project.image.src)}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              className="w-full aspect-[16/10] max-h-[46svh] object-cover"
            />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close project details"
              className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center
                         hover:bg-black/80 transition-colors duration-150"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="p-6 md:p-10">
            <p className="font-mono text-xs md:text-sm uppercase tracking-[0.14em] text-text-muted">
              {project.year} · {project.role}
            </p>
            <h2 id="project-dialog-title" className="mt-2 font-display text-3xl md:text-4xl font-bold text-text">
              {project.title}
            </h2>
            <div className="mt-5 space-y-4 text-[1.0625rem] leading-[1.75] text-text-body max-w-prose">
              {project.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.14em] text-text-muted">Built with</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li key={tag} className="rounded-full px-3 py-1 text-sm text-text-body border border-[var(--color-glass-border)]">
                  {tag}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {project.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
                               bg-[var(--color-text)] text-[var(--color-surface)] hover:opacity-85 transition-opacity duration-150"
                  >
                    {link.label}
                    <span aria-hidden="true">↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))}
              </div>
              <nav aria-label="Other projects" className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  className="w-11 h-11 rounded-full border border-[var(--color-glass-border)] hover:bg-[var(--color-surface-50)] transition-colors"
                  aria-label="Previous project"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <span className="font-mono text-xs text-text-muted tabular-nums" aria-live="polite">
                  {index + 1} / {PROJECTS.length}
                </span>
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  className="w-11 h-11 rounded-full border border-[var(--color-glass-border)] hover:bg-[var(--color-surface-50)] transition-colors"
                  aria-label="Next project"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </nav>
            </div>
          </div>
        </article>
      )}
    </dialog>,
    document.body,
  );
};

/**
 * Browsable project gallery for the Projects section: a 2×2 grid on larger
 * screens, a swipeable carousel on phones. Each tile opens a detail dialog
 * with previous/next navigation (buttons or ← → keys).
 */
export const ProjectsShowcase = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const index = PROJECTS.findIndex((p) => p.id === openId);
  const project = index >= 0 ? PROJECTS[index] : null;

  const step = useCallback(
    (delta: number) => {
      if (index < 0) return;
      setOpenId(PROJECTS[(index + delta + PROJECTS.length) % PROJECTS.length].id);
    },
    [index],
  );

  return (
    <>
      <ul
        aria-label="Projects"
        className="mt-7 -mx-7 px-7 md:mx-0 md:px-0 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2
                   sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 [scrollbar-width:none]"
      >
        {PROJECTS.map((p) => (
          <ProjectTile key={p.id} project={p} onOpen={setOpenId} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-text-muted sm:hidden" aria-hidden="true">
        Swipe to see more →
      </p>
      <ProjectDialog project={project} index={index} onClose={() => setOpenId(null)} onStep={step} />
    </>
  );
};
