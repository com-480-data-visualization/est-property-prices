
export function initializeSlider(dispatch) {
  document.addEventListener("DOMContentLoaded", function () {
    const rangeSliderInput = document.querySelector(".range-slider__range");
    const rangeValue = document.querySelector(".range-slider__value");
    const playButton = document.getElementById("slider-play-button");
    const playIcon = document.getElementById("play-icon");

    const savedYear = sessionStorage.getItem("year") || rangeSliderInput.min;
    rangeSliderInput.value = savedYear;
    rangeValue.textContent = savedYear;

    let intervalId;
    let isPlaying = false;

    function updateYear(year) {
      rangeValue.textContent = year;
      sessionStorage.setItem("year", year);
      if (dispatch) {
        dispatch.call("start", null, year);
      }
    }

    function checkMaxValue() {
      return parseInt(rangeSliderInput.value) === parseInt(rangeSliderInput.max);
    }

    function updateButtonIcon(iconClass) {
      playIcon.className = `fas ${iconClass}`;
    }

    function play() {
      // Reset to min if at max
      if (checkMaxValue()) {
        rangeSliderInput.value = rangeSliderInput.min;
        updateYear(rangeSliderInput.min);
      }

      isPlaying = true;
      updateButtonIcon("fa-pause");

      intervalId = setInterval(() => {
        const currentValue = parseInt(rangeSliderInput.value);
        const maxValue = parseInt(rangeSliderInput.max);

        if (currentValue < maxValue) {
          rangeSliderInput.value = currentValue + 1;
          updateYear(rangeSliderInput.value);
        } else {
          pause(true);
        }
      }, 500);
    }

    function pause(setToReplay = false) {
      isPlaying = false;
      clearInterval(intervalId);

      if (setToReplay && checkMaxValue()) {
        updateButtonIcon("fa-redo");
      } else {
        updateButtonIcon("fa-play");
      }
    }

    playButton.addEventListener("click", () => {
      if (isPlaying) {
        pause();
      } else if (checkMaxValue()) {
        play();
      } else {
        play();
      }
    });

    rangeSliderInput.addEventListener("input", (e) => {
      updateYear(e.target.value);

      if (checkMaxValue()) {
        updateButtonIcon("fa-redo");
        pause(true);
      } else {
        updateButtonIcon("fa-play");
        clearInterval(intervalId);
        isPlaying = false;
      }
    });

    updateYear(savedYear);
    updateButtonIcon(checkMaxValue() ? "fa-redo" : "fa-play");
  });
}
