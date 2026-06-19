import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { PsEditorProvider } from "@ps/providers/PsEditorProvider";
import { EditorShell } from "@ps/components/EditorShell";
import { ThemeBackdrop } from "@ps/components/ThemeBackdrop";

export default function App() {
  return (
    <SettingsProvider>
      <ThemeBackdrop />
      <ToastProvider>
        <PsEditorProvider>
          <EditorShell />
        </PsEditorProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}