import TaskForm from '@/components/TaskForm';

export default function EditTaskPage({ params }) {
  return <TaskForm taskId={params.id} />;
}