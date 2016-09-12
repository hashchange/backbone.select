# Generating r.js builds

## Using a Grunt task

Instead of individual r.js calls, the following command will create all builds:

```
grunt requirejs
```

The grunt task simply reads the build profiles described below, and feeds them to r.js.


## Split builds with two build files, for JS Bin demos

The demo HTML files for JS Bin reference two concatenated build files (per page):

- `vendor.js` for the third-party dependencies. It includes Backbone.Select.
- `basic-app.js`, `baskets-app.js`, `focus-exclusive-app.js`, `focus-label-app.js` and `trailing-app.js` for the demo code, consisting of local modules.

The code is not rolled up into a single file because that file would be massive, making it unnecessarily difficult to examine the demo code. The purpose of the demo is to see how Backbone.Select is used, so it makes sense to keep the client code separate.

### Adjustments

Care must be taken to avoid duplication. A module pulled into `vendor.js` must not be part of `*-app.js`, and vice versa. Update the module exclusions in **all** build config files when new modules are added to a demo.

### r.js calls

Open a command prompt in the **project root** directory.

```
# For vendor.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/vendor-config.js

# For basic-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/basic-app-config.js

# For baskets-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/baskets-app-config.js

# For focus-exclusive-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/focus-exclusive-app-config.js

# For focus-label-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/focus-label-app-config.js

# For trailing-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/trailing-app-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/parts`.


## Single-file builds, for local demos

Builds for local demos are created to test that the setup continues to work after optimization with r.js. All modules of a demo end up in a single file. For easier examination, the file is not minified.

For more info, see the comments in `index.html`, `baskets.html`, `focus-exclusive.html`, `focus-label.html` and `trailing.html`.

### r.js calls

For building the output file, open a command prompt in the **project root** directory, and run these commands:

```
# For the "basic" demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/basic-build-config.js

# For the "baskets" demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/baskets-build-config.js

# For the "focus-exclusive" demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/focus-exclusive-build-config.js

# For the "focus-label" demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/focus-label-build-config.js

# For the "trailing" demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/trailing-build-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/unified`.