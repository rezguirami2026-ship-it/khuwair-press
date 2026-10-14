/* Template registry: DRAW[type][layout] → fn(ctx, doc, record, theme).
 * The four identities (luxe, modern, heritage, joy) run on the layout engine; the v1 layouts are kept unchanged. */
import certLuxe from './cert/luxe.js';
import certRoyal from './cert/royal.js';
import certModern from './cert/modern.js';
import certHeritage from './cert/heritage.js';
import certJoy from './cert/joy.js';
import certClassic from './cert/classic.js';
import certBand from './cert/band.js';
import noticeLuxe from './notice/luxe.js';
import noticeRoyal from './notice/royal.js';
import noticeModern from './notice/modern.js';
import noticeHeritage from './notice/heritage.js';
import noticeJoy from './notice/joy.js';
import noticeFormal from './notice/formal.js';
import noticeCard from './notice/card.js';
import posterLuxe from './poster/luxe.js';
import posterRoyal from './poster/royal.js';
import posterModern from './poster/modern.js';
import posterHeritage from './poster/heritage.js';
import posterJoy from './poster/joy.js';
import posterGuide from './poster/guide.js';
import posterHonor from './poster/honor.js';
import inviteLuxe from './invite/luxe.js';
import inviteRoyal from './invite/royal.js';
import inviteModern from './invite/modern.js';
import inviteHeritage from './invite/heritage.js';
import inviteJoy from './invite/joy.js';
import inviteOrnate from './invite/ornate.js';
import inviteBand from './invite/band.js';

import certOfficial from './cert/official.js';
import certExecutive from './cert/executive.js';
import certFiligree from './cert/filigree.js';
import noticeOfficial from './notice/official.js';
import noticeExecutive from './notice/executive.js';
import noticeFiligree from './notice/filigree.js';
import posterOfficial from './poster/official.js';
import posterExecutive from './poster/executive.js';
import posterFiligree from './poster/filigree.js';
import inviteOfficial from './invite/official.js';
import inviteExecutive from './invite/executive.js';
import inviteFiligree from './invite/filigree.js';

export const DRAW = {
  cert:{luxe:certLuxe, royal:certRoyal, filigree:certFiligree, executive:certExecutive, official:certOfficial, modern:certModern, heritage:certHeritage, joy:certJoy, classic:certClassic, band:certBand},
  notice:{luxe:noticeLuxe, royal:noticeRoyal, filigree:noticeFiligree, executive:noticeExecutive, official:noticeOfficial, modern:noticeModern, heritage:noticeHeritage, joy:noticeJoy, formal:noticeFormal, card:noticeCard},
  poster:{luxe:posterLuxe, royal:posterRoyal, filigree:posterFiligree, executive:posterExecutive, official:posterOfficial, modern:posterModern, heritage:posterHeritage, joy:posterJoy,
    v1:(ctx, d, rec, th) => (d.kind === 'honor' ? posterHonor : posterGuide)(ctx, d, rec, th)},
  invite:{luxe:inviteLuxe, royal:inviteRoyal, filigree:inviteFiligree, executive:inviteExecutive, official:inviteOfficial, modern:inviteModern, heritage:inviteHeritage, joy:inviteJoy, ornate:inviteOrnate, band:inviteBand}
};
