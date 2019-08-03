define(['Cesium'], function (Cesium) {
    function constructor(option) {
        this.option = _processOption(option)
        this.Cesium = Cesium;
        this.viewer = new Cesium.Viewer(option.cesiumContainer, this.option);
        this.scene = this.viewer.scene;
    }
    function _processOption(option) {
        if (!option.cesiumContainer) {
            throw '未设置地图容器Id----->option.cesiumContainer is undefined'
        };
        return option
    }
    return constructor
})