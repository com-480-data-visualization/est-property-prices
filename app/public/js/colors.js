export const baseColor = "#0B6477";
export const darkBaseColor = "#045a8d";
export const contrastColor = "#a6bddb";

export const defaultColors = [
  "#ece7f2",
  "#d0d1e6",
  "#a6bddb",
  "#74a9cf",
  "#3690c0",
  "#0570b0",
  "#045a8d",
];

export const CustomInterpolate = (colors = defaultColors) => {
  return d3.interpolateRgbBasis(colors);
};

export const CustomGradient = (minValue, maxValue, colors) => {
  const colorScheme = colors || defaultColors;

  const interpolate = CustomInterpolate(colorScheme);
  return d3.scaleSequential(interpolate).domain([minValue, maxValue]);
};
