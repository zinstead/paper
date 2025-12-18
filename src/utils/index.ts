import * as d3 from "d3";

export function getBackground(params: {
  value: number;
  min: number;
  max: number;
  linear: boolean;
  inverted: boolean;
}) {
  const { value, min, max, linear, inverted } = params;
  const invalidValueBackground = "#808080";
  const preScale = d3.scaleLinear().domain([min, max]).range([1, 100]);
  const scale = linear ? d3.scaleLinear() : d3.scaleLog();
  const range = inverted ? [1, 0] : [0, 1];
  scale.domain([1, 100]).range(range);
  const parsedValue = scale(preScale(value));
  const color = d3.interpolateRdYlGn(parsedValue);
  return isFinite(value) ? color : invalidValueBackground;
}

export function getTextColor(backgroundColor: string): "#000" | "#fff" {
  const c = d3.rgb(backgroundColor);

  // sRGB -> Linear RGB
  const [r, g, b] = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  // Relative Luminance
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // 判定阈值（工程与文献常用）
  return luminance < 0.5 ? "#fff" : "#000";
}
