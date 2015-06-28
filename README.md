# CreativEngine Development Utilities

A collection of development utilities such as gulp-based less/js compilation and minification that are geared towards the CreativEngine development environment.

## Installation

1. Clone the repo into your webroot directory
2. If you don't have it already, install npm via the node install @ https://nodejs.org/
3. From the repo directory, run `npm install`

## Running

Since globbing for less and js files on the entire webroot results in a 'maximum call stack size exceeded' error, I've split the watch tasks into smaller, individual subtasks. This has the added benefit that we don't need to check for common.less vs. theme.less or whatever, since the filenames are by convention project-specific.

As of the initial commit, there's only a `senx` subtask, which watches `.less` files in the `/themes` directory and `.js` files in the `/scripts/src/` directory and compiles and minifies any time there's a change.

For `.less` files, the watch task will compile `/themes/[theme]/styles/less/common.less` to `/themes/[theme]/styles/common.css`.

For `.js` it will compile `/scripts/src/[file].js` to `/scripts/[file].js`. If the file is in a subfolder within `/scripts/src/` that directory structure will be mirrored in `/scripts/`.

To start the senx subtask, navigate to the `ce-utils` directory and run:

`gulp senx-utils`

That's it!
