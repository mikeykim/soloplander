import * as React from "react"

// Select 컴포넌트
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

const Select = ({ value, onValueChange, children, ...props }: SelectProps) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectTrigger) {
          return React.cloneElement(child as React.ReactElement<SelectTriggerProps>, {
            value,
            onClick: () => {
              const content = document.getElementById(`select-content-${value}`);
              if (content) {
                content.classList.toggle('hidden');
              }
            }
          });
        }
        if (React.isValidElement(child) && child.type === SelectContent) {
          return React.cloneElement(child as React.ReactElement<SelectContentProps>, {
            id: `select-content-${value}`,
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

// SelectTrigger 컴포넌트
export interface SelectTriggerProps {
  children: React.ReactNode
  value?: string
  onClick?: () => void
}

const SelectTrigger = ({ children, onClick }: SelectTriggerProps) => {
  return (
    <button
      type="button"
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
};

// SelectValue 컴포넌트
export interface SelectValueProps {
  placeholder: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <span>{placeholder}</span>;
};

// SelectContent 컴포넌트
export interface SelectContentProps {
  children: React.ReactNode
  id?: string
  value?: string
  onValueChange?: (value: string) => void
}

const SelectContent = ({ children, id, value, onValueChange }: SelectContentProps) => {
  return (
    <div
      id={id}
      className="absolute z-50 mt-1 hidden max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
    >
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === SelectItem) {
            return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
              onSelect: () => {
                if (onValueChange && child.props.value !== undefined) {
                  onValueChange(child.props.value);
                }
                const content = document.getElementById(id || '');
                if (content) {
                  content.classList.add('hidden');
                }
              },
              isSelected: value === child.props.value
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

// SelectItem 컴포넌트
export interface SelectItemProps {
  children: React.ReactNode
  value: string
  onSelect?: () => void
  isSelected?: boolean
}

const SelectItem = ({ children, onSelect, isSelected }: SelectItemProps) => {
  return (
    <div
      className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        isSelected ? 'bg-accent text-accent-foreground' : ''
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12l5 5 9-9" />
          </svg>
        </span>
      )}
      <span>{children}</span>
    </div>
  );
};

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} 