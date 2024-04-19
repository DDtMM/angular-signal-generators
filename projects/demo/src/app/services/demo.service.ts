import { Injectable } from '@angular/core';
import { Project, ProjectFiles } from '@stackblitz/sdk';
import { default as sources } from './demos-sources';
import { default as templates} from './stackblitz-templates';
/** Supported source types. */
export type SourceType = 'html' | 'typescript' | 'unknown';

export interface SourceFile {
  /** The content of the source file. */
  code: string,
  /** file name */
  name: string,
  /** Type of file */
  type: SourceType
}
@Injectable({ providedIn: 'root' })
export class DemoService {

  /** Gets source type from file name. */
  getSourceTypeFromFileName(name: string): SourceType {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    switch (ext) {
      case 'html': return 'html';
      case 'ts': return 'typescript';
      default: return 'unknown';
    }
  }
  /**
   * Opens a project in a new window on StackBlitz.
   *
   * @param projectTitle - The title of the project.
   * @param sources - An array of SourceFile objects.
   * @param bootstrapComponentFinder - An optional function to find the bootstrap component.  Otherwise the first typescript file is used.
   * @return A promise that resolves once the project begins opening.
   */
  async openProject(projectTitle: string, sources: SourceFile[], bootstrapComponentFinder?: (x: SourceFile) => boolean): Promise<void> {
    // The sdk will not work without window being defined.
    if (typeof window !== 'undefined') {
      const sdk = await import('@stackblitz/sdk');
      const primaryFile = bootstrapComponentFinder ? sources.find(bootstrapComponentFinder) : sources.find(x => x.type === 'typescript');
      if (!primaryFile) {
        throw new Error('No bootstrap component file found');
      }
      const importPath = primaryFile.name.replace(/\.ts$/, '');
      const componentClass = /export\s+class\s+(\w+)/.exec(primaryFile.code)![1];
      const componentSelector = /selector:\s*'([^']+)'/.exec(primaryFile.code)![1];
      const demoFiles: ProjectFiles = sources.reduce((acc, source) => {
        acc[`src/${source.name}`] = source.code;
        return acc;
      }, {} as ProjectFiles);
      const templateFiles: ProjectFiles = Object.entries(templates).reduce((acc, [key, value]) => {
        acc[key] = value.replaceAll('$$DemoClass$$', componentClass)
          .replaceAll('$$DemoPath$$', importPath)
          .replaceAll('$$DemoSelector$$', componentSelector);
        return acc;
      }, {} as ProjectFiles)
      const project: Project = {
        title: projectTitle,
        template: 'node',
        files: { ...demoFiles, ...templateFiles }
      };
      console.log(project);
      sdk.default.openProject(project, {
        openFile: [`src/${primaryFile.name}`],
        newWindow: true
      });
    }
  }

  /** Gets all files whose names match the given matcher. */
  getSourceFiles(matcher: RegExp): SourceFile[] {
    return Object.entries(sources)
      .filter(([key]) => matcher.test(key))
      .map(([key, value]) => {
        const name = key.substring(key.lastIndexOf('/') + 1);
        const type = this.getSourceTypeFromFileName(name);
        return {
          code: value,
          name: name,
          type: type
        };
      });
  }
}
