export const baseColor = "#35978f";
export const darkBaseColor = "#256a64";
export const contrastColor = "#bf812d";

export const CustomInterpolate = (t) => {
    const colors  = [
        "#01665e",
        "#35978f",
        "#80cdc1",
        "#c7eae5",
        "#f5f5f5",
        "#f6e8c3",
        "#dfc27d",
        "#bf812d",
        "#8c510a",
      ];
  return d3.interpolateRgbBasis(colors)(t);
};

export const CustomGradient = (minValue, maxValue) => {
  return d3.scaleSequential(CustomInterpolate).domain([minValue, maxValue]);
};
