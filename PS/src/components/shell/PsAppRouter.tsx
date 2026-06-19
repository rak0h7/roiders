import { PsEditorProvider } from "@ps/providers/PsEditorProvider";
import { usePsProjects } from "@ps/providers/PsProjectsProvider";
import { EditorShell } from "@ps/components/EditorShell";
import { ProjectsPage } from "@ps/components/projects/ProjectsPage";
import { ProjectDetailPage } from "@ps/components/projects/ProjectDetailPage";

export function PsAppRouter() {
  const { view, activeProject, activePost, savePostDraft } = usePsProjects();

  if (view.type === "projects") return <ProjectsPage />;
  if (view.type === "project") return <ProjectDetailPage />;
  if (!activeProject || !activePost) return <ProjectsPage />;

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