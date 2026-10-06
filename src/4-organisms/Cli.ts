import { readFileSync } from 'fs';
const { performance } = require('perf_hooks');
import { Command } from 'commander';
import pc from 'picocolors';
import cliProgress from 'cli-progress';
import path from 'path';
import { getTargetFiles } from '../2-molecules/scanner';
import { loadConfig, initConfig } from '../2-molecules/config';
import { installGitHook, installGlobalGitHook } from '../3-cells/HookManager';
import { processFile } from '../3-cells/Sanitizer';
import type { SanitizeOptions } from '../1-atoms/types';
import readline from 'readline';
import { exec } from 'child_process';

const PKG_PATH = path.join(__dirname, '../../package.json');
const PKG_VERSION = JSON.parse(readFileSync(PKG_PATH, 'utf8')).version;

async function promptOpenLog(logPath: string) {
    if (!process.stdin.isTTY) return;
    return new Promise<void>((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(pc.yellow('¿Deseas abrir la bitácora forense en tu editor predeterminado? (s/N): '), (answer) => {
            if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'y') {
                const cmd = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
                exec(`${cmd} "${logPath}"`);
            }
            rl.close();
            resolve();
        });
    });
}




async function interactiveMenu(program: Command) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

    console.log(pc.cyan(`\n=== AUM-IC Sanitize v${PKG_VERSION} - Central Forense ===`));
    console.log(pc.gray('Creado por Ingeniería Creativa bajo el Estándar AUM-IC 7:2026\n'));
    console.log('1) ' + pc.yellow('Auditoría') + ' (Simulación Dry-Run sin editar archivos)');
    console.log('2) ' + pc.green('Sanear Proyecto') + ' (Escáner y Destrucción de Entropía)');
    console.log('3) ' + pc.red('Restauración') + ' (Rollback usando aumic-history.json)');
    console.log('4) ' + pc.blue('Instalar Git Hook Local') + ' (Protección en este repositorio)');
    console.log('5) ' + pc.blue('Instalar Git Hook Global') + ' (Protección en todo el equipo)');
    console.log('6) ' + pc.gray('Generar aumic.config.json') + ' (Configuración Inicial)');
    console.log('7) ' + pc.white('Mostrar Ayuda de Consola'));
    console.log('0) ' + pc.gray('Salir'));

    const answer = await ask(pc.cyan('\nSelecciona una operación [0-7]: '));
    const choice = answer.trim();

    if (['1', '2', '3'].includes(choice)) {
        const target = await ask(pc.gray('\nDestino (Ruta de archivo/carpeta o ENTER para todo el proyecto): '));
        rl.close();
        const args = ['node', 'aumic-sanitize'];
        if (choice === '1') args.push('audit');
        if (choice === '2') args.push('scan');
        if (choice === '3') args.push('restore');
        if (target.trim() !== '') args.push(target.trim());
        await program.parseAsync(args);
    } else {
        rl.close();
        switch (choice) {
            case '4': await program.parseAsync(['node', 'aumic-sanitize', 'hook']); break;
            case '5': await program.parseAsync(['node', 'aumic-sanitize', 'hook', '--global']); break;
            case '6': await program.parseAsync(['node', 'aumic-sanitize', 'init']); break;
            case '7': program.outputHelp(); break;
            case '0': process.exit(0);
            default: console.log(pc.red('Opción inválida.')); process.exit(1);
        }
    }
}

export async function runCLI() {
    const program = new Command();
    program.name('aumic-sanitize').description('Motor Forense Anti-Mojibake y Erradicador de Entropía').version(PKG_VERSION);

    program.command('init')
        .description('Crea el archivo aumic.config.json en el directorio actual')
        .action(() => {
            initConfig(process.cwd());
            console.log(pc.green('âœ" aumic.config.json generado exitosamente.'));
        });

    program.command('hook')
        .description('Instala el interceptor Auto-Curativo en Git')
        .option('--global', 'Instala el hook globalmente para todos los repositorios del equipo')
        .action((options) => {
            if (options.global) {
                installGlobalGitHook();
            } else {
                installGitHook(process.cwd());
            }
        });

    
    program.command('restore [target]')
        .description('Restaura los archivos a su estado original usando el log forense aumic-history.json')
        .action(async (target) => {
            const targetPath = target ? path.resolve(process.cwd(), target) : null;
            const historyPath = path.join(process.cwd(), 'aumic-history.json');
            try {
                const fsPromises = require('fs/promises');
                const data = await fsPromises.readFile(historyPath, 'utf8');
                const parsed = JSON.parse(data);
                const history = Array.isArray(parsed) ? parsed : (parsed.history || []);
                for (const entry of history) {
                    if (targetPath && !entry.filepath.startsWith(targetPath)) continue;
                    await fsPromises.writeFile(entry.filepath, entry.originalContent, 'utf8');
                    console.log(pc.green('[Restaurado] ' + path.relative(process.cwd(), entry.filepath)));
                }
                console.log(pc.cyan('\nRestauración completada con éxito.'));
                await promptOpenLog(historyPath);
            } catch (e) {
                console.log(pc.red('Error: No se encontró el archivo forense aumic-history.json o está roto.'));
            }
        });

    program.command('audit [target]')
        .description('Simula el escáner (Dry-Run) sin modificar archivos')
        .action(async (target) => {
            const args = ['node', 'aumic-sanitize', 'scan'];
            if (target) args.push(target);
            args.push('--audit');
            await program.parseAsync(args);
        });

    program.command('scan [target]')
        .description('Ejecuta el escáner en la carpeta actual')
        .option('--audit', 'Modo lectura: escanea y retorna exit 1 si hay infección')
        .option('--git-stage', 'Ejecuta git add automáticamente en los archivos reparados')
        .option('--delta', 'Escaneo diferencial vía Git')
        .option('--eradicate', 'Ignora la configuración y fuerza la purga de console.logs y debuggers')
        .option('--from-hook', 'Uso interno para Git Hooks')
        .option('-c, --concurrency <number>', 'Límite de concurrencia', '50')
        .action(async (target, options) => {
            if (typeof target === 'object' && !options) { options = target; target = undefined; }
            const targetPath = target ? path.resolve(process.cwd(), target) : process.cwd();
            const targetDir = require('fs').statSync(targetPath).isFile() ? path.dirname(targetPath) : targetPath;
            const config = loadConfig(targetDir);

            let isAudit = !!options.audit;
            let isGitStage = !!options.gitStage;

            // Lógica de Self-Healing (Intercepción del Hook)
            if (options.fromHook) {
                if (config.gitMode === 'off') {
                    console.log(pc.gray('AUM-IC Hook desactivado por configuración.'));
                    process.exit(0);
                }
                if (config.gitMode === 'auto') {
                    isAudit = false;
                    isGitStage = true;
                    console.log(pc.blue('ðŸ›¡ï¸  AUM-IC Self-Healing Activado. Curando antes del commit...'));
                } else if (config.gitMode === 'block') {
                    isAudit = true;
                    isGitStage = false;
                    console.log(pc.magenta('ðŸ›¡ï¸  AUM-IC Sentinel Activado. Auditando antes del commit...'));
                }
            } else {
                console.log(`\n${pc.yellow('Iniciando Escáner Forense AUM-IC en:')} ${pc.white(targetPath)}`);
            }

            // Forzar el erradicador por bandera si es necesario
            if (options.eradicate) config.rules.eradicator = true;

            const sanitizeOpts: SanitizeOptions = {
                audit: isAudit, gitStage: isGitStage, concurrency: parseInt(options.concurrency, 10), config
            };

            const files = getTargetFiles(targetPath, !!options.delta);
            if (files.length === 0) return;
            const startTime = performance.now();

            let totalFixed = 0, totalCorruptions = 0;
            const globalHistory: any[] = [];
            const progressBar = new cliProgress.SingleBar({
                format: `${pc.cyan('Escaneando')} |${pc.blue('{bar}')}| {percentage}% || {value}/{total} Archivos || ⏱️ {duration_formatted}`,
                barCompleteChar: '\u2588', barIncompleteChar: '\u2591', hideCursor: true
            });
            if (!options.fromHook) progressBar.start(files.length, 0);

            const chunkSize = sanitizeOpts.concurrency;
            const reportLogs: string[] = [];

            const Piscina = require('piscina');
            const pool = new Piscina({ filename: path.join(__dirname, '../3-cells/worker.js'), maxThreads: sanitizeOpts.concurrency });
            
            const promises = files.map(f => pool.run({ filepath: f, options: sanitizeOpts }).then((res: any) => {
                if (!options.fromHook) progressBar.increment();
                if (res.modified) {
                    globalHistory.push(res);
                    totalFixed++; totalCorruptions += res.corruptions;
                    const status = sanitizeOpts.audit ? pc.red('Infectado') : pc.green('Reparado');
                    const relPath = path.relative(process.cwd(), res.filepath);
                    let log = `[${status}] ${relPath} ${pc.gray(`(${res.corruptions} curaciones)`)}`;
                    if (sanitizeOpts.gitStage && !sanitizeOpts.audit) log += `\n    ${pc.cyan('> Auto-staged (git add)')}`;
                    reportLogs.push(log);
                }
            }));
            
            await Promise.all(promises);
            await pool.destroy();
            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);


            if (!options.fromHook) { progressBar.stop(); console.log(''); }

            if (reportLogs.length > 0) {
                if (options.fromHook) console.log(`\n${pc.red('[!] ATENCIÓN: Se detectaron y/o purgaron anomalías:')}`);
                console.log(reportLogs.join('\n'));
            }

            

            if (!options.fromHook) {
                console.log(`\n${pc.cyan('========================================')}`);
                console.log(pc.cyan(sanitizeOpts.audit ? '         AUDITORÍA COMPLETADA         ' : '        SANEAMIENTO COMPLETADO        '));
                console.log(pc.cyan('========================================'));
                if (sanitizeOpts.audit) {
                    console.log(`${pc.yellow('Archivos infectados:')}  ${pc.white(totalFixed)}`);
                    console.log(`${pc.yellow('Entropía detectada:')}   ${pc.white(totalCorruptions)} items`);
                } else {
                    console.log(`${pc.yellow('Archivos curados:')}     ${pc.white(totalFixed)}`);
                    console.log(`${pc.yellow('Entropía destruida:')}    ${pc.white(totalCorruptions)} items`);
                }
                console.log(`${pc.yellow('Tiempo de ejecución:')}  ${pc.white(timeTaken + 's')}`);
                console.log(`${pc.cyan('========================================')}`);
                console.log(pc.gray('Creado por Ingeniería Creativa bajo el Estándar AUM-IC 7:2026\n'));
            }
        
            if (globalHistory.length > 0 || options.audit) {
                const historyPath = require('path').join(targetDir, 'aumic-history.json');
                const historyData = globalHistory.map(r => ({
                    filepath: r.filepath,
                    corruptions: r.corruptions,
                    originalContent: r.originalContent
                }));
                const reportObject = {
                    metadata: {
                        timestamp: new Date().toISOString(),
                        operacion: sanitizeOpts.audit ? 'AUDITORIA (DRY-RUN)' : 'SANEAMIENTO (DESTRUCTIVO)',
                        destino: targetPath,
                        archivosEscaneados: files.length,
                        archivosAfectados: totalFixed,
                        entropiaDestruida: totalCorruptions,
                        tiempoEjecucionSegundos: parseFloat(timeTaken)
                    },
                    history: historyData
                };
                require('fs').writeFileSync(historyPath, JSON.stringify(reportObject, null, 2), 'utf8');
                
                // AUM-IC Auto-Gitignore Firewall
                const gitignorePath = require('path').join(targetDir, '.gitignore');
                if (require('fs').existsSync(gitignorePath)) {
                    const currentIgnore = require('fs').readFileSync(gitignorePath, 'utf8');
                    if (!currentIgnore.includes('aumic-history.json')) {
                        require('fs').appendFileSync(gitignorePath, '\n# AUM-IC Forensic Log\naumic-history.json\n', 'utf8');
                    }
                } else {
                    require('fs').writeFileSync(gitignorePath, '# AUM-IC Forensic Log\naumic-history.json\n', 'utf8');
                }
                if (!options.fromHook) console.log(pc.gray('\nInteligencia Forense guardada en: aumic-history.json'));
                if (!options.fromHook) await promptOpenLog(historyPath);
            }

            if (options.fromHook && sanitizeOpts.audit && totalFixed > 0) {
                console.log(`\n${pc.red('AUM-IC SECURITY: COMMIT BLOQUEADO.')}`);
                console.log(`${pc.yellow('Archivos Infectados:')}  ${pc.white(String(totalFixed))}`);
                console.log(`${pc.yellow('Entropía detectada:')}   ${pc.white(String(totalCorruptions))} items`);
                console.log(`${pc.yellow('Tiempo de ejecución:')}  ${pc.white(timeTaken + 's')}`);
                console.log(pc.gray('Creado por Ingeniería Creativa bajo el Estándar AUM-IC 7:2026'));
                console.log(`${pc.yellow('Solución:')} Revisa los archivos y vuelve a intentar el commit.\n`);
                process.exit(1);
            }
        });

    
    if (process.argv.length <= 2 && process.stdin.isTTY) {
        await interactiveMenu(program);
    } else {
        program.parse(process.argv);
    }
}

