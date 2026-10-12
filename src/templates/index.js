/* Template registry: DRAW[type][layout] → fn(ctx, doc, record, theme). */
import certClassic from './cert/classic.js';
import certBand from './cert/band.js';
import noticeFormal from './notice/formal.js';
import noticeCard from './notice/card.js';
import posterGuide from './poster/guide.js';
import posterHonor from './poster/honor.js';
import inviteOrnate from './invite/ornate.js';
import inviteBand from './invite/band.js';

export const DRAW = {
  cert:{classic:certClassic, band:certBand},
  notice:{formal:noticeFormal, card:noticeCard},
  poster:{guide:posterGuide, honor:posterHonor},
  invite:{ornate:inviteOrnate, band:inviteBand}
};
