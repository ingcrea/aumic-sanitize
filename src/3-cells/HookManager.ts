import fs from 'fs';
import path from 'path';
import os from 'os';
import pc from 'picocolors';
import { execSync } from 'child_process';

const HOOK_SCRIPT_LOCAL = '#!/usr/bin/env bash\n# AUM-IC Self-Healing Hook\n\naumic-sanitizer scan --from-hook --delta\nexit $?\n';

// Hook Global Inteligente (Corre AUM-IC y luego encadena con Husky/Lefthook si existen)
const HOOK_SCRIPT_GLOBAL = `#!/usr/bin/env bash
# AUM-IC Sentinel (Global)

aumic-sanitizer scan --from-hook --delta
AUM_EXIT=$?
if [ $AUM_EXIT -ne 0 ]; then
  exit $AUM_EXIT
fi

# Delegar a hook local si existe (Respetar Husky / Lefthook)
if [ -x ".git/hooks/pre-commit" ]; then
  .git/hooks/pre-commit "$@"
  exit $?
fi
`;

// ─── Hook LOCAL ─────────────────────────────────────────────────────────────
export function installGitHook(targetDir: string) {
    const gitDir = path.join(targetDir, '.git');
    if (!fs.existsSync(gitDir)) {
        console.log(pc.red('[!] No se detectó un repositorio Git (.git) en esta ruta.'));
        return;
    }
    const hooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

    const hookFilePath = path.join(hooksDir, 'pre-commit');
    fs.writeFileSync(hookFilePath, HOOK_SCRIPT_LOCAL, { encoding: 'utf8', mode: 0o755 });

    console.log(pc.green('✔ Hook pre-commit LOCAL instalado exitosamente.'));
    console.log(pc.cyan('  Ámbito: Solo este repositorio → ' + targetDir));
}

// ─── Hook GLOBAL (Verdadero: core.hooksPath) ──────────────────────────────────
export function installGlobalGitHook() {
    const globalHooksDir = path.join(os.homedir(), '.aumic-hooks');
    fs.mkdirSync(globalHooksDir, { recursive: true });

    const hookFilePath = path.join(globalHooksDir, 'pre-commit');
    fs.writeFileSync(hookFilePath, HOOK_SCRIPT_GLOBAL, { encoding: 'utf8', mode: 0o755 });

    try {
        execSync(`git config --global core.hooksPath "${globalHooksDir}"`, { encoding: 'utf8' });
        console.log(pc.green('✔ Hook pre-commit GLOBAL Absoluto instalado exitosamente.'));
        console.log(pc.cyan('  Ruta central: ' + globalHooksDir));
        console.log(pc.magenta('  ¡Atención! AUM-IC interceptará absolutamente todos los commits'));
        console.log(pc.magenta('  en esta computadora de ahora en adelante (sin necesidad de init).'));
        console.log(pc.gray('  (El diseño es seguro: no romperá repositorios que usen Husky).'));
    } catch (e) {
        console.log(pc.red('[!] Error configurando core.hooksPath global.'));
    }

    // ─── Auto-Gitignore Global ───
    try {
        let globalIgnorePath = '';
        try {
            globalIgnorePath = execSync('git config --global core.excludesfile', { encoding: 'utf8' }).trim();
        } catch (_) {} // Aún no existe la configuración

        if (!globalIgnorePath) {
            globalIgnorePath = path.join(os.homedir(), '.gitignore_global');
            execSync(`git config --global core.excludesfile "${globalIgnorePath}"`, { encoding: 'utf8' });
        } else if (globalIgnorePath.startsWith('~')) {
            globalIgnorePath = globalIgnorePath.replace(/^~/, os.homedir());
        }

        if (fs.existsSync(globalIgnorePath)) {
            const current = fs.readFileSync(globalIgnorePath, 'utf8');
            if (!current.includes('aumic-history.json')) {
                fs.appendFileSync(globalIgnorePath, '\n# AUM-IC Forensic Log\naumic-history.json\n', 'utf8');
            }
        } else {
            fs.writeFileSync(globalIgnorePath, '# AUM-IC Forensic Log\naumic-history.json\n', 'utf8');
        }
        console.log(pc.green('✔ AUM-IC adherido al .gitignore global del sistema.'));
    } catch (e) {
        console.log(pc.yellow('⚠ No se pudo configurar el .gitignore global automáticamente.'));
    }
}
