import type { Project } from "../types";

type ProjectsPageProps = {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
};

function ProjectsPage({
  projects,
  selectedProjectId,
  onProjectChange
}: ProjectsPageProps) {
  return (
    <main className="flex-1 px-10 py-8">
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
          Projects
        </h1>

        <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
          Manage all projects in your workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {projects.map((project) => {
          const isActive = project.id === selectedProjectId;

          return (
            <button
              key={project.id}
              onClick={() => onProjectChange(project.id)}
              className={`rounded-[28px] p-6 text-left shadow-sm ring-1 transition ${
                isActive
                  ? "bg-[#101010] text-white ring-[#101010]"
                  : "bg-white text-[#111111] ring-black/5 hover:ring-black/15"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isActive ? "text-white/50" : "text-[#6B7280]"
                }`}
              >
                Project
              </p>

              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em]">
                {project.name}
              </h2>

              <p
                className={`mt-3 text-sm font-semibold ${
                  isActive ? "text-white/55" : "text-[#6B7280]"
                }`}
              >
                Slug: {project.slug}
              </p>

              <p
                className={`mt-5 text-xs font-bold ${
                  isActive ? "text-[#FFF4C7]" : "text-[#2563EB]"
                }`}
              >
                {isActive ? "Currently selected" : "Click to select"}
              </p>
            </button>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <h2 className="text-xl font-extrabold">No projects found</h2>

          <p className="mt-2 text-sm font-medium text-[#6B7280]">
            Create a project from your backend first.
          </p>
        </div>
      )}
    </main>
  );
}

export default ProjectsPage;