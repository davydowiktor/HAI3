import fs from 'fs-extra';
import path from 'path';
import type { Hai3Config } from '../core/types.js';

/**
 * Config file name
 */
export const CONFIG_FILE = 'hai3.config.json';

/**
 * Check if a directory has @hai3/* dependencies in package.json
 */
async function hasHai3Dependencies(dir: string): Promise<boolean> {
  const packageJsonPath = path.join(dir, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }
  try {
    const packageJson = await fs.readJson(packageJsonPath);
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return Object.keys(allDeps).some((dep) => dep.startsWith('@hai3/'));
  } catch {
    return false;
  }
}

/**
 * Find HAI3 project root by looking for hai3.config.json or package.json with @hai3/* deps
 * Traverses parent directories until found or reaches filesystem root
 */
export async function findProjectRoot(
  startDir: string
): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const { root } = path.parse(currentDir);

  while (currentDir !== root) {
    // First check for explicit hai3.config.json
    const configPath = path.join(currentDir, CONFIG_FILE);
    if (await fs.pathExists(configPath)) {
      return currentDir;
    }
    // Fallback: check for package.json with @hai3/* dependencies
    if (await hasHai3Dependencies(currentDir)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Load HAI3 config from project root
 * Returns null if config file doesn't exist
 */
export async function loadConfig(
  projectRoot: string
): Promise<Hai3Config | null> {
  const configPath = path.join(projectRoot, CONFIG_FILE);
  if (!(await fs.pathExists(configPath))) {
    return null;
  }
  const content = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(content) as Hai3Config;
}

/**
 * Save HAI3 config to project root
 */
export async function saveConfig(
  projectRoot: string,
  config: Hai3Config
): Promise<void> {
  const configPath = path.join(projectRoot, CONFIG_FILE);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
}

/**
 * Check if a directory is inside a HAI3 project
 */
export async function isInsideProject(dir: string): Promise<boolean> {
  return (await findProjectRoot(dir)) !== null;
}

/**
 * Get screensets directory path
 */
export function getScreensetsDir(projectRoot: string): string {
  return path.join(projectRoot, 'src', 'screensets');
}

/**
 * Check if a screenset exists
 */
export async function screensetExists(
  projectRoot: string,
  screensetId: string
): Promise<boolean> {
  const screensetPath = path.join(getScreensetsDir(projectRoot), screensetId);
  return fs.pathExists(screensetPath);
}

/**
 * Find HAI3 monorepo root by walking up from a given path.
 * A directory is the monorepo root if it has packages/ and a root package.json
 * with workspaces that include "packages/*".
 * Use when the CLI runs from a linked copy (npm link) so generated projects
 * can reference local packages via file:.
 */
export async function findMonorepoRoot(fromPath: string): Promise<string | null> {
  const envRoot = process.env.HAI3_MONOREPO_ROOT;
  if (envRoot && (await fs.pathExists(path.join(envRoot, 'packages', 'react', 'package.json')))) {
    return path.resolve(envRoot);
  }

  let currentDir = path.resolve(fromPath);
  const { root } = path.parse(currentDir);

  while (currentDir !== root) {
    const pkgPath = path.join(currentDir, 'package.json');
    const reactPkgPath = path.join(currentDir, 'packages', 'react', 'package.json');
    if ((await fs.pathExists(pkgPath)) && (await fs.pathExists(reactPkgPath))) {
      try {
        const pkg = await fs.readJson(pkgPath);
        const workspaces = pkg.workspaces as string[] | undefined;
        if (Array.isArray(workspaces) && workspaces.some((w: string) => w.startsWith('packages/'))) {
          return currentDir;
        }
      } catch {
        // ignore
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Resolve a @hai3 package name to a file: URL path relative to projectPath.
 * e.g. '@hai3/react' with monorepoRoot /repo and projectPath /repo/app
 * returns 'file:../packages/react'.
 */
export function getLocalPackageRef(
  packageName: string,
  monorepoRoot: string,
  projectPath: string
): string {
  if (!packageName.startsWith('@hai3/')) {
    return packageName;
  }
  const subPackage = packageName.slice('@hai3/'.length);
  const packageDir = path.join(monorepoRoot, 'packages', subPackage);
  const relativePath = path.relative(projectPath, packageDir);
  const normalized = relativePath.split(path.sep).join('/');
  return `file:${normalized}`;
}
