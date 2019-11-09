import { URL } from 'url';

import * as Hapi from 'hapi';

export interface URLPluginOptions {
  numProxies: number;
}

export interface URLPluginRequestState {
  url: URL;
}

declare module 'hapi' {
  interface PluginsStates {
    URLPlugin?: URLPluginRequestState;
  }
}

/**
 * URLPlugin attempts to construct a complete URL object for an incoming
 * request. Hapi does not have the complete URL information as sent from a
 * browser, so we need to infer it from multiple sources.
 */
const URLPlugin: Hapi.Plugin<URLPluginOptions> & Hapi.PluginNameVersion = {
  name: 'URLPlugin',
  register: async (server, options) => {
    function resolveProto(request: Hapi.Request) {
      const numProxies = options.numProxies
        ? options.numProxies
        : 0;

      const xfpHeader = request.headers['x-forwarded-proto'];
      if (!numProxies || !xfpHeader) {
        return server.info.protocol;
      }

      // X-Forwarded-Proto can be spoofed, so be sure to compare with the expected
      // number of proxies.
      const downstreamProtos = xfpHeader.split(',').map(part => part.trim());
      if (downstreamProtos.length !== options.numProxies) {
        return server.info.protocol;
      }

      return downstreamProtos[0];
    }

    server.ext('onRequest', async (request, h) => {
      const proto = resolveProto(request);
      const url = new URL(`${proto}://${request.info.host}${request.path}${request.url.search}`);
      request.plugins.URLPlugin = { url };
      return h.continue;
    });
  },
};

export default URLPlugin;
