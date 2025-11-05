import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SearchResult {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
}

interface MentionListProps {
  items: SearchResult[];
  command: (item: SearchResult) => void;
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (selectedIndex + props.items.length - 1) % props.items.length,
      );
    };

    const downHandler = () => {
      setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }));

    if (props.items.length === 0) {
      return (
        <Card className="p-2 shadow-lg border bg-background">
          <div className="text-sm text-muted-foreground text-center py-2">
            No results found
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-1 shadow-lg border bg-background max-w-xs">
        {props.items.map((item, index) => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors ${
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50"
            }`}
            onClick={() => selectItem(index)}
            data-testid={`mention-item-${item.id}`}
          >
            <Badge
              variant="outline"
              className={`text-xs ${
                index === selectedIndex
                  ? "border-accent-foreground/20 bg-accent-foreground/10"
                  : ""
              }`}
            >
              {item.type}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </Card>
    );
  },
);

MentionList.displayName = "MentionList";

export default MentionList;
