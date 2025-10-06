import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface EditableTitleProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  className?: string;
  placeholder?: string;
}

export function EditableTitle({ title, onTitleChange, className = '', placeholder = 'Untitled' }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when title prop changes
  useEffect(() => {
    setEditValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange(trimmedValue);
    } else if (!trimmedValue) {
      // Reset to current title if empty
      setEditValue(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`h-6 text-sm font-medium px-2 py-0 ${className}`}
        placeholder={placeholder}
        data-testid="input-editable-title"
      />
    );
  }

  return (
    <span
      className={`text-sm font-medium truncate cursor-pointer hover:bg-accent/50 px-2 py-1 rounded transition-colors ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit title"
      data-testid="text-editable-title"
    >
      {title || placeholder}
    </span>
  );
}
