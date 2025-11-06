/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/** theme colours picked from HSY website: https://www.hsy.fi/en/hsy/hsy-news/media-contacts/visual-guidelines/*
 */
export const HSY = {
  primary: "#00AAA3",
  primaryDark: "#008782",
  primaryLight: "#64C3CD",
  accent: "#0F766E",
  bgSoft: "#ECFEFF",
  gray900: "#0F172A",
  gray700: "#334155",
  gray500: "#64748B",
  white:  "#FFFFFF",
  black:  "#000000",
};

export const Colors = {
  light: {
    text: HSY.gray900,
    background: HSY.white,
    tint: HSY.primary,
    icon: HSY.gray700,
    tabIconDefault: HSY.gray700,
    tabIconSelected: HSY.primary,
    card: HSY.bgSoft,
    buttonBg: HSY.primary,
    buttonText: HSY.white,
    chipBg: "#E6FFFB",
    chipText: HSY.accent,
    border: "#E5E7EB",
  },
  dark: {
    text: "#E2E8F0",
    background: "#0B1220",
    tint: HSY.primaryLight,
    icon: "#94A3B8",
    tabIconDefault: "#94A3B8",
    tabIconSelected: HSY.primaryLight,
    card: "#0E1726",
    buttonBg: HSY.primaryDark,
    buttonText: HSY.white,
    chipBg: "#083344",
    chipText: HSY.primaryLight,
    border: "#1F2937",
  },
};

export const Fonts = Platform.select({
  ios:    { sans: "system-ui", serif: "ui-serif", rounded: "ui-rounded", mono: "ui-monospace" },
  default:{ sans: "normal",    serif: "serif",     rounded: "normal",     mono: "monospace" },
  web: {
    sans: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    serif:"Georgia, 'Times New Roman', serif",
    rounded:"'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Consolas, 'Courier New', monospace",
  },
});
