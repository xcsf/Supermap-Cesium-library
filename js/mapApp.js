define(['Cesium'], function (Cesium) {
    function constructor(option) {
        //object
        this.option = _processOption(option);
        this.Cesium = Cesium;
        this.viewer = new Cesium.Viewer(option.cesiumContainer, this.option);
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
            console.log(option)
            let terrainProvider = new Cesium.CesiumTerrainProvider(option)
            console.log('terrainProvider',terrainProvider)
            this.viewer.terrainProvider = terrainProvider;
        }
        function addScene(url) {
            return this.scene.open(url)
        }
        function addS3MTilesLayerByScp(url, option) { }

    }
    function _mergeOption(target, source) {
        for (key in source) {
            target[key] && (target[key] = source[key])
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