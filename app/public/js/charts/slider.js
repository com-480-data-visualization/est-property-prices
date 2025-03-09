export const rangeSlider = () => {
  const sliders = document.querySelectorAll(".range-slider");

  sliders.forEach((slider) => {
    const range = slider.querySelector(".range-slider__range");
    const value = slider.querySelector(".range-slider__value");

    value.textContent = range.value;

    range.addEventListener("input", () => {
      value.textContent = range.value;
    });
  });
};
