define(['Cesium'], function (Cesium) {
    function constructor(option) {
        //object
        this.option = _processOption(option);
        this.Cesium = Cesium;
        this.viewer = new Cesium.Viewer(option.cesiumContainer, this.option);
        this.Color = Cesium.Color
        _mergeOption(this.viewer.scene, this.option)
        this.scene = this.viewer.scene;
        this.camera = this.scene.camera;
        this.canvas = this.scene.canvas;
        this.globe = this.scene.globe;
        this.tile3DLayers = this.scene.layers
        this.imageryLayers = this.viewer.imageryLayers;
        //functions
        this.addImageryLayer = addImageryLayer;
        this.addTerrainLayer = addTerrainLayer;
        this.addScene = addScene;
        this.addS3MTilesLayerByScp = addS3MTilesLayerByScp;
        this.setS3MTilesLayerStyle3D = setS3MTilesLayerStyle3D;
        this.addCanvasEventListener = addCanvasEventListener;
        this.addMapEventListener = addMapEventListener;
        this.cartesianToWGS84BLH = cartesianToWGS84BLH;

        function addImageryLayer(option) {
            let index = option.index && option.index
            let layer = this.imageryLayers.addImageryProvider(
                new Cesium.SuperMapImageryProvider(option),
                index
            );
            return layer
        }
        function addTerrainLayer(option) {
            option.isSct === undefined && (option.isSct = true);
            let terrainProvider = new Cesium.CesiumTerrainProvider(option)
            this.viewer.terrainProvider = terrainProvider;
        }
        function addScene(url) {
            return this.scene.open(url)
        }
        function addS3MTilesLayerByScp(option) {
            let { url, index } = option
            return this.scene.addS3MTilesLayerByScp(url, option, index)
        }
        function setS3MTilesLayerStyle3D(layer, option) {
            var style3D = new Cesium.Style3D();
            _mergeOption(style3D, option)
            // if (option.color) {
            //     let { red, green, blue, alpha } = option.color
            //     let color = new Cesium.Color(red, green, blue, alpha)
            //     if (!(red || green || blue || alpha)) {
            //         color = color[option.color]
            //     }
            //     style3D.fillForeColor = color;
            // }
            layer.style3D = style3D;
        }
        function addCanvasEventListener(event, callback, modifier) {
            if (Cesium.ScreenSpaceEventType[event] === undefined) {
                throw Cesium.ScreenSpaceEventType
            }
            let handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
            handler.setInputAction(callback, Cesium.ScreenSpaceEventType[event], Cesium.KeyboardEventModifier[modifier]);
            return handler;
        }
        function addMapEventListener(event, callback, modifier) {
            let handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
            handler.setInputAction(function (e) {
                let arg = new Object()
                for (key in e) {
                    let position = this.scene.pickPosition(e[key]);
                    position && (arg[key] = position);
                }
                callback(arg)
            }.bind(this), Cesium.ScreenSpaceEventType[event], Cesium.KeyboardEventModifier[modifier]);
            return handler;
        }
        function cartesianToWGS84BLH(cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            let B = Cesium.Math.toDegrees(cartographic.latitude);
            let L = Cesium.Math.toDegrees(cartographic.longitude);
            let H = cartographic.height;
            return { B, L, H }
        }
    }
    function _mergeOption(target, source, excludeKey = []) {
        for (key in source) {
            if (excludeKey.indexOf(key) < 0) {
                target[key] && (target[key] = source[key])
            }
        }
    }
    function _processOption(option) {
        if (!option.cesiumContainer) {
            throw '未设置地图容器Id----->option.cesiumContainer is undefined'
        };
        option.sceneMode && (option.sceneMode = Cesium.SceneMode[option.sceneMode])
        option.terrainShadows && (option.terrainShadows = Cesium.ShadowMode[option.terrainShadows])
        return option
    }
    return constructor
})