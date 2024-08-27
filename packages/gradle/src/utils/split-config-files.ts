import { AggregateCreateNodesError, workspaceRoot } from '@nx/devkit';
import { combineGlobPatterns } from 'nx/src/utils/globs';
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export const GRADLE_BUILD_FILES = new Set(['build.gradle', 'build.gradle.kts']);
export const GRALDE_SETTINGS_FILES = new Set([
  'settings.gradle',
  'settings.gradle.kts',
]);
export const GRADLE_TEST_FILES = [
  '**/src/test/java/**/*Test.java',
  '**/src/test/kotlin/**/*Test.kt',
  '**/src/test/java/**/*Tests.java',
  '**/src/test/kotlin/**/*Tests.kt',
];

export const gradleConfigGlob = combineGlobPatterns(
  ...Array.from(GRADLE_BUILD_FILES).map((file) => `**/${file}`)
);

export const gradleConfigAndTestGlob = combineGlobPatterns(
  ...Array.from(GRADLE_BUILD_FILES).map((file) => `**/${file}`),
  ...Array.from(GRALDE_SETTINGS_FILES).map((file) => `**/${file}`),
  ...GRADLE_TEST_FILES
);

/**
 * This function split config files into build files, settings files, test files and project roots
 * @param files list of files to split
 * @returns object with buildFiles, gradlewFiles, testFiles and projectRoots
 * For gradlewFiles, it will start with settings files and find the nearest gradlew file in the workspace
 */
export function splitConfigFiles(
  files: readonly string[],
  wr: string = workspaceRoot
): {
  buildFiles: string[];
  gradlewFiles: string[];
  testFiles: string[];
  projectRoots: string[];
} {
  const buildFiles = [];
  const settingsFiles = [];
  const testFiles = [];
  const projectRoots = new Set<string>();

  files.forEach((file) => {
    const filename = basename(file);
    const fileDirectory = dirname(file);
    if (GRADLE_BUILD_FILES.has(filename)) {
      buildFiles.push(file);
      projectRoots.add(fileDirectory);
    } else if (GRALDE_SETTINGS_FILES.has(filename)) {
      settingsFiles.push(file);
      projectRoots.add(fileDirectory);
    } else {
      testFiles.push(file);
    }
  });

  const gradlewFiles = new Set(
    settingsFiles.map((f) => findGraldewFile(f, wr))
  );

  return {
    buildFiles,
    testFiles,
    gradlewFiles: Array.from(gradlewFiles),
    projectRoots: Array.from(projectRoots),
  };
}

/**
 * This function recursively finds the nearest gradlew file in the workspace
 * @param filePath the path to start searching for gradlew file
 * @returns the relative path of the gradlew file to workspace root, throws an error if gradlew file is not found
 * It will return gradlew.bat file on windows and gradlew file on other platforms
 */
export function findGraldewFile(
  filePath: string,
  wr: string = workspaceRoot
): string {
  const fileDirectory = dirname(filePath);
  const gradlewPath = join(dirname(filePath), 'gradlew');
  const gradlewBatPath = join(dirname(filePath), 'gradlew.bat');
  if (process.platform.startsWith('win')) {
    if (existsSync(join(wr, gradlewBatPath))) {
      return gradlewBatPath;
    }
  } else {
    if (existsSync(join(wr, gradlewPath))) {
      return gradlewPath;
    }
  }

  if (!fileDirectory || fileDirectory === '.') {
    throw new AggregateCreateNodesError(
      [[null, new Error('No Gradlew file found. Run "gradle init"')]],
      []
    );
  }
  return findGraldewFile(fileDirectory, wr);
}
