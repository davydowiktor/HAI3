import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { STANDALONE_APP_WORKSPACES } from '../core/packageManager.js';
import {
  UNIT_TEST_DEV_DEPENDENCIES,
  buildPackageJson,
  generateProject,
  getProjectUtilsTemplate,
} from './project.js';

function assertManifestHasRootDirectories(
  value: unknown
): asserts value is { root: { directories: string[] } } {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('root' in value) ||
    typeof (value as { root: unknown }).root !== 'object' ||
    (value as { root: unknown }).root === null ||
    !('directories' in (value as { root: { directories?: unknown } }).root) ||
    !Array.isArray((value as { root: { directories: unknown[] } }).root.directories)
  ) {
    throw new Error('expected manifest.root.directories');
  }
}

describe('getProjectUtilsTemplate', () => {
  it('uses shadcn utils template for shadcn projects', () => {
    expect(getProjectUtilsTemplate('shadcn')).toBe('src/app/lib/utils.ts');
  });

  it('uses local cn utils template for none projects', () => {
    expect(getProjectUtilsTemplate('none')).toBe('src/app/lib/utils.no-uikit.ts');
  });

  it('uses local cn utils template for third-party uikit projects', () => {
    expect(getProjectUtilsTemplate('@acme/design-system')).toBe('src/app/lib/utils.no-uikit.ts');
  });
});

describe('buildPackageJson', () => {
  it('adds the standard unit-test scripts to generated projects', () => {
    const packageJson = JSON.parse(buildPackageJson({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      useLocalPackages: false,
    }));

    expect(packageJson.scripts.test).toBe('vitest run');
    expect(packageJson.scripts['test:unit']).toBe('vitest --run --passWithNoTests=false');
    expect(packageJson.scripts['test:unit:watch']).toBe('vitest --watch');
  });

  it('adds the starter test and Node toolchain dependencies', () => {
    const packageJson = JSON.parse(buildPackageJson({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      useLocalPackages: false,
    }));

    expect(packageJson.devDependencies['@types/node']).toBe('^24.9.1');
    expect(packageJson.devDependencies.vitest).toBe(UNIT_TEST_DEV_DEPENDENCIES.vitest);
    expect(packageJson.devDependencies['@testing-library/react']).toBe(
      UNIT_TEST_DEV_DEPENDENCIES['@testing-library/react'],
    );
    expect(packageJson.devDependencies['@testing-library/dom']).toBe(
      UNIT_TEST_DEV_DEPENDENCIES['@testing-library/dom'],
    );
    expect(packageJson.devDependencies.jsdom).toBe(UNIT_TEST_DEV_DEPENDENCIES.jsdom);
    expect(packageJson.devDependencies['@vitest/coverage-v8']).toBe(
      UNIT_TEST_DEV_DEPENDENCIES['@vitest/coverage-v8'],
    );
  });

  it('pins React via resolutions for Yarn (npm overrides are not applied by Yarn)', () => {
    const packageJson = JSON.parse(
      buildPackageJson({
        projectName: 'demo-app',
        studio: false,
        uikit: 'shadcn',
        packageManager: 'yarn',
        useLocalPackages: false,
      })
    );

    expect(packageJson.overrides).toBeUndefined();
    expect(packageJson.resolutions).toEqual({
      react: packageJson.dependencies.react,
      'react-dom': packageJson.dependencies['react-dom'],
    });
  });

  it('includes MFE package paths in workspaces so Yarn 4 accepts nested package scripts', () => {
    const packageJson = JSON.parse(
      buildPackageJson({
        projectName: 'demo-app',
        studio: false,
        uikit: 'shadcn',
        packageManager: 'npm',
        useLocalPackages: false,
      }),
    );

    expect(packageJson.workspaces).toEqual([...STANDALONE_APP_WORKSPACES]);
  });
});

describe('project template coverage', () => {
  const tempProjectRoots: string[] = [];

  async function makeTempProjectPath(prefix: string): Promise<string> {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), prefix));
    tempProjectRoots.push(root);
    return root;
  }

  afterEach(async () => {
    await Promise.all(tempProjectRoots.splice(0).map((root) => fs.promises.rm(root, {
      recursive: true,
      force: true,
    })));
  });

  it('keeps the host-app test directories wired into standalone project generation', () => {
    const manifestPath = fileURLToPath(
      new URL('../../template-sources/manifest.yaml', import.meta.url),
    );
    const manifestUnknown = yaml.load(fs.readFileSync(manifestPath, 'utf-8'));
    assertManifestHasRootDirectories(manifestUnknown);
    const manifest = manifestUnknown;
    const requiredHostAppDirectories = [
      'src/app/actions',
      'src/app/api',
      'src/app/components',
      'src/app/effects',
      'src/app/events',
      'src/app/icons',
      'src/app/lib',
      'src/app/mfe',
      'src/app/themes',
    ];
    const appDirectories = manifest.root.directories
      .filter((directory) => directory.startsWith('src/app/'))
      .sort((left, right) => left.localeCompare(right));
    const supportDirectories = manifest.root.directories
      .filter((directory) => directory === 'src/__test-utils__');

    expect(appDirectories).toEqual(expect.arrayContaining(requiredHostAppDirectories));
    expect(supportDirectories).toEqual(['src/__test-utils__']);
    expect(new Set(appDirectories).size).toBe(appDirectories.length);
  });

  it('copies vitest.setup.ts alongside vitest.config.ts so scaffolded tests can boot', async () => {
    expect.assertions(3);
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      projectPath: await makeTempProjectPath('frontx-project-test-vitest-setup-'),
    });

    const setupFile = projectFiles.find((file) => file.path === 'vitest.setup.ts');
    const configFile = projectFiles.find((file) => file.path === 'vitest.config.ts');

    expect(configFile).toBeTruthy();
    expect(setupFile).toBeTruthy();
    // vitest.config.ts references ./vitest.setup.ts via setupFiles — the two must ship together.
    expect(configFile!.content).toContain('vitest.setup.ts');
  });

  it('carries the standalone MFE bootstrap contract test into generated projects', async () => {
    expect.assertions(5);
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'none',
      packageManager: 'npm',
      projectPath: await makeTempProjectPath('frontx-project-test-bootstrap-'),
    });

    const bootstrapTestFile = projectFiles.find(
      (file) => file.path === 'src/app/mfe/bootstrap.test.ts',
    );

    expect(bootstrapTestFile).toBeTruthy();
    expect(bootstrapTestFile!.content).toContain('describeBootstrapMfeContract');
    expect(bootstrapTestFile!.content).toContain("bootstrapModulePath: './bootstrap.ts'");
    expect(bootstrapTestFile!.content).toContain(
      "manifestsModulePath: './generated-mfe-manifests.ts'",
    );
    expect(bootstrapTestFile!.content).toContain('callerUrl: import.meta.url');
  });

  it('includes the shared MFE Vitest base in generated app projects', async () => {
    expect.assertions(2);
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'none',
      packageManager: 'npm',
      projectPath: await makeTempProjectPath('frontx-project-test-'),
    });

    const vitestBaseFile = projectFiles.find(
      (file) => file.path === 'src/mfe_packages/vitest.mfe.base.ts',
    );

    expect(vitestBaseFile).toBeTruthy();
    expect(vitestBaseFile!.content).toContain('mfeVitestBaseConfig');
  });

  it('rewrites generated demo MFE tsconfig to extend the scaffold root tsconfig', async () => {
    expect.assertions(3);
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      projectPath: await makeTempProjectPath('frontx-project-test-mfe-'),
    });

    const demoTsconfigFile = projectFiles.find(
      (file) => file.path === 'src/mfe_packages/demo-mfe/tsconfig.json',
    );

    expect(demoTsconfigFile).toBeTruthy();
    expect(demoTsconfigFile!.content).toMatch(/"extends": "\.\.\/\.\.\/\.\.\/tsconfig\.json"/);
    expect(demoTsconfigFile!.content).not.toMatch(
      /packages\/cli\/template-sources\/project\/configs\/tsconfig\.json/,
    );
  });

  it('rewrites generated demo MFE @cyberfabric deps to local file refs when requested', async () => {
    expect.assertions(3);
    const projectPath = await makeTempProjectPath('frontx-project-test-local-mfe-');
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      useLocalPackages: true,
      monorepoRoot: '/repo',
      projectPath,
    });

    const demoPackageJsonFile = projectFiles.find(
      (file) => file.path === 'src/mfe_packages/demo-mfe/package.json',
    );

    expect(demoPackageJsonFile).toBeTruthy();
    const demoPackageJson = JSON.parse(demoPackageJsonFile!.content) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(demoPackageJson.dependencies['@cyberfabric/react']).toMatch(/^file:/);
    expect(demoPackageJson.devDependencies['@cyberfabric/framework']).toMatch(/^file:/);
  });

  it('wires shared test-utils aliases into the generated root tsconfig', async () => {
    expect.assertions(2);
    const projectFiles = await generateProject({
      projectName: 'demo-app',
      studio: false,
      uikit: 'shadcn',
      packageManager: 'npm',
      projectPath: await makeTempProjectPath('frontx-project-test-tsconfig-'),
    });

    const rootTsconfigFile = projectFiles.find((file) => file.path === 'tsconfig.json');

    expect(rootTsconfigFile).toBeTruthy();
    expect(rootTsconfigFile!.content).toMatch(
      /"@frontx-test-utils\/\*": \["\.\/src\/__test-utils__\/\*"\]/,
    );
  });
});
