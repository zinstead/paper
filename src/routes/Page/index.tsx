import ProjectList from "@/components-agent/ProjectList";
import EntryList from "@/components-agent/EntryList";
import TaskList from "@/components-agent/TaskList";
import CreateProjectForm from "@/components-agent/CreateProjectForm";
import CreateTaskForm from "@/components-agent/CreateTaskForm";
import TaskResult from "@/components-agent/TaskResult";
import UploadMoleculeForm from "@/components-agent/UploadMoleculeForm";
import ABFEPPostProcessing from "@/components-agent/PostProcessing";

const Index = () => {
  return (
    <div style={{ padding: 50 }}>
      <CreateProjectForm />
      <UploadMoleculeForm />
      <CreateTaskForm />
      <TaskResult />
      <ABFEPPostProcessing />
      <EntryList state={{ projectId: 123 }} setState={() => {}} />
    </div>
  );
};

export default Index;
