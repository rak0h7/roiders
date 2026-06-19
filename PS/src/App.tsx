import { ToastProvider } from "@/context/ToastContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { PsProjectsProvider, usePsProjects } from "@ps/providers/PsProjectsProvider";
import { PsEditorProvider } from "@ps/providers/PsEditorProvider";
import { EditorShell } from "@ps/components/EditorShell";
import { ThemeBackdrop } from "@ps/components/ThemeBackdrop";
import { PsErrorBoundary } from "@ps/components/PsErrorBoundary";
import { ProjectThemeBridge } from "@ps/components/ProjectThemeBridge";
import { ProjectsPage } from "@ps/components/projects/ProjectsPage";
import { ProjectDetailPage } from "@ps/components/projects/ProjectDetailPage";
function PsAppRouter() {
  const { view, activeProject, activePost, savePostDraft } = usePsProjects();

  if (view.type === "projects") {
    return <ProjectsPage />;
  }

  if (view.type === "project") {
    return <ProjectDetailPage />;
  }

  if (!activeProject || !activePost) {
    return <ProjectsPage />;
  }

  return (
    <PsEditorProvider
      key={`${activeProject.id}:${activePost.id}`}
      postDraft={activePost.draft}
      onDraftChange={(draft) => savePostDraft(activeProject.id, activePost.id, draft)}
    >
      <EditorShell />
    </PsEditorProvider>
  );
}

export default function App() {
  return (
    <PsErrorBoundary>
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        <SettingsProvider>
          <ThemeBackdrop />
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