
import { processFile } from './Sanitizer';
module.exports = async function(args: any) {
    return processFile(args.filepath, args.options);
}
