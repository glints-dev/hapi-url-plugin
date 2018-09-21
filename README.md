# url-plugin [![npm version](https://badge.fury.io/js/%40glints%2Fhapi-url-plugin.svg)](https://badge.fury.io/js/%40glints%2Fhapi-url-plugin) [![Greenkeeper badge](https://badges.greenkeeper.io/glints-dev/hapi-url-plugin.svg)](https://greenkeeper.io/)

By default, hapi does not have the complete URL information as sent from a
browser. Therefore, `request.url` doesn't provide information such as the
protocol used. This plugin attempts to check other sources such as the
`X-Forwarded-Proto` header to construct a complete URL object.

# Usage Instructions

To integrate this into your project, install the package:

```
npm install --save @glints/hapi-url-plugin  # If using npm
yarn add @glints/hapi-url-plugin            # If using Yarn
```

Then register the plugin with hapi:

```js
import { URLPlugin } from '@glints/hapi-url-plugin';

// Register the plugin with the hapi server.
await hapiServer.register({
  plugin: URLPlugin,
  options: {
    numProxies: 1, // Optional, indicates the number of downstream proxies.
  },
});

// In a request handler:
server.route({
  ...
  handler: (request, h) => {
    // request.plugins.URLPlugin.url is a URL object.
    return request.plugins.URLPlugin.url.pathname;
  },
});
```

# Contribution Guidelines

We use [EditorConfig](https://editorconfig.org) to maintain consistent line-ending and indentation rules across all our projects. Ensure that you have the appropriate plugin installed in your preferred editor, or refer to `.editorconfig`.

# About Glints

Glints is an online talent recruitment and career discovery platform headquartered in Singapore. It is a platform for young talent to build up their career readiness through internships and graduate jobs; developing skill sets required in different careers.

**P.S.** We deal with quite a number of interesting engineering problems centered on matching the right talent to employers. Sounds interesting? Send your resume to tech@glints.com.
