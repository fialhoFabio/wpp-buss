// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse } from 'waku/router';

// prettier-ignore
import type { getConfig as File_About_getConfig } from './pages/about';
// prettier-ignore
import type { getConfig as File_AuthCallback_getConfig } from './pages/auth/callback';
// prettier-ignore
import type { getConfig as File_Index_getConfig } from './pages/index';
// prettier-ignore
import type { getConfig as File_LinkWhatsappAccount_getConfig } from './pages/link-whatsapp-account';
// prettier-ignore
import type { getConfig as File_WhatsappNumbers_getConfig } from './pages/whatsapp-numbers';

// prettier-ignore
type Page =
| ({ path: '/about' } & GetConfigResponse<typeof File_About_getConfig>)
| ({ path: '/auth/callback' } & GetConfigResponse<typeof File_AuthCallback_getConfig>)
| ({ path: '/' } & GetConfigResponse<typeof File_Index_getConfig>)
| ({ path: '/link-whatsapp-account' } & GetConfigResponse<typeof File_LinkWhatsappAccount_getConfig>)
| ({ path: '/whatsapp-numbers' } & GetConfigResponse<typeof File_WhatsappNumbers_getConfig>);

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
  }
}
