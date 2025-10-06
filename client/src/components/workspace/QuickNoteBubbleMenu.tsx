import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List } from 'lucide-react';

interface QuickNoteBubbleMenuProps {
  editor: Editor | null;
}

export default function QuickNoteBubbleMenu({ editor }: QuickNoteBubbleMenuProps) {
  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      className="flex items-center gap-1 p-1 rounded-lg shadow-lg border-2"
      style={{
        backgroundColor: 'rgba(233, 213, 255, 0.95)',
        borderColor: 'rgb(192, 132, 252)',
      }}
    >
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="h-7 w-7 p-0"
        style={{
          backgroundColor: editor.isActive('bold') ? 'rgb(147, 51, 234)' : 'transparent',
          color: editor.isActive('bold') ? 'white' : 'rgb(88, 28, 135)',
        }}
        data-testid="bubble-button-bold"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="h-7 w-7 p-0"
        style={{
          backgroundColor: editor.isActive('italic') ? 'rgb(147, 51, 234)' : 'transparent',
          color: editor.isActive('italic') ? 'white' : 'rgb(88, 28, 135)',
        }}
        data-testid="bubble-button-italic"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="h-7 w-7 p-0"
        style={{
          backgroundColor: editor.isActive('underline') ? 'rgb(147, 51, 234)' : 'transparent',
          color: editor.isActive('underline') ? 'white' : 'rgb(88, 28, 135)',
        }}
        data-testid="bubble-button-underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-purple-400/50 mx-1" />

      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className="h-7 w-7 p-0"
        style={{
          backgroundColor: editor.isActive('bulletList') ? 'rgb(147, 51, 234)' : 'transparent',
          color: editor.isActive('bulletList') ? 'white' : 'rgb(88, 28, 135)',
        }}
        data-testid="bubble-button-bullet-list"
      >
        <List className="h-4 w-4" />
      </Button>
    </BubbleMenu>
  );
}
