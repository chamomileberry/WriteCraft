import ToolsShowcase from '../ToolsShowcase';

export default function ToolsShowcaseExample() {
  return (
    <div className="min-h-screen bg-background">
      <ToolsShowcase onToolSelect={(toolId) => console.log('Selected tool:', toolId)} />
    </div>
  );
}