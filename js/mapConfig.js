define(['Cesium'], function (Cesium) {
    const mapConfig = {
        viewerConfig: {
            //(必须) 指定容纳viewer部件的HTML元素的文档对象模型（DOM）或ID。
            cesiumContainer: 'cesiumContainer',
            // creditContainer: none,
            navigation: true,
            skyAtmosphere: false,
            infoBox: false,
            // trackedEntity: undefined
            // selectionIndicator: false
        },
        sceneConfig: {
            // fxaa: true,
            //Start in Columbus Viewer [COLUMBUS_VIEW, MORPHING, SCENE2D, SCENE3D]
            mode: Cesium.SceneMode.SCENE3D
        },
        globeConfig: {
            baseColor: Cesium.Color.GHOSTWHITE,
        },
        screenSpaceCameraControllerConfig: {
            // enableLook: false,//只能translating(2d) or rotating
            inertiaSpin: 1,
            // enableTilt: true,//locked heading and pitch
            // enableRotate: false,//左键旋转地球
            // enableZoom: false,//滚轮zoom
            // enableTranslate: false,//only 2D and Columbus view modes.
        },
        hawkeyeMapConfig: {
            viewerConfig: {
                cesiumContainer: 'hawkeyeMap',
                // creditContainer: none,
                navigation: false,
                infoBox: false,
            },
            sceneConfig: {
                mode: Cesium.SceneMode.SCENE2D
            },
            globeConfig: {
                baseColor: Cesium.Color.GHOSTWHITE,
            },
            screenSpaceCameraControllerConfig: {
                enableRotate: false,
                enableTranslate: false,
                enableZoom: false,
                enableTilt: false,
                enableLook: false,
            }
        }

    }
    return mapConfig;
})