import { ChevronDown } from "lucide-react";
import type { Project } from "../types";

type ProjectSelectorProps = {
  projects: Project[];
  selectedProjectId: string;
  selectedProject: Project | null;
  onProjectChange: (projectId: string) => void;
};

function ProjectSelector({
  projects,
  selectedProjectId,
  selectedProject,
  onProjectChange
}: ProjectSelectorProps) {
  return (
    <section className="mb-9">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(event) => onProjectChange(event.target.value)}
                className="appearance-none rounded-full bg-white py-2 pl-4 pr-11 text-[22px] font-extrabold tracking-[-0.035em] text-[#111111] shadow-sm outline-none ring-1 ring-black/5"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              />
            </div>

            <span className="flex items-center gap-2 rounded-full bg-[#E7F9EE] px-3 py-2 text-xs font-extrabold text-[#16A34A]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              Live
            </span>
          </div>

          <p className="mt-3 text-sm font-medium text-[#6B7280]">
            {selectedProject
              ? `Project health and recent backend errors for ${selectedProject.name}`
              : "Project health and recent backend errors"}
          </p>
        </div>

        <button className="rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white shadow-sm">
          View Project
        </button>
      </div>
    </section>
  );
}

export default ProjectSelector;