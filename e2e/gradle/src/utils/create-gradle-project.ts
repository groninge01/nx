import {
  e2eConsoleLogger,
  isWindows,
  runCommand,
  tmpProjPath,
} from '@nx/e2e/utils';
import { execSync } from 'child_process';
import { resolve } from 'path';

export function createGradleProject(
  projectName: string,
  type: 'kotlin' | 'groovy' = 'kotlin',
  cwd: string = tmpProjPath()
) {
  e2eConsoleLogger(`Using java version: ${execSync('java -version')}`);
  const gradleCommand = isWindows()
    ? resolve(`${__dirname}/../../gradlew.bat`)
    : resolve(`${__dirname}/../../gradlew`);
  e2eConsoleLogger(
    'Using gradle version: ' +
      execSync(`${gradleCommand} --version`, {
        cwd,
      })
  );
  e2eConsoleLogger(
    execSync(`${gradleCommand} help --task :init`, {
      cwd,
    }).toString()
  );
  e2eConsoleLogger(
    runCommand(
      `${gradleCommand} init --type ${type}-application --dsl ${type} --project-name ${projectName} --package gradleProject --no-incubating --split-project`,
      {
        cwd,
      }
    )
  );
}
