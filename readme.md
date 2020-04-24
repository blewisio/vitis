# vitis

Static analysis across multiple repositories via plugins.

## Usage

```sh
$> npx vitis --foo-plugin --bar-plugin
```

### Options

* `--compact` - print the table in a more compact form
* `--json` - print output as JSON instead of a table
* `--repos` - folder containing repositories to analyze (default: `./repos`)
* `--plugins` - folder containing the available plugins (default: `./plugins`)

The default directory structure would look like this:
```
/your-application
├── plugins
|  ├── packageName.js
|  ├── serverlessName.js
|  └── myOtherPlugin.js
├── repos
|  ├── my-first-repo
|  ├── my-second-repo
|  ├── my-third-repo
|  ├── my-fourth-repo
|  └── my-fifth-repo
```

## Plugins

Plugins that are available in the plugins folder can be called as flags, ex. `--my-plugin`. For flag `--my-plugin`, the tool will look for a plugin named `myPlugin.js` in the `./plugins` folder (or folder specified by the `--plugins /path/to/somewhere` flag).

Plugins will be called on each repository, and will receive an object with the following properties:
* `dir` - the current directory
* `package` - the contents of `package.json`, if it exists
* `serverless` - the contents of `serverless.yml` (in JS object form), if it exists

Example:
```
module.exports = ({ dir, package, serverless }) => {
  // do something with the directory name, the package.json file,
  // or the serverless.yml contents.
};
```

The plugin should return a value to be displayed in the results table. If an error is thrown when evaluating a cell, that cell will contain `err` as the display value.

**Note:** there are no plugins included out of the box, you must create them yourself. However, there are some examples below to help you get started.

### Examples

One of the simplest plugins is `--package-name`, which returns the `name` field from `package.json`. In `./plugins/packageName.js`:

```js
module.exports = ({ package }) => package ? package.name : 'N/A';
```

And the serverless version, `--serverless-name`:

```js
module.exports = ({ serverless }) => serverless ? serverless.service : 'N/A';
```

When running both of these commands:
```sh
$> vitis --package-name --serverless-name
```

...you'll be able to quickly identify mismatches in your naming conventions and practices (perhaps they should match for searchability).

Other common yet simple plugins would be to return certain fields for all repositories for comparison, such as the version of a particular dependency (in `reactVersion.js`):

```js
module.exports = ({ package }) => {
  if (!package) return 'N/A';

  const dependencies = package.dependencies || {};
  return dependencies['react'] || 'N/A';
};
```
which would print something like `^16.12.0`.

Or return a particular serverless field, for maintenance purposes (`awsNodeVersion.js`):

```js
module.exports = ({ serverless }) => {
  if (!serverless) return 'N/A';

  const provider = serverless.provider || {};
  return provider.runtime || 'N/A';
};
```
which would print something like `nodejs12.x`.

## Security

Only run plugins you understand and trust.
