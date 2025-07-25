// client/js/paneles.js
export function misPaneles() {
  console.log("Function from paneles.js");

  // Código para inicializar smartPanel
  $("#js-page-content-demopanels").smartPanel({
    localStorage: true,
    onChange: function () {},
    onSave: function () {},
    opacity: 1,
    deleteSettingsKey: "#deletesettingskey-options",
    settingsKeyLabel: "Reset settings?",
    deletePositionKey: "#deletepositionkey-options",
    positionKeyLabel: "Reset position?",
    sortable: true,
    buttonOrder: "%collapse% %fullscreen% %close%",
    buttonOrderDropdown: "%refresh% %locked% %color% %custom% %reset%",
    customButton: true,
    customButtonLabel: "Custom Button",
    onCustom: function () {},
    closeButton: true,
    onClosepanel: function () {
      console.log($(this).closest(".panel").attr("id") + " onClosepanel");
    },
    fullscreenButton: true,
    onFullscreen: function () {
      console.log($(this).closest(".panel").attr("id") + " onFullscreen");
    },
    collapseButton: true,
    onCollapse: function () {
      console.log($(this).closest(".panel").attr("id") + " onCollapse");
    },
    lockedButton: true,
    lockedButtonLabel: "Lock Position",
    onLocked: function () {
      console.log($(this).closest(".panel").attr("id") + " onLocked");
    },
    refreshButton: true,
    refreshButtonLabel: "Refresh Content",
    onRefresh: function () {
      console.log($(this).closest(".panel").attr("id") + " onRefresh");
    },
    colorButton: true,
    colorButtonLabel: "Panel Style",
    onColor: function () {
      console.log($(this).closest(".panel").attr("id") + " onColor");
    },
    panelColors: [
      "bg-primary-700 bg-success-gradient",
      "bg-primary-500 bg-info-gradient",
      "bg-primary-600 bg-primary-gradient",
      "bg-info-600 bg-primray-gradient",
      "bg-info-600 bg-info-gradient",
      "bg-info-700 bg-success-gradient",
      "bg-success-900 bg-info-gradient",
      "bg-success-700 bg-primary-gradient",
      "bg-success-600 bg-success-gradient",
      "bg-danger-900 bg-info-gradient",
      "bg-fusion-400 bg-fusion-gradient",
      "bg-faded",
    ],
    resetButton: true,
    resetButtonLabel: "Reset Panel",
    onReset: function () {
      console.log($(this).closest(".panel").attr("id") + " onReset callback");
    },
  });
}
