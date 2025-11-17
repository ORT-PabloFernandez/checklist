import TaskAssignForm from '@/components/TaskAssignForm';

export default function AssignTaskPage({ params }) {
  return <TaskAssignForm taskId={params.id} />;
}