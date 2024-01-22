// ProjectList Class
import {DragTarget} from "../model/drag-drop.js";
import {Component} from "./base-component.js";
import {ProjectItem} from "./project-item.js";
import {projectState} from "../state/project-state.js";
import {AutoBind} from "../decorators/autobind.js";
import {Project, ProjectStatus} from "../model/project.js";

export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget {
    private assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
        super("project-list", "app", false, `${type}-projects`);

        this.assignedProjects = [];

        this.configure();

        this.renderContent();
    }

    @AutoBind
    dragOverHandler(event: DragEvent): void {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add("droppable");
        }
    }

    @AutoBind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData("text/plain");
        console.log(this.type);
        projectState.moveProject(
            prjId,
            this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
        );
    }

    @AutoBind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }

    configure(): void {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.renderProjects();
        });
    }

    renderContent() {
        this.element.querySelector("ul")!.id = `${this.type}-projects-list`;
        this.element.querySelector("h2")!.textContent =
            this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)!;
        listEl.innerHTML = "";
        for (const project of this.assignedProjects) {
            new ProjectItem(`${this.type}-projects-list`, project);
        }
    }
}
