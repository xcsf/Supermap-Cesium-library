let option = {
    //必须
    cesiumContainer: 'cesiumContainer',
    //Start in Columbus Viewer [COLUMBUS_VIEW, MORPHING, SCENE2D, SCENE3D]
    sceneMode: 'COLUMBUS_VIEW',
    //Hide the base layer picker
    baseLayerPicker: false,
}
function onload(Cesium) {
    let mapApp = new mapApp(Cesium, option)
}

class mapApp {
    constructor(Cesium, option) {
        this.option = _processOption(option)
        this.Cesium = Cesium;
        this.viewer = new Cesium.Viewer(option.cesiumContainer, this.option);
        this.scene = this.viewer.scene;
    }
    _processOption(option) {
        if (!option.cesiumContainer) {
            throw '未设置地图容器Id----->option.cesiumContainer is undefined'
        };
        return option
    }
}

// let viewer = new Cesium.Viewer('cesiumContainer'); //Viewer是用于构建应用程序的基础部件
// let { scene } = viewer
// scene.mode = Cesium.SceneMode.COLUMBUS_VIEW;
// let imageryLayers = viewer.imageryLayers; //获取将在地球上渲染的影像图层集合
// let imageryProvider = new Cesium.SuperMapImageryProvider({ //提供影像切片
//     url: "http://172.18.230.221:8090/iserver/services/map-ugcv5-szbasemap/rest/maps/szbasemap" //影像服务地址
// });
// let layer = imageryLayers.addImageryProvider(imageryProvider); //通过给定的影像服务提供者新建图层，将其添加至图层集合中。
// let promise = scene.open('http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace');
// Cesium.when(promise, function (layers) {
//     cosnole.log(layers)
// })
// viewer.flyTo(layer);
// //console.log(scene.camera.position);
// // scene.camera.setView({
// //   // destination: new Cesium.Cartesian3(101589.99370064773, 42541.86517832661, 2000.0)
// //   destination: new Cesium.Cartesian3(6377018.188097951,117550.78738300702,21270.649876164487)
// // });
// let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
// let result = {}
// handler.setInputAction(function (movement) {
//     let position = scene.pickPosition(movement.position);
//     console.log(movement.position)
//     console.log(position)
//     Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
//     let cartographic = Cesium.Cartographic.fromCartesian(position);
//     console.log('result', result)
//     console.log('cartographic', cartographic)
//     // Cesium.SceneTransforms.wgs84ToDrawingBufferCoordinates(scene, movement.position, result)
// }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
// // scene.camera.changed.addEventListener(function () {
// //   console.log(scene.camera.position)
// // })
// // console.log(scene.camera.position);