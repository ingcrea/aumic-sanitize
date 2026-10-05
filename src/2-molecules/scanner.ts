import fg from 'fast-glob';
import { execSync } from 'child_process';
import path from 'path';

export function getTargetFiles(targetDir: string, deltaOnly: boolean = false): string[] {
    const fsLib = require('fs');
    if (!fsLib.existsSync(targetDir)) return [];
    if (fsLib.statSync(targetDir).isFile()) {
        return [path.resolve(targetDir)];
    }
    targetDir = path.resolve(targetDir);

    const extensions = ['md','js','ts','jsx','tsx','json','yml','yaml','html','css','scss','astro'];
    const extGlob = `**/*.{${extensions.join(',')}}`;
    const rulesGlob = '**/*rules';

    try {
        // Si estamos en un repo Git, respetamos el .gitignore de forma estricta
        execSync('git rev-parse --is-inside-work-tree', { cwd: targetDir, stdio: 'ignore' });
        

        let tracked = [];
        let untracked = [];
        
        if (deltaOnly) {
            try {
                tracked = execSync('git diff --name-only HEAD', { cwd: targetDir, encoding: 'utf-8' }).split('\n').filter(Boolean);
            } catch(e) {
                tracked = execSync('git ls-files', { cwd: targetDir, encoding: 'utf-8' }).split('\n').filter(Boolean);
            }
        } else {
            tracked = execSync('git ls-files', { cwd: targetDir, encoding: 'utf-8' }).split('\n').filter(Boolean);
        }
        
        untracked = execSync('git ls-files --others --exclude-standard', { cwd: targetDir, encoding: 'utf-8' }).split('\n').filter(Boolean);

        
        const allFiles = [...tracked, ...untracked];
        return allFiles
            .filter(f => extensions.some(ext => f.endsWith('.' + ext)) || f.endsWith('rules') || path.basename(f).startsWith('LICENSE'))
            .map(f => path.join(targetDir, f));
            
    } catch (e) {
        // Fallback: fast-glob puro ignorando node_modules
        return fg.sync([extGlob, rulesGlob, '**/LICENSE*'], {
            cwd: targetDir,
            ignore: ['**/node_modules/**', '**/dist/**', '**.git/**'],
            absolute: true
        });
    }
}
