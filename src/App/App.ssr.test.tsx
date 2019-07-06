/**
 * @jest-environment node
 */

import React from 'react';
import App from './App';
import { StaticRouter, MemoryRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import { GameSharing } from './Game/GameSharing';
import { AsyncComponentProvider, createAsyncContext } from 'react-async-component';
import asyncBootstrapper from 'react-async-bootstrapper';
import { GAMES_LIST } from '../games';
import { Room } from './Lobby/Room';

(global as any).navigator = { userAgent: 'all' };

describe('App', () => {
  const context = {};
  it('should render home', async () => {
    const asyncContext = createAsyncContext();
    const app = (
      <AsyncComponentProvider asyncContext={asyncContext}>
        <StaticRouter location={'/'} context={context}>
          <App />
        </StaticRouter>
      </AsyncComponentProvider>
    );
    await asyncBootstrapper(app);
    const ssrHtml = ReactDOMServer.renderToStaticMarkup(app);
    expect(ssrHtml).toContain('We at FreeBoardGame.org');
  });

  it('should render game sharing', () => {
    const ssrHtml = ReactDOMServer.renderToStaticMarkup(
      <GameSharing
        gameCode={'chess'}
        roomID={'0'}
        roomMetadata={{ roomID: 'foo', numberOfPlayers: 1, players: [{ playerID: 0, roomID: 'foo' }] }}
      />,
    );
    expect(ssrHtml).toContain('Share');
  });

  it('should render all games', async () => {
    for (const gameDef of GAMES_LIST) {
      const code = gameDef.code;
      const asyncContext = createAsyncContext();
      const app = (
        <AsyncComponentProvider asyncContext={asyncContext}>
          <StaticRouter location={`/g/${code}/local`} context={context}>
            <App />
          </StaticRouter>
        </AsyncComponentProvider>
      );
      await asyncBootstrapper(app);
      const ssrHtml = ReactDOMServer.renderToStaticMarkup(app);
      expect(ssrHtml).toContain('svg');
    }
  });

  it('should render all games info', async () => {
    for (const gameDef of GAMES_LIST) {
      const code = gameDef.code;
      const asyncContext = createAsyncContext();
      const app = (
        <AsyncComponentProvider asyncContext={asyncContext}>
          <StaticRouter location={`/g/${code}`} context={context}>
            <App />
          </StaticRouter>
        </AsyncComponentProvider>
      );
      await asyncBootstrapper(app);
      const ssrHtml = ReactDOMServer.renderToStaticMarkup(app);
      expect(ssrHtml).toContain(gameDef.name);
    }
  });

  it('should render about', async () => {
    const asyncContext = createAsyncContext();
    const app = (
      <AsyncComponentProvider asyncContext={asyncContext}>
        <StaticRouter location={'/about'} context={context}>
          <App />
        </StaticRouter>
      </AsyncComponentProvider>
    );
    await asyncBootstrapper(app);
    const ssrHtml = ReactDOMServer.renderToStaticMarkup(app);
    expect(ssrHtml).toContain('About FreeBoardGame.org');
  });

  it('should render room loading page for SSR', async () => {
    const asyncContext = createAsyncContext();
    const app = (
      <AsyncComponentProvider asyncContext={asyncContext}>
        <MemoryRouter>
          <Room
            match={{
              params: { gameCode: 'chess', roomID: 'fooroom' },
            }}
          />
        </MemoryRouter>
      </AsyncComponentProvider>
    );
    await asyncBootstrapper(app);
    const ssrHtml = ReactDOMServer.renderToStaticMarkup(app);
    expect(ssrHtml).toContain('Loading');
  });
});
