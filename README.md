# CreativEngine Development Utilities

A collection of development utilities such as gulp-based less/js compilation and minification that are geared towards the CreativEngine development environment.

## Installation

1. Clone the repo
2. If you don't have it already, install npm via the node install @ https://nodejs.org/
3. From the repo directory, run `npm install`
4. for now the only included environment is `senx`; for custom environment configuration, rename the included config-SAMPLE.js as config.js and modify as needed

## Running

1. navigate to the cloned directory
2. type `ce-utils --env [environment]`; e.g. `ce-utils -env senx`

Alternately, add an alias to your .bash_profile/.bashrc like so (the example below assumes you cloned the ce-utils folder into your user directory):

`alias ce-utils='cd ~/ce-utils/;gulp ce-utils'`

Then invoke via `ce-utils --env [environment]``; e.g. `ce-utils -env senx`

That's it!
