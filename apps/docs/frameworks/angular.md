# Angular

`@hapticjs/angular` provides an Angular service and directives for haptic feedback.

## Installation

::: code-group

```bash [npm]
npm install @hapticjs/core @hapticjs/angular
```

```bash [pnpm]
pnpm add @hapticjs/core @hapticjs/angular
```

:::

## HapticService

Inject the haptic service into your components:

```typescript
import { Component } from '@angular/core';
import { HapticService } from '@hapticjs/angular';

@Component({
  selector: 'app-button',
  template: `
    <button (click)="onTap()">Tap</button>
    <button (click)="onSuccess()">Submit</button>
  `,
})
export class ButtonComponent {
  constructor(private haptic: HapticService) {}

  onTap() {
    this.haptic.tap();
  }

  onSuccess() {
    this.haptic.success();
  }
}
```

## Service API

The `HapticService` exposes all `HapticEngine` methods:

```typescript
// Semantic effects
this.haptic.tap();
this.haptic.doubleTap();
this.haptic.success();
this.haptic.warning();
this.haptic.error();
this.haptic.selection();
this.haptic.toggle(true);
this.haptic.impact('heavy');

// Parametric
this.haptic.vibrate(200, 0.8);

// Patterns
this.haptic.play('~~..##..@@');
this.haptic.play(presets.gaming.explosion);

// Properties
this.haptic.isSupported;
this.haptic.adapterName;
```

## Haptic Directive

Apply haptic feedback declaratively in templates:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-form',
  template: `
    <button haptic="tap">Click</button>
    <button haptic="success">Submit</button>
    <button haptic="error">Delete</button>
    <button haptic="~~..##">Pattern</button>
  `,
})
export class FormComponent {}
```

## Module Setup

Import the haptic module in your app module:

```typescript
import { NgModule } from '@angular/core';
import { HapticModule } from '@hapticjs/angular';

@NgModule({
  imports: [HapticModule],
})
export class AppModule {}
```

## Configuration

Configure the engine via the module:

```typescript
@NgModule({
  imports: [
    HapticModule.forRoot({
      intensity: 0.8,
      fallback: {
        type: 'visual',
        visual: { style: 'flash' },
      },
    }),
  ],
})
export class AppModule {}
```

## Example: Reactive Form Validation

```typescript
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HapticService } from '@hapticjs/angular';

@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [formControl]="email" placeholder="Email" />
      <button type="submit" haptic="tap">Login</button>
    </form>
  `,
})
export class LoginComponent {
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private haptic: HapticService) {}

  onSubmit() {
    if (this.email.invalid) {
      this.haptic.error();
      return;
    }
    this.haptic.success();
  }
}
```

## Related

- [Getting Started](/guide/getting-started) -- Core setup
- [Web Components](/frameworks/web-components) -- Framework-agnostic custom elements
- [React](/frameworks/react) -- React integration
