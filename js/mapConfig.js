define(function () {
    const mapConfig = {
        //(必须) 指定容纳viewer部件的HTML元素的文档对象模型（DOM）或ID。
        cesiumContainer: 'cesiumContainer',
        //Start in Columbus Viewer [COLUMBUS_VIEW, MORPHING, SCENE2D, SCENE3D]
        sceneMode: 'COLUMBUS_VIEW',
        //Hide the base layer picker baseLayerPicker: false,
        //确定地形是否投射或接受来自太阳的阴影。['CAST_ONLY', 'DISABLED', 'ENABLED', 'RECEIVE_ONLY']
        // terrainShadows: 'RECEIVE_ONLY'
        navigation: false,
        creditContainer: none
    }
    
    return mapConfig;
})