# CreativEngine Development Utilities

A gulp-based less/sass/js (with uglify and webpack variants) compilation and minification utility that's kinda-sorta geared towards the CreativEngine development environment.

## Installation

1. Clone the repo
2. If you don't have it already, install npm via the node install @ https://nodejs.org/
3. Make sure gulp is installed globally: `npm install -g gulp`; note that while `sudo` is fine for gulp, as a general practice [you really shouldn't use it to install modules globally](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
4. From the repo directory, run `npm install`

## Running

Navigate to the cloned directory, and type `gulp ce-utils [args]`

Alternately, add an alias to your .bash_profile like so (the example below assumes you've cloned the ce-utils folder into your user directory):

`alias ce-utils='cd ~/ce-utils/;gulp ce-utils'`

Which will enable you to simply type `ce-utils [args]` without navigating to the cloned directory.

### Arguments

`--help` - lists all available arguments

`--list` - lists all available environments

`--env [environment]` - loads the specified environment, e.g. `--env senx`

`--theme [theme]` - for the senx env, restricts the LESS globbing pattern to that theme, e.g. `--theme senatorx`

`--all` - loads all available environments

`--dev` - generates an inline less sourcemap when passed with either `--env` or `--all`, e.g. `ce-utils --all --dev`

**NOTE:** depending on the scope of the glob patterns in the environments specified in the config, you might see a 'maximum call stack size exceeded' error when using the `--all` argument. If you do, either refine the glob pattern to target a smaller number of files, or fall back to the `--env [environment]` argument.
