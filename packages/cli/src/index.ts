import { preview } from './commands/preview';
import { validate } from './commands/validate';
import { list } from './commands/list';

const args = process.argv.slice(2);
const command = args[0];
const arg = args.slice(1).join(' ');

const HELP = `
  feelback — Haptic Pattern Language developer tools

  Usage:
    feelback preview <pattern>    Visualize a haptic pattern
    feelback validate <pattern>   Validate an HPL pattern string
    feelback list [category]      List all available presets
    feelback help                 Show this help

  Pattern Language:
    ~   light vibrate (50ms, 30%)
    #   medium vibrate (50ms, 60%)
    @   heavy vibrate (50ms, 100%)
    .   pause (50ms)
    |   sharp tap (10ms, 100%)
    -   sustain (extend previous by 50ms)
    []  group
    xN  repeat N times

  Examples:
    feelback preview "~~..##..@@"
    feelback preview "[|.]x3"
    feelback validate "@--..~~"
    feelback list gaming
`;

switch (command) {
  case 'preview':
    if (!arg) {
      console.log('Usage: feelback preview <pattern>');
      console.log('Example: feelback preview "~~..##..@@"');
    } else {
      console.log(preview(arg));
    }
    break;

  case 'validate':
    if (!arg) {
      console.log('Usage: feelback validate <pattern>');
    } else {
      console.log(validate(arg));
    }
    break;

  case 'list':
    console.log(list(arg || undefined));
    break;

  case 'help':
  case '--help':
  case '-h':
  case undefined:
    console.log(HELP);
    break;

  default:
    console.log(`Unknown command: ${command}`);
    console.log('Run "feelback help" for usage information.');
    break;
}
