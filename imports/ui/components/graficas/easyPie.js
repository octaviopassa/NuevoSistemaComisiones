import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "easy-pie-chart/dist/jquery.easypiechart"; // Asegúrate de que la ruta es correcta

const EasyPieChart = ({
  percent,
  pieSize,
  lineWidth,
  lineCap,
  scaleLength,
  color,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    $(chartRef.current).easyPieChart({
      barColor: color,
      trackColor: "#F2F2F2",
      scaleColor: false,
      lineWidth: lineWidth,
      lineCap: lineCap,
      size: pieSize,
      animate: 2000,
      onStep: function (from, to, percent) {
        $(this.el).find(".js-percent").text(Math.round(percent));
      },
    });
  }, [percent, pieSize, lineWidth, lineCap, scaleLength, color]);

  return (
    <div
      ref={chartRef}
      className="js-easy-pie-chart color-primary-300 position-relative d-inline-flex align-items-center justify-content-center"
      data-percent={percent}
      data-piesize={pieSize}
      data-linewidth={lineWidth}
      data-linecap={lineCap}
      data-scalelength={scaleLength}
    >
      <div className="d-flex flex-column align-items-center justify-content-center position-absolute pos-left pos-right pos-top pos-bottom fw-400 fs-lg">
        <span
          className="js-percent d-block text-dark"
          style={{ marginLeft: "50px" }}
        >
          {percent}
        </span>
      </div>
      <canvas
        height={pieSize}
        width={pieSize}
        style={{ height: `${pieSize}px`, width: `${pieSize}px` }}
      ></canvas>
    </div>
  );
};

export default EasyPieChart;
