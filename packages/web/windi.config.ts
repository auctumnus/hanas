import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'
import typography from 'windicss/plugin/typography'
// @ts-ignore
import scrollbars from '@windicss/plugin-scrollbar'
import plugin from 'windicss/plugin'

const hex = (d: string) => parseInt(d, 16)

const color = (c: string, alpha: number) => [
  hex(c.slice(1, 3)),
  hex(c.slice(3, 5)),
  hex(c.slice(5, 7)),
  alpha,
]

const component = (n: number) => Math.round(n).toString(16).padStart(2, '0')

const mix = (color1: string, color2: string, weight: number) => {
  const colorRGBA1 = color(color1, 255)
  const colorRGBA2 = color(color2, (weight / 100) * 255)

  const red =
    (colorRGBA1[0] * (255 - colorRGBA2[3]) + colorRGBA2[0] * colorRGBA2[3]) /
    255
  const green =
    (colorRGBA1[1] * (255 - colorRGBA2[3]) + colorRGBA2[1] * colorRGBA2[3]) /
    255
  const blue =
    (colorRGBA1[2] * (255 - colorRGBA2[3]) + colorRGBA2[2] * colorRGBA2[3]) /
    255

  return '#' + [red, green, blue].map(component).join('')
}
/**
 * Pasted from the colors section of the CSS export from https://material-foundation.github.io/material-theme-builder/#/custom
 */
const fromThemeBuilder = `
--md-sys-color-primary-light: #00687b;
    --md-sys-color-on-primary-light: #ffffff;
    --md-sys-color-primary-container-light: #a8edff;
    --md-sys-color-on-primary-container-light: #001f26;
    --md-sys-color-secondary-light: #0a61a4;
    --md-sys-color-on-secondary-light: #ffffff;
    --md-sys-color-secondary-container-light: #d1e4ff;
    --md-sys-color-on-secondary-container-light: #001c38;
    --md-sys-color-tertiary-light: #246c2c;
    --md-sys-color-on-tertiary-light: #ffffff;
    --md-sys-color-tertiary-container-light: #a9f5a4;
    --md-sys-color-on-tertiary-container-light: #08200a;
    --md-sys-color-error-light: #B3261E;
    --md-sys-color-on-error-light: #FFFFFF;
    --md-sys-color-error-container-light: #F9DEDC;
    --md-sys-color-on-error-container-light: #410E0B;
    --md-sys-color-outline-light: #79747E;
    --md-sys-color-background-light: #fcfcff;
    --md-sys-color-on-background-light: #1a1c1e;
    --md-sys-color-surface-light: #fcfcff;
    --md-sys-color-on-surface-light: #1a1c1e;
    --md-sys-color-surface-variant-light: #E7E0EC;
    --md-sys-color-on-surface-variant-light: #49454F;
    --md-sys-color-inverse-surface-light: #2e3133;
    --md-sys-color-inverse-on-surface-light: #f0f0f3;
    --md-sys-color-primary-dark: #56d6f4;
    --md-sys-color-on-primary-dark: #003641;
    --md-sys-color-primary-container-dark: #004e5d;
    --md-sys-color-on-primary-container-dark: #a8edff;
    --md-sys-color-secondary-dark: #9fcaff;
    --md-sys-color-on-secondary-dark: #00325b;
    --md-sys-color-secondary-container-dark: #004880;
    --md-sys-color-on-secondary-container-dark: #d1e4ff;
    --md-sys-color-tertiary-dark: #8ed88b;
    --md-sys-color-on-tertiary-dark: #003909;
    --md-sys-color-tertiary-container-dark: #015316;
    --md-sys-color-on-tertiary-container-dark: #a9f5a4;
    --md-sys-color-error-dark: #F2B8B5;
    --md-sys-color-on-error-dark: #601410;
    --md-sys-color-error-container-dark: #8C1D18;
    --md-sys-color-on-error-container-dark: #F9DEDC;
    --md-sys-color-outline-dark: #938F99;
    --md-sys-color-background-dark: #1a1c1e;
    --md-sys-color-on-background-dark: #e1e2e5;
    --md-sys-color-surface-dark: #1a1c1e;
    --md-sys-color-on-surface-dark: #e1e2e5;
    --md-sys-color-surface-variant-dark: #49454F;
    --md-sys-color-on-surface-variant-dark: #CAC4D0;
    --md-sys-color-inverse-surface-dark: #e1e2e5;
    --md-sys-color-inverse-on-surface-dark: #1a1c1e;
`

const mdColors = Object.fromEntries(
  fromThemeBuilder
    .trim()
    .split('\n')
    .map((s) => s.trim().slice(15, -1).split(': '))
) as Record<string, string>

/* these interactable containers took a disgusting amount of time to make work */
const state = (percent: number) => (colorName: string) =>
  mix(mdColors[colorName], mdColors['on-' + colorName], percent)

const hover = state(8)
const focus = state(12)
const press = state(12)

const makeInteractableContainers = (variant: string) =>
  Object.fromEntries(
    [
      ['primary', 'secondary', 'tertiary', 'error'].map((containerType) => [
        `.interactable-bg-${containerType}-container-${variant}`,
        {
          //transition: 'background-color 150ms ease-in-out',
          background: mdColors[`${containerType}-container-${variant}`],
          '&:hover': {
            background: hover(`${containerType}-container-${variant}`),
          },
          '&:focus': {
            background: focus(`${containerType}-container-${variant}`),
          },
          '&:active': {
            background: press(`${containerType}-container-${variant}`),
          },
        },
      ]),
      ['primary', 'secondary', 'tertiary', 'surface', 'surface-variant'].map(
        (containerType) => [
          `.interactable-bg-${containerType}-${variant}`,
          {
            //transition: 'background-color 150ms ease-in-out',
            background: mdColors[`${containerType}-${variant}`],
            '&:hover': {
              background: hover(`${containerType}-${variant}`),
            },
            '&:focus': {
              background: focus(`${containerType}-${variant}`),
            },
            '&:active': {
              background: press(`${containerType}-${variant}`),
            },
          },
        ]
      ),
    ].flat()
  )

const makeInteractableColors = (variant: string) =>
  Object.fromEntries(
    ['primary', 'secondary', 'tertiary', 'error']
      .map((containerType) =>
        (
          [
            ['hover', hover],
            ['focus', focus],
            ['press', press],
          ] as const
        ).map(([stateName, stateFn]) => [
          `${containerType}-${stateName}-${variant}`,
          stateFn(`${containerType}-${variant}`),
        ])
      )
      .flat()
  )

// Make a light/dark variant shortcut
const sc = (className: string) => ({
  [className]: `${className}-light dark:${className}-dark`,
})

const shortcuts = (classNames: string[]) =>
  classNames.reduce((acc, val) => ({ ...acc, ...sc(val) }), {})

export default defineConfig({
  darkMode: 'class',
  // https://windicss.org/posts/v30.html#attributify-mode
  attributify: true,

  plugins: [
    typography(),
    scrollbars,
    plugin(({ addUtilities }) =>
      addUtilities({
        ...makeInteractableContainers('light'),
        ...makeInteractableContainers('dark'),
      })
    ),
  ],
  shortcuts: {
    ...shortcuts([
      'border-outline',
      'border-primary-container',
      'border-on-surface',
      'border-on-surface-variant',

      'text-primary',
      'text-secondary',
      'text-error',
      'text-on-primary',
      'text-on-secondary',
      'text-on-secondary-container',
      'text-on-surface',
      'text-on-surface-variant',
      'text-on-background',

      'bg-surface',
      'bg-surface-variant',
      'bg-primary',
      'bg-primary-container',
      'bg-outline',
      'bg-error',
      'bg-on-primary',
      'bg-on-surface-variant',

      'interactable-bg-surface',
      'interactable-bg-primary',
      'interactable-bg-secondary-container',
      'text-on-secondary-container',

      'shadow-outline',
      'shadow-error',
    ]),
  },
  theme: {
    extend: {
      colors: {
        ...mdColors,
        ...makeInteractableColors('light'),
        ...makeInteractableColors('dark'),
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: 'inherit',
              opacity: 0.75,
              fontWeight: '500',
              textDecoration: 'underline',
              '&:hover': {
                opacity: 1,
                color: colors.teal[600],
              },
            },
            b: { color: 'inherit' },
            strong: { color: 'inherit' },
            em: { color: 'inherit' },
            h1: { color: 'inherit' },
            h2: { color: 'inherit' },
            h3: { color: 'inherit' },
            h4: { color: 'inherit' },
            code: { color: 'inherit' },
          },
        },
      },
    },
  },
})
