import { AggregateCreateNodesError, logger } from '@nx/devkit';
import { execGradleAsync } from './exec-gradle';

export const fileSeparator = process.platform.startsWith('win')
  ? 'file:///'
  : 'file://';

export const newLineSeparator = process.platform.startsWith('win')
  ? '\r\n'
  : '\n';

/**
 * This function executes the gradle projectReportAll task and returns the output as an array of lines.
 * @param gradlewFile the absolute path to the gradlew file
 * @returns project report lines
 */
export async function getProjectReportLines(gradlewFile: string) {
  let projectReportBuffer: Buffer;
  try {
    projectReportBuffer = await execGradleAsync(gradlewFile, [
      'projectReportAll',
    ]);
  } catch (e) {
    try {
      projectReportBuffer = await execGradleAsync(gradlewFile, [
        'projectReport',
      ]);
      logger.warn(
        'Could not run `projectReportAll` task. Ran `projectReport` instead. Please run `nx generate @nx/gradle:init` to generate the necessary tasks.'
      );
    } catch (e) {
      throw new AggregateCreateNodesError(
        [
          [
            null,
            new Error(
              'Could not run `projectReportAll` or `projectReport` task. Please run `nx generate @nx/gradle:init` to generate the necessary tasks.'
            ),
          ],
        ],
        []
      );
    }
  }
  return projectReportBuffer
    .toString()
    .split(newLineSeparator)
    .filter((line) => line.trim() !== '');
}
