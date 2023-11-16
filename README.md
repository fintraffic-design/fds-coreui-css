# Core UI CSS
SCSS/CSS Framework for Fintraffic Design System's Core UI

## CSS

Core UI CSS is available as a CSS file, including a minified version.

```scss
@import '@fintraffic-design/coreui-css/dist/coreui.min';
```

## Tokens

Core UI CSS offers a set of tokens that correspond to sizing, colors, fonts,
and other style attributes used in Fintraffic Design System.
The tokens are available as CSS custom properties (variables) and JavaScript objects.
There are also TypeScript declarations for `FdsSizeToken` and `FdsColorToken`, which are subsets of `FdsToken`.

```scss
// :root {
//   --fds-size-1: 8px;
//   --fds-size-2: 16px;
//   --fds-size-3: 24px;
//   /* ... */
// }
@import '@fintraffic-design/coreui-css/dist/tokens';

// ...

.my-style {
  gap: var(--fds-size-1);
}
```

```ts
import { FdsTokenSize1 } from '@fintraffic-design/coreui-css'; // { name: "fds-size-1", value: "8px" }
```

### Using tokens in Web Components

To use the tokens in Web Components (namely with [Lit](https://lit.dev/docs/api/styles/)),
you need to parse the tokens with the `tokenVar` function.
If you need to use the token values in style sheets, using [style properties](#style-properties) is a simpler option,
since it omits the need of parsing the tokens.

```ts
  import { css, LitElement } from 'lit';
  import { customElement } from 'lit/decorators.js';
  import { FdsColorToken, FdsTokenColorNeutral200, tokenVar } from '@fintraffic-design/coreui-css';

  @customElement('my-component')
  export default class MyComponent extends LitElement {
    @property({ type: Object }) color: FdsColorToken = FdsTokenColorNeutral200

    override render(): TemplateResult {
      return html`<div style="color: ${tokenVar(this.color)}">Text</div>`
    }
  }
```

## Style templates

Style templates are a set of CSS helper classes that can be included in (Lit) stylesheets.
The naming of these CSS classes loosely follows the Fintraffic Design System hierarchy,
e.g. `Typography → Heading small → Heading 1` corresponds to the CSS class `.heading-small-1-text`.

```ts
  import { css, html, LitElement } from 'lit';
  import { customElement } from 'lit/decorators.js';
  import { headingSmall1TextClass } from '@fintraffic-design/coreui-css';

  @customElement('my-component')
  export default class MyComponent extends LitElement {
    override render(): TemplateResult {
      return html`<div class="heading-small-1-text">Text</div>`
    }

    static override styles = [
      headingSmall1TextClass,
      css`
        :host {
          /* If you need to override a custom property used by an imported class, you can declare the corresponding property here. */
          --fds-typography-heading-small-heading-1-display: flex;
        }
      `,
    ]
  }
```

## Style properties

Style properties are CSS property values derived from the tokens. These can be used directly in (Lit) stylesheets.

```ts
  import { css, LitElement } from 'lit';
  import { customElement } from 'lit/decorators.js';
  import { FdsSize1 } from '@fintraffic-design/coreui-css';

  @customElement('my-component')
  export default class MyComponent extends LitElement {
    // ...

    static override styles = [
      css`
        .my-style {
          gap: ${FdsSize1}; /* gap: var(--fds-size-1, 8px); */
        }
      `,
    ]
  }
```

# Licencing
Copyright © Fintraffic 2023
Source code of this program is licensed under the [EUPL v1.2](./LICENCE)
