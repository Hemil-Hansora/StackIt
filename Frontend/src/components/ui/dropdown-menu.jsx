import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, open, setOpen }) => {
  return React.cloneElement(children, {
    onClick: () => setOpen(!open)
  });
};

const DropdownMenuContent = ({ className, children, open, setOpen }) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ className, children, onClick, ...props }) => {
  return (
    <div
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = ({ className, ...props }) => (
  <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};