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
        this.tile3DLayerArray = this.tile3DLayers._layers._array
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
        this.createMeasureHandler = createMeasureHandler;
        this.createDrawHandler = createDrawHandler;
        this.createPolygonClipHandler = createPolygonClipHandler;

        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/SuperMapImageryProvider.html?classFilter=SuperMapImageryProvider
         * @param {object} option 
         * @return {ImageryLayer}
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ImageryLayer.html
         */
        function addImageryLayer(option) {
            let index = option.index && option.index
            let layer = this.imageryLayers.addImageryProvider(
                new Cesium.SuperMapImageryProvider(option),
                index
            );
            return layer
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/CesiumTerrainProvider.html
         * @param {object} option 
         */
        function addTerrainLayer(option) {
            option.isSct === undefined && (option.isSct = true);
            this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider(option);
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/Scene.html
         * @param {object} url 
         */
        function addScene(url) {
            return this.scene.open(url)
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/Scene.html
         * @param {object} option 
         * url String iserver中发布的配置文件地址。
         * eg: http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace/datas/fengguan@dianxin/config
         * name String (必须) 图层名
         */
        function addS3MTilesLayerByScp(option) {
            let { url, index } = option
            console.log(url)
            return this.scene.addS3MTilesLayerByScp(url, option, index)
        }
        /**
         * http://support.supermap.com.cn:8090/webgl/Build/Documentation/S3MTilesLayer.html
         * http://support.supermap.com.cn:8090/webgl/Build/Documentation/Style3D.html
         * @param {S3MTilesLayer} layer 
         * @param {object} option 
         */
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
        /**
         * @param {string} event 
         * 'LEFT_DOUBLE_CLICK' 'LEFT_CLICK' 'LEFT_DOWN' 'LEFT_UP' 'MIDDLE_CLICK' 'MIDDLE_DOWN'
         * 'MIDDLE_UP' 'MOUSE_MOVE' 'PINCH_END' 'PINCH_MOVE' 'PINCH_START' 'RIGHT_CLICK' 'RIGHT_DOWN'
         * 'RIGHT_UP' 'WHEEL'
         * @param {function} callback 
         * @param {string} modifier 'ALT''CTRL''SHIFT'
         */
        function addCanvasEventListener(event, callback, modifier) {
            if (Cesium.ScreenSpaceEventType[event] === undefined) {
                throw Cesium.ScreenSpaceEventType
            }
            let handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
            handler.setInputAction(callback, Cesium.ScreenSpaceEventType[event], Cesium.KeyboardEventModifier[modifier]);
            return handler;
        }
        /**
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
        /**
         * 
         * @param {object} cartesian 
         * @returns {object} {B,L,H}
         */
        function cartesianToWGS84BLH(cartesian) {
            let B, L, H
            if (cartesian) {
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
                B = Cesium.Math.toDegrees(cartographic.latitude);
                L = Cesium.Math.toDegrees(cartographic.longitude);
                H = cartographic.height;
                return { B, L, H }
            }
            return { B, L, H }
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/MeasureHandler.html
         * @param {string} mode 'Area''Distance''DVH'
         * @param {function} callback(result) -> object measure result
         * @param {function} activecallback(e) -> bool isActive
         * @param {string} clampMode See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ClampMode.html
         * @returns {MeasureHandler} handler 
         */
        function createMeasureHandler(mode, callback = _noop, activecallback = _noop, clampMode = 'S3mModel') {
            if (Cesium.MeasureMode[mode] === undefined) {
                throw Cesium.MeasureMode
            }
            let handler = new Cesium.MeasureHandler(this.viewer, Cesium.MeasureMode[mode], clampMode);
            handler.measureEvt.addEventListener(function (result) {
                switch (mode) {
                    case 'Area':
                        _processAreaMeasure(result, handler)
                        callback(result)
                        break
                    case 'Distance':
                        _processDistanceMeasure(result, handler)
                        callback(result)
                        break
                    case 'DVH':
                        _processDVHMeasure(result, handler)
                        callback(result)
                        break
                    default:
                }
            });
            handler.activeEvt.addEventListener(activecallback);
            return handler
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/DrawHandler.html
         * @param {string} mode 'Line''Marker''Point''Polygon'
         * @param {function} callback(e) -> bool isActive
         * @param {string} clampMode See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ClampMode.html
         * @returns handler 
         */
        function createDrawHandler(mode, callback = _noop, activecallback = _noop, clampMode = 'S3mModel') {
            if (Cesium.DrawMode[mode] === undefined) {
                throw Cesium.DrawMode
            }
            let handler = new Cesium.DrawHandler(this.viewer, Cesium.DrawMode[mode], Cesium.ClampMode[clampMode]);
            handler.drawEvt.addEventListener(function (result) {
                switch (mode) {
                    case 'Point':
                        _processPointDraw(result, handler)
                        callback(result)
                        break
                    case 'Line':
                        _processLineDraw(result, handler)
                        callback(result)
                        break
                    case 'Polygon':
                        _processPolygonDraw(result, handler)
                        callback(result)
                        break
                    case 'Marker':
                        _processMarkerDraw(result, handler)
                        callback(result)
                        break
                    default:
                }
            });
            handler.activeEvt.addEventListener(activecallback);
            return handler
        }
        function createPolygonClipHandler(layers, clipMode = 'CLIP_INSIDE') {
            let polygonArray = []
            let regions = [];
            let polygonClipHandler = this.createDrawHandler('Polygon', function (result) {
                let { positions } = result.object
                positions.map((item) => {
                    let { B, L, H } = cartesianToWGS84BLH(item)
                    polygonArray.push(L, B, H)
                })
                regions.push(polygonArray)
                layers.map((layer) => {
                    layer.setModifyRegions(regions, Cesium.ModifyRegionMode[clipMode]);
                })
                polygonClipHandler.polygon.show = false;
            })
            return polygonClipHandler
        }
    }
    function _processPointDraw(result, handler) {
        return result
    }
    function _processLineDraw(result, handler) {
        return result
    }
    function _processPolygonDraw(result, handler) {
        return result
    }
    function _processMarkerDraw(result, handler) {
        return result
    }

    function _processAreaMeasure(result, handler) {
        let mj = Number(result.area);
        let area = mj > 1000000 ? (mj / 1000000).toFixed(2) + 'km²' : mj.toFixed(2) + '㎡'
        handler.areaLabel.text = '面积:' + area;
    }
    function _processDistanceMeasure(result, handler) {
        let dis = Number(result.distance);
        let distance = dis > 1000 ? (dis / 1000).toFixed(2) + 'km' : dis.toFixed(2) + 'm';
        handler.disLabel.text = '距离:' + distance;
    }
    function _processDVHMeasure(result, handler) {
        let { distance, verticalHeight, horizontalDistance } = result
        let D = distance > 1000 ? (distance / 1000).toFixed(2) + 'km' : distance + 'm';
        let V = verticalHeight > 1000 ? (verticalHeight / 1000).toFixed(2) + 'km' : verticalHeight + 'm';
        let H = horizontalDistance > 1000 ? (horizontalDistance / 1000).toFixed(2) + 'km' : horizontalDistance + 'm';
        handler.disLabel.text = '空间距离:' + D;
        handler.vLabel.text = '垂直高度:' + V;
        handler.hLabel.text = '水平距离:' + H;
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
    function _noop() { }

    return constructor
})