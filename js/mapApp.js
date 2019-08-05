define(['Cesium'], function (Cesium) {
    function constructor(option) {
        //Constructor
        this.Color = Cesium.Color
        //Object
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
        _executeOption(option)
        //functions
        this.addImageryLayer = addImageryLayer;
        this.addTerrainLayer = addTerrainLayer;
        this.addScene = addScene;
        this.addS3MTilesLayerByScp = addS3MTilesLayerByScp;
        this.setS3MTilesLayerStyle3D = setS3MTilesLayerStyle3D;
        this.addCanvasEventListener = addCanvasEventListener;
        this.addMapEventListener = addMapEventListener;
        this.cartesianToWGS84BLH = cartesianToWGS84BLH;
        this.measureHandler = measureHandler;

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
            this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider(option);
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
        /**
         * 
         * @param {string} event 
         * 'LEFT_DOUBLE_CLICK' 'LEFT_CLICK' 'LEFT_DOWN' 'LEFT_UP' 'MIDDLE_CLICK' 'MIDDLE_DOWN'
         * 'MIDDLE_UP' 'MOUSE_MOVE' 'PINCH_END' 'PINCH_MOVE' 'PINCH_START' 'RIGHT_CLICK' 'RIGHT_DOWN'
         * 'RIGHT_UP' 'WHEEL'
         * @param {function} callback 
         * @param {string} modifier 'ALT''CTRL''SHIFT'
         */
        function addMapEventListener(event, callback, modifier) {
            return addCanvasEventListener(event, function (e) {
                let arg = new Object()
                for (key in e) {
                    let position = this.scene.pickPosition(e[key]);
                    position && (arg[key] = position);
                }
                callback(arg)
            }.bind(this), modifier)
        }
        function cartesianToWGS84BLH(cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            let B = Cesium.Math.toDegrees(cartographic.latitude);
            let L = Cesium.Math.toDegrees(cartographic.longitude);
            let H = cartographic.height;
            return { B, L, H }
        }
        /**
         * 
         * @param {string} mode 'Area''Distance''DVH'
         */
        function measureHandler(mode, callback) {
            if (Cesium.MeasureMode[mode] === undefined) {
                throw Cesium.MeasureMode
            }
            let handler = new Cesium.MeasureHandler(this.viewer, Cesium.MeasureMode[mode], 1);
            handler.measureEvt.addEventListener(function (result) {
                switch (mode) {
                    case 'Area':
                        processAreaMeasure(result, handler)
                        break
                    case 'Distance':
                        processDistanceMeasure(result, handler)
                        break
                    case 'DVH':
                        processDVHMeasure(result, handler)
                        break
                    default:
                }
            });
            handler.activeEvt.addEventListener(callback);
            return handler
        }
        function processAreaMeasure(result, handler) {
            let mj = Number(result.area);
            let area = mj > 1000000 ? (mj / 1000000).toFixed(2) + 'km²' : mj.toFixed(2) + '㎡'
            handler.areaLabel.text = '面积:' + area;
        }
        function processDistanceMeasure(result, handler) {
            let dis = Number(result.distance);
            let distance = dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm';
            handler.disLabel.text = '距离:' + distance;
        }
        function processDVHMeasure(result, handler) {
            let { distance, verticalHeight, horizontalDistance } = result
            let D = distance > 1000 ? (distance / 1000).toFixed(2) + 'km' : distance + 'm';
            let V = verticalHeight > 1000 ? (verticalHeight / 1000).toFixed(2) + 'km' : verticalHeight + 'm';
            let H = horizontalDistance > 1000 ? (horizontalDistance / 1000).toFixed(2) + 'km' : horizontalDistance + 'm';
            handler.disLabel.text = '空间距离:' + D;
            handler.vLabel.text = '垂直高度:' + V;
            handler.hLabel.text = '水平距离:' + H;
        }

    }
    /**
     * 将source中与target中有相同key的部分，合并到target中
     * @param {object} target 
     * @param {object} source 
     * @param {Array} excludeKey 需要排除的key
     */
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
    function _executeOption(option) {
        if (option.defaultMap !== undefined && option.defaultMap) {
            !option.defaultMap && this.imageryLayers.removeAll()
        }

    }
    return constructor
})