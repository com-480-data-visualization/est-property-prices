
export const baseColor = "#0B6477";
export const darkBaseColor = "#213A57";
export const contrastColor = "#0AD1C8";

const defaultColors = [
  "#213A57",
  "#0B6477",
  "#14919B",
  "#0AD1C8",
  "#45DFB1",
  "#80ED99"
];

export const CustomInterpolate = (colors = defaultColors) => {
  return d3.interpolateRgbBasis(colors);
};

export const CustomGradient = (minValue, maxValue, colors) => {
  const colorScheme = colors || defaultColors;

  const interpolate = CustomInterpolate(colorScheme);
  return d3.scaleSequential(interpolate).domain([minValue, maxValue]);
};
