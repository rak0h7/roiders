import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { PsEditorProvider } from "@ps/providers/PsEditorProvider";
import { EditorShell } from "@ps/components/EditorShell";
import { ThemeBackdrop } from "@ps/components/ThemeBackdrop";
import { PsErrorBoundary } from "@ps/components/PsErrorBoundary";

export default function App() {
  return (
    <PsErrorBoundary>
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <SettingsProvider>
          <ThemeBackdrop />
          <ToastProvider>
            <PsEditorProvider>
              <EditorShell />
            </PsEditorProvider>
          </ToastProvider>
        </SettingsProvider>
      </div>
    </PsErrorBoundary>
  );
}