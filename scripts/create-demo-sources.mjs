import * as fs from 'node:fs';
import * as glob from 'glob';

const sourcePath = './projects/demo/src/app/demos';
const sourceTrimmer = /^.*(\/|\\)demos(\/|\\)/;
const outputFile = './projects/demo/src/assets/demos-sources.ts';

const sources = {};
const fileNames = glob.sync(`${sourcePath}/**/*-demo.component.{html,ts}`, { ignore: ['**/*spec.ts', '**/*routes.ts'] });


for (const fileName of fileNames) {
  // create demoName from remaining portions of path.  Making sure the slash is normalized.
  const demoName = fileName.replace(sourceTrimmer, '').replaceAll('\\', '/');
  console.log(`reading ${demoName}`);
	sources[demoName] = fs.readFileSync(fileName, 'utf-8');
}

createNewFile(outputFile);
fs.writeFileSync(
	outputFile,
	`export default ${JSON.stringify(sources, null, 2)
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029')};`
);
/** Creates a file if it doesn't exist */
function createNewFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
}
