import { TaskRun, TaskTarget } from '../../native';
import { TaskHistory } from '../../utils/task-history';

let taskHistory: TaskHistory;

export function getTaskHistory() {
  if (!taskHistory) {
    taskHistory = new TaskHistory();
  }
  return taskHistory;
}

export async function handleRecordTaskRuns(taskRuns: TaskRun[]) {
  const taskHistory = getTaskHistory();
  await taskHistory.recordTaskRuns(taskRuns);
  return {
    response: 'true',
    description: 'handleRecordTaskRuns',
  };
}

export async function handleGetFlakyTasks(hashes: string[]) {
  const taskHistory = getTaskHistory();
  const history = await taskHistory.getFlakyTasks(hashes);
  return {
    response: JSON.stringify(history),
    description: 'handleGetFlakyTasks',
  };
}

export async function handleGetEstimatedTaskTimings(targets: TaskTarget[]) {
  const taskHistory = getTaskHistory();
  const history = await taskHistory.getEstimatedTaskTimings(targets);
  return {
    response: JSON.stringify(history),
    description: 'handleGetEstimatedTaskTimings',
  };
}
