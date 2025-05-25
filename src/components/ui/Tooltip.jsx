import { useState, cloneElement } from 'react';

// TooltipTrigger: children'ı hover/focus ile tetikler
export function TooltipTrigger({ children, ...props }) {
  return cloneElement(children, {
    ...props,
    tabIndex: 0,
    'data-tooltip-trigger': true,
  });
}

// TooltipContent: tooltip içeriği
export function TooltipContent({ children, open, position = 'right', ...props }) {
  if (!open) return null;
  return (
    <div
      className="z-50 absolute bg-black text-white text-xs rounded px-2 py-1 shadow-lg animate-fade-in"
      style={{ minWidth: 80, whiteSpace: 'nowrap', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}

// TooltipProvider: context için (şimdilik gereksiz, sadece children döndür)
export function TooltipProvider({ children }) {
  return children;
}

// Tooltip: trigger ve content'i yönetir
export function Tooltip({ children }) {
  const [open, setOpen] = useState(false);
  let trigger = null;
  let content = null;

  // children'ı ayır
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child?.type === TooltipTrigger) trigger = child;
    if (child?.type === TooltipContent) content = child;
  }

  // trigger'ı eventlerle sarmala
  const triggerWithEvents = trigger
    ? cloneElement(trigger.props.children, {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        ...trigger.props.children.props,
      })
    : null;

  return (
    <span className="relative inline-block">
      {triggerWithEvents}
      {content && cloneElement(content, { open })}
    </span>
  );
}

// Basit fade-in animasyonu
const style = document.createElement('style');
style.innerHTML = `.animate-fade-in { animation: fadeIn 0.18s ease; } @keyframes fadeIn { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: none;} }`;
if (typeof window !== 'undefined' && !document.getElementById('tooltip-fade-style')) {
  style.id = 'tooltip-fade-style';
  document.head.appendChild(style);
} 