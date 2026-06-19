import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { PsProjectsProvider } from "@ps/providers/PsProjectsProvider";
import { EditorChromeBackdrop } from "@ps/components/EditorChromeBackdrop";
import { PsErrorBoundary } from "@ps/components/PsErrorBoundary";
import { ProjectThemeBridge } from "@ps/components/ProjectThemeBridge";
import { PsAppRouter } from "@ps/components/shell/PsAppRouter";

export default function App() {
  return (
    <PsErrorBoundary>
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <SettingsProvider>
          <EditorChromeBackdrop />
          <ToastProvider>
            <PsProjectsProvider>
              <ProjectThemeBridge />
              <PsAppRouter />
            </PsProjectsProvider>
          </ToastProvider>
        </SettingsProvider>
      </div>
    </PsErrorBoundary>
  );
}