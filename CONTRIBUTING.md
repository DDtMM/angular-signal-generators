# Contributing
Contributions welcome.  Try to follow established patterns.

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

