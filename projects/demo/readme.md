# Angular Signal Generators Demo
This project is meant to demonstrate functionality of the library.  Every library feature should have its own demo.

## Components of Feature Demo
* Home Page Demo
* A Demo Page
* At least one interactive demo on the Demo Page
* The page added to routing.
* A Configuration file which links all the above together.

## Adding a Demo

### Creating a demo Page
* Run this command to create a new demo page:
```
ng g c demos/{feature-name} --project demo -flat=false
```
* Add the page to routing.
* Create an entry in *demo-configuration.ts*.
* Import *SignalHeaderComponent* and add a reference to the top of the template.
```
<app-signal-header fnName="[FEATURE_NAME]" />
```

### Creating a demo Component

* After a documentation page is created you can add a demo using the following cli command format (note that the demo ends in *-demo* by convention):
```
ng g c demos/{feature-name}/{demo-name}-demo --project demo --inline-template=false --flat=false
```
* Run the package.json script `demo:add-demo-file-collections`.
* If not already done, import *DemoHostComponent* in the feature page.
* Include a demo-host element that refers to the component.
  * It must has a *pattern* attribute that matches the component and template used in the demo.
  * If there are multiple components, use *primaryComponentPattern* to match the main component so it is shown first.
  * If there are extra components that are necessary for the demo to work but don't serve an explanatory purpose then hide them with *hiddenPattern*.


## Loading StackBlitz Template
Like when creating a new feature demo, running `demo:add-demo-file-collections` will create the StackBlitz template that is used to launch every project.  The template can be modified by editing the files in the [/scripts](/scripts) folder.

(more explanation)
