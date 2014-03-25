# Frontend Code [![Build Status](https://travis-ci.org/maggiben/apicatus.png?branch=master)](https://travis-ci.org/maggiben/apicatus) [![Coverage Status](https://coveralls.io/repos/maggiben/apicatus/badge.png)](https://coveralls.io/r/maggiben/apicatus) [![Dependency Status](https://gemnasium.com/maggiben/apicatus.png)](https://gemnasium.com/maggiben/apicatus) [![Code Climate](https://codeclimate.com/github/maggiben/apicatus.png)](https://codeclimate.com/github/maggiben/apicatus)

## Quick Start

Install Node.js and then:

```sh
$ git clone git://github.com/apicatus/frontend
$ cd frontend
$ sudo npm -g install grunt-cli karma bower
$ npm install
$ bower install
$ grunt watch
```

Finally, open `file:///path/to/frontend/build/index.html` in your browser.

Happy hacking!

## Learn

### Overall Directory Structure

At a high level, the structure looks roughly like this:

```
frontend/
  |- grunt-tasks/
  |- karma/
  |- src/
  |  |- app/
  |  |  |- <app logic>
  |  |- assets/
  |  |  |- <static files>
  |  |- common/
  |  |  |- <reusable code>
  |  |- less/
  |  |  |- main.less
  |- vendor/
  |  |- angular-bootstrap/
  |  |- bootstrap/
  |  |- placeholders/
  |- .bowerrc
  |- bower.json
  |- build.config.js
  |- Gruntfile.js
  |- module.prefix
  |- module.suffix
  |- package.json
```

What follows is a brief description of each entry, but most directories contain
their own `README.md` file with additional documentation, so browse around to
learn more.

- `karma/` - test configuration.
- `src/` - our application sources. [Read more &raquo;](src/README.md)
- `vendor/` - third-party libraries. [Bower](http://bower.io) will install
  packages here. Anything added to this directory will need to be manually added
  to `build.config.js` and `karma/karma-unit.js` to be picked up by the build
  system.
- `.bowerrc` - the Bower configuration file. This tells Bower to install
  components into the `vendor/` directory.
- `bower.json` - this is our project configuration for Bower and it contains the
  list of Bower dependencies we need.
- `build.config.js` - our customizable build settings; see "The Build System"
  below.
- `Gruntfile.js` - our build script; see "The Build System" below.
- `module.prefix` and `module.suffix` - our compiled application script is
  wrapped in these, which by default are used to place the application inside a
  self-executing anonymous function to ensure no clashes with other libraries.
- `package.json` - metadata about the app, used by NPM and our build script. Our
  NPM dependencies are listed here.

The `grunt watch` command will execute a full build

up-front and then run any of the aforementioned `delta:*` tasks as needed to
ensure the fastest possible build. So whenever you're working on your project,
start with:

```sh
$ grunt watch
```

And everything will be done automatically!

### Build vs. Compile

To make the build even faster, tasks are placed into two categories: build and
compile. The build tasks (like those we've been discussing) are the minimal
tasks required to run your app during development.

Compile tasks, however, get your app ready for production. The compile tasks
include concatenation, minification, compression, etc. These tasks take a little
bit longer to run and are not at all necessary for development so are not called
automatically during build or watch.

To initiate a full compile, you simply run the default task:

```sh
$ grunt
```

This will perform a build and then a compile. The compiled site - ready for
uploading to the server! - is located in `bin/`, taking a cue from
traditional software development. To test that your full site works as
expected, open the `bin/index.html` file in your browser. Voila!

### Live Reload!

Also includes [Live Reload](http://livereload.com/), so you no
longer have to refresh your page after making changes! You need a Live Reload
browser plugin for this:

- Chrome - [Chrome Webstore](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)
- Firefox - [Download from Live Reload](http://download.livereload.com/2.0.8/LiveReload-2.0.8.xpi)
- Safari - [Download from Live Reload](http://download.livereload.com/2.0.9/LiveReload-2.0.9.safariextz)
- Internet Explorer - Surely you jest.

Note that if you're using the Chrome version with `file://` URLs (as is the
default with `ngBoilerplate`) you need to tell Live Reload to allow it. Go to
`Menu -> Tools -> Extensions` and check the "Allow access to file URLs" box next
to the Live Reload plugin.

When you load your page, click the Live Reload icon in your toolbar and
everything should work magically. w00t!

If you'd prefer to not install a browser extension, then you must add the
following to the end of the `body` tag in `index.html`:

```html
<script src="http://localhost:35729/livereload.js"></script>
```

