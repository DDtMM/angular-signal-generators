# Contributing
Add new contributions to the main development branch. Compatibility with supported Angular versions is verified from the same source tree.

## Adding new Code
* Try to follow established patterns.
* Write tests.  They're easy.  The goal is full coverage.  It won't make the main branch unless *somebody* writes them.
* Run `npm run test:compat:all` to test the library with Angular 20, 21, and 22. To test one version, run `npm run test:compat -- 20` (or `21`/`22`). Compatibility runs use temporary installations and do not modify the working tree.

## Documentation Needs Help
Anybody can write documentation.  Don't be scared.

## Demo Site

### API Docs
* The *src/api* folder should be excluded in *.gitignore*.
* During deployment the API docs are added to the *api* folder automatically.
* To view the latest API changes locally, run `demo:add-current-api-docs`.  This uses typedoc to add docs to *src/api* folder in *src*.

## Deployment
* Run `npm run test:compat:all` first.
* Build with `build:signal-generators` command.  This will run tests first.  And then update README with coverage badges.
* Don't deploy without 100% passing.
* Create a release when done.

