#!/usr/bin/env node
import { runCLI } from './4-organisms/Cli';
runCLI().catch(e => {
    console.error(e);
    process.exit(1);
});
