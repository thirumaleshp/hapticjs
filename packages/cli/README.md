# @hapticjs/cli

CLI tools for previewing and validating haptic patterns.

```bash
npm install -g @hapticjs/cli
```

## Commands

### Preview

Visualize a haptic pattern as an ASCII timeline:

```bash
hapticjs preview "~~..##..@@"
# ▃▃░░▅▅░░████
```

### Validate

Check if a pattern is valid:

```bash
hapticjs validate "[~.]x3"
# Valid pattern — 6 steps, 300ms total
```

### List

List all built-in presets:

```bash
hapticjs list
hapticjs list gaming
hapticjs list notifications
```

## License

MIT
