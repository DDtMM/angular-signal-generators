# Contributing
Add all new contributions to the latest Angular version branch.  For example if the latest Angular version is 20, add to the 20.x branch.

## Adding new Code
* Try to follow established patterns.
* Write tests.  They're easy.  The goal is full coverage.  It won't make the main branch unless *somebody* writes them.
* It would be cool if you can merge your changes in all the currently supported version branches and test them out. 
There should be a command in package.json like **patch-signal-generators-project**.

## Documentation Needs Help
Anybody can write documentation.  Don't be scared.

## Demo Site

### API Docs
* The *src/api* folder should be excluded in *.gitignore*.
* During deployment the API docs are added to the *api* folder automatically.
* To view the latest API changes locally, run `demo:add-current-api-docs`.  This uses typedoc to add docs to *src/api* folder in *src*.

## Deployment
* Run test with all active Angular version branches first.
* Build with `build:signal-generators` command.  This will run tests first.  And then update README with coverage badges.
* Don't deploy without 100% passing.
* Create a release when done.

