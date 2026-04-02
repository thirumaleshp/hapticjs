# @hapticjs/angular

Angular integration for [Haptic.js](https://github.com/thirumaleshp/Feelback) — the universal haptic feedback engine.

## Installation

```bash
npm install @hapticjs/angular @hapticjs/core
```

## Setup

Provide `HapticService` in your module or standalone component:

```typescript
import { HapticService } from '@hapticjs/angular';

@NgModule({
  providers: [
    { provide: HapticService, useClass: HapticService },
  ],
})
export class AppModule {}
```

Or with custom configuration using a factory:

```typescript
@NgModule({
  providers: [
    {
      provide: HapticService,
      useFactory: () => new HapticService({ intensity: 0.8 }),
    },
  ],
})
export class AppModule {}
```

## Usage

Inject the service in your components:

```typescript
import { Component } from '@angular/core';
import { HapticService } from '@hapticjs/angular';

@Component({
  selector: 'app-my-button',
  template: `<button (click)="onTap()">Tap me</button>`,
})
export class MyButtonComponent {
  constructor(private haptic: HapticService) {}

  async onTap() {
    await this.haptic.tap();
  }
}
```

### Semantic effects

```typescript
this.haptic.tap();
this.haptic.doubleTap();
this.haptic.success();
this.haptic.warning();
this.haptic.error();
this.haptic.selection();
this.haptic.toggle(true);
this.haptic.impact('heavy');
```

### HPL patterns

```typescript
this.haptic.play('~~..##..@@');
```

### Pattern composer

```typescript
const pattern = this.haptic
  .compose()
  .tap()
  .pause(100)
  .vibrate(50, 0.8);
```

### Cleanup

Call `dispose()` in your component's `ngOnDestroy`:

```typescript
export class MyComponent implements OnDestroy {
  constructor(private haptic: HapticService) {}

  ngOnDestroy() {
    this.haptic.dispose();
  }
}
```

## API

| Method | Description |
|--------|-------------|
| `tap(intensity?)` | Light tap feedback |
| `doubleTap(intensity?)` | Double tap |
| `success()` | Success notification |
| `warning()` | Warning notification |
| `error()` | Error notification |
| `selection()` | Selection change |
| `toggle(on)` | Toggle feedback |
| `impact(style?)` | Impact with style |
| `play(pattern)` | Play HPL string or pattern |
| `vibrate(duration, intensity?)` | Raw vibration |
| `compose()` | Create pattern composer |
| `configure(config)` | Update configuration |
| `isSupported` | Whether haptics are supported |
| `adapterName` | Current adapter name |
| `dispose()` | Clean up resources |
