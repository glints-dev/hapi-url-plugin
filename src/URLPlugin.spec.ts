import 'mocha';

import { assert } from 'chai';
import * as Sinon from 'sinon';

import * as Hapi from 'hapi';

import URLPlugin from './URLPlugin';

describe('URLPlugin', () => {
  let server: Hapi.Server;
  let spy: Sinon.SinonSpy;

  before(() => {
    spy = Sinon.spy((request: any, h: Hapi.ResponseToolkit) => h.continue);
  });

  beforeEach(() => {
    server = new Hapi.Server();
    server.route({
      method: '*',
      path: '/{p*}',
      handler: spy,
    });
  });

  afterEach(() => {
    spy.resetHistory();
  });

  it('should be registered', async () => {
    await server.register({ plugin: URLPlugin });
    assert.exists((server.registrations as any)[URLPlugin.name]);
  });

  describe('Plugin Functionality', () => {
    it('should make protocol available', async () => {
      await server.register({ plugin: URLPlugin });
      await server.inject('/');

      const request = (spy.args[0][0] as Hapi.Request);
      assert.exists(request.plugins.URLPlugin);
      assert.strictEqual(request.plugins.URLPlugin!.url.protocol, 'http:');
    });

    it('should parse X-Forwarded-Proto when numProxies > 0', async () => {
      await server.register({
        plugin: URLPlugin,
        options: {
          numProxies: 1,
        },
      });
      await server.inject({
        url: '/',
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      });

      const request = (spy.args[0][0] as Hapi.Request);
      assert.strictEqual(request.plugins.URLPlugin!.url.protocol, 'https:');
    });

    it('should not parse X-Forwarded-Proto when numProxies === 0', async () => {
      await server.register({
        plugin: URLPlugin,
        options: {
          numProxies: 0,
        },
      });
      await server.inject({
        url: '/',
        headers: {
          'X-Forwarded-Proto': 'https',
        },
      });

      const request = (spy.args[0][0] as Hapi.Request);
      assert.strictEqual(request.plugins.URLPlugin!.url.protocol, 'http:');
    });

    it('should make host available', async () => {
      await server.register({ plugin: URLPlugin });
      await server.inject({
        url: '/',
        authority: 'localhost:5000',
      });

      const request = (spy.args[0][0] as Hapi.Request);
      assert.strictEqual(request.plugins.URLPlugin!.url.host, 'localhost:5000');
      assert.strictEqual(request.plugins.URLPlugin!.url.hostname, 'localhost');
    });

    it('should make pathname and search available', async () => {
      await server.register({ plugin: URLPlugin });
      await server.inject('/pathname?query=param');

      const request = (spy.args[0][0] as Hapi.Request);
      assert.strictEqual(request.plugins.URLPlugin!.url.pathname, '/pathname');
      assert.strictEqual(request.plugins.URLPlugin!.url.search, '?query=param');
    });
  });
});
