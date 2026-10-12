// Names the self-contained build and offers it from the site too («تنزيل النسخة المستقلة»).
import { renameSync, copyFileSync, existsSync } from 'node:fs';
renameSync('dist/single/index.html', 'dist/single/khuwair-press.html');
if(existsSync('dist/site')) copyFileSync('dist/single/khuwair-press.html', 'dist/site/khuwair-press.html');
