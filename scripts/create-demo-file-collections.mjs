import * as fs from 'node:fs';
import * as glob from 'glob';

createDemoSources();
createStackblitzTemplate();

function createDemoSources() {
  /** replacement strings in files */
  const replacements = [
    { find: 'projects/signal-generators/src/public-api', replace: '@ddtmm/angular-signal-generators' },
  ];
  // create demoName from remaining portions of path.  Making sure the slash is normalized.
  const nameTransformFn = (fileName) => fileName.replace(/^.*(\/|\\)demos(\/|\\)/, '').replaceAll('\\', '/');
  const fileNames = glob.sync(`./projects/demo/src/app/demos/**/*-demo/*.{html,ts}`);
  createFileCollection('./projects/demo/src/app/services/demos-sources.ts', fileNames, nameTransformFn, replacements);
}

function createStackblitzTemplate() {
  const fileNames = glob.sync(`./scripts/stackblitz-template-app/**/*.*`);
  const nameTransformFn = (fileName) => fileName.replace(/^.*(\/|\\)stackblitz-template-app(\/|\\)/, '').replaceAll('\\', '/');
  createFileCollection('./projects/demo/src/app/services/stackblitz-templates.ts', fileNames, nameTransformFn);
}

/**
 * Create an output file with transformed content from input files.
 *
 * @param {string} outputFileName - The name of the output file to be created.
 * @param {Array<string>} fileNames - An array of input file names.
 * @param {Function} nameTransformFn - A function to transform the file names into their respective keys.
 * @param {Array<{ find: string, replace: string }>?} replacements - An optional array of strings to find and replace in file content.
 */
function createFileCollection(outputFileName, fileNames, nameTransformFn, replacements) {
  const sources = {};

  for (const fileName of fileNames) {
    const fileKey = nameTransformFn ? nameTransformFn(fileName) : fileName;
    console.log('\x1b[34m' + `reading ${fileKey}` + '\x1b[0m');
    sources[fileKey] = fs.readFileSync(fileName, 'utf-8');
    if (replacements) {
      replacements.forEach(({ find, replace }) => {
        sources[fileKey] = sources[fileKey].replace(find, replace);
      });
    }
  }
  console.log('\x1b[32m' + `creating ${outputFileName}` + '\x1b[0m');
  fs.writeFileSync(
    outputFileName,
    `export default ${JSON.stringify(sources, null, 2)}`
  );
}
