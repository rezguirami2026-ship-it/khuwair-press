/* Template registry: DRAW[type][layout] → fn(ctx, doc, record, theme).
 * The four identities (luxe, modern, heritage, joy) run on the layout engine; the v1 layouts are kept unchanged. */
import certLuxe from './cert/luxe.js';
import certModern from './cert/modern.js';
import certHeritage from './cert/heritage.js';
import certJoy from './cert/joy.js';
import certClassic from './cert/classic.js';
import certBand from './cert/band.js';
import noticeLuxe from './notice/luxe.js';
import noticeModern from './notice/modern.js';
import noticeHeritage from './notice/heritage.js';
import noticeJoy from './notice/joy.js';
import noticeFormal from './notice/formal.js';
import noticeCard from './notice/card.js';
import posterLuxe from './poster/luxe.js';
import posterModern from './poster/modern.js';
import posterHeritage from './poster/heritage.js';
import posterJoy from './poster/joy.js';
import posterGuide from './poster/guide.js';
import posterHonor from './poster/honor.js';
import inviteLuxe from './invite/luxe.js';
import inviteModern from './invite/modern.js';
import inviteHeritage from './invite/heritage.js';
import inviteJoy from './invite/joy.js';
import inviteOrnate from './invite/ornate.js';
import inviteBand from './invite/band.js';

export const DRAW = {
  cert:{luxe:certLuxe, modern:certModern, heritage:certHeritage, joy:certJoy, classic:certClassic, band:certBand},
  notice:{luxe:noticeLuxe, modern:noticeModern, heritage:noticeHeritage, joy:noticeJoy, formal:noticeFormal, card:noticeCard},
  poster:{luxe:posterLuxe, modern:posterModern, heritage:posterHeritage, joy:posterJoy,
    v1:(ctx, d, rec, th) => (d.kind === 'honor' ? posterHonor : posterGuide)(ctx, d, rec, th)},
  invite:{luxe:inviteLuxe, modern:inviteModern, heritage:inviteHeritage, joy:inviteJoy, ornate:inviteOrnate, band:inviteBand}
};
