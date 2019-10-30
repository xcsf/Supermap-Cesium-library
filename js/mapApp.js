define(['Cesium'], function (Cesium) {
    function constructor(option) {
        //Constructor
        //Object
        // this.option = _processOption(option);
        this.option = option;
        this.Cesium = Cesium;
        this.viewer = new Cesium.Viewer(option.viewerConfig.cesiumContainer, this.option.viewerConfig);
        _mergeOption(this.viewer.scene, this.option.sceneConfig)
        _mergeOption(this.viewer.scene.globe, this.option.globeConfig)
        _mergeOption(this.viewer.scene.screenSpaceCameraController, this.option.screenSpaceCameraControllerConfig)
        this.viewer._cesiumWidget._creditContainer.style.display = "none";
        this.scene = this.viewer.scene;
        this.scene.sun.show = false
        this.bloomEffect = this.viewer.scene.bloomEffect
        this.camera = this.scene.camera;
        this.canvas = this.scene.canvas;
        this.globe = this.scene.globe;
        this.tile3DLayers = this.scene.layers
        this.tile3DLayerArray = this.tile3DLayers._layers._array
        this.imageryLayers = this.viewer.imageryLayers;
        this.imageryLayerArray = this.viewer.imageryLayers._layers;
        //functions
        this.addImageryLayer = addImageryLayer;
        this.clipImageryLayer = clipImageryLayer;
        this.cancelClipImageryLayer = cancelClipImageryLayer;
        this.getShowImageryLayer = getShowImageryLayer;
        this.addTerrainLayer = addTerrainLayer;
        this.addArcgisImageryLayer = addArcgisImageryLayer;
        this.TiandituImageryLayer = TiandituImageryLayer;
        this.addScene = addScene;
        this.addS3MTilesLayerByScp = addS3MTilesLayerByScp;
        this.setS3MTilesLayerStyle3D = setS3MTilesLayerStyle3D;
        this.addCanvasEventListener = addCanvasEventListener;
        this.addMapEventListener = addMapEventListener;
        this.cartesianToWGS84BLH = cartesianToWGS84BLH;
        this.createMeasureHandler = createMeasureHandler;
        this.createDrawHandler = createDrawHandler;
        this.createPolygonClipHandler = createPolygonClipHandler;
        this.getCameraView = getCameraView;
        this.flyToProjectCoordinate = flyToProjectCoordinate;
        this.projectCoordinateToCartesian = projectCoordinateToCartesian;
        this.getMapCenter = getMapCenter;
        this.restrictedView = restrictedView;
        this.findLayersBydatasource = findLayersBydatasource;
        this.hideTile3DLayers = hideTile3DLayers;
        this.showTile3DLayers = showTile3DLayers;
        this.getMapExtent = getMapExtent;

        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/SuperMapImageryProvider.html?classFilter=SuperMapImageryProvider
         * @param {object} option 
         * @return {ImageryLayer}
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ImageryLayer.html
         */
        function addImageryLayer(option) {
            let { index } = option
            let layer = this.imageryLayers.addImageryProvider(
                new Cesium.SuperMapImageryProvider(option),
                index
            );
            return layer
        }
        function clipImageryLayer(rectangle) {
            let clipLayers = this.getShowImageryLayer()
            if (clipLayers.length > 0) {
                clipLayers.map((layer) => {
                    let index = layer._layerIndex;
                    let url = layer._imageryProvider._url.substring(0, layer._imageryProvider._url.length - 1)
                    let { alpha, brightness, contrast, gamma, hue, saturation, splitDirection, transperantBackColor, transperantBackColorTolerance } = layer
                    this.imageryLayers.remove(layer)
                    let imageryProvider = new Cesium.SuperMapImageryProvider({ url });
                    let clipLayer = new Cesium.ImageryLayer(imageryProvider, { rectangle });
                    _mergeImageryStyle(clipLayer, { alpha, brightness, contrast, gamma, hue, saturation, splitDirection, transperantBackColor, transperantBackColorTolerance })
                    this.imageryLayers.add(clipLayer, index)
                })
            }
            // let { index } = option
            // let imageryProvider = new Cesium.SuperMapImageryProvider({url:'http://172.18.230.222:8090/iserver/services/map-ugcv5-SZMapExtend/rest/maps/SZMapExtend'});
            // let layer = new Cesium.ImageryLayer(imageryProvider, {rectangle});
            // this.imageryLayers.add(layer)
            // return layer
        }
        function cancelClipImageryLayer() {
            let clipLayers = this.getShowImageryLayer()
            if (clipLayers.length > 0) {
                clipLayers.map((layer) => {
                    let index = layer._layerIndex;
                    let url = layer._imageryProvider._url.substring(0, layer._imageryProvider._url.length - 1)
                    let { alpha, brightness, contrast, gamma, hue, saturation, splitDirection, transperantBackColor, transperantBackColorTolerance } = layer
                    this.imageryLayers.remove(layer)
                    let imageryProvider = new Cesium.SuperMapImageryProvider({ url });
                    let noClipLayer = new Cesium.ImageryLayer(imageryProvider);
                    _mergeImageryStyle(noClipLayer, { alpha, brightness, contrast, gamma, hue, saturation, splitDirection, transperantBackColor, transperantBackColorTolerance })
                    this.imageryLayers.add(noClipLayer, index)
                })
            }
        }
        function getShowImageryLayer() {
            return this.imageryLayerArray.filter(layer => {
                return layer.show && layer.alpha !== 0
            })
        }
        /**
         * See http://localhost:8086/examples/tianditu.html
         * @param {object} option 
         * @return {ImageryLayer}
         * See http://localhost:8086/examples/tianditu.html
         */
        function TiandituImageryLayer(option) {
            let { index, mapStyle, tdituToken, isimage } = option

            if (isimage) {
                this.imageryLayers.addImageryProvider(new Cesium.TiandituImageryProvider({
                    credit: new Cesium.Credit('天地图全球影像服务     数据来源：国家地理信息公共服务平台 & 四川省测绘地理信息局'),
                    token: tdituToken
                }));
            }

            //初始化天地图全球中文注记服务，并添加至影像图层
            var labelImagery = new Cesium.TiandituImageryProvider({
                mapStyle: Cesium.TiandituMapsStyle[mapStyle], //天地图全球中文注记服务（经纬度投影）
                token: tdituToken
            });
            this.imageryLayers.addImageryProvider(labelImagery);

            return labelImagery;
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ArcGisMapServerImageryProvider.html
         * @param {object} option 
         * @return {ImageryLayer}
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ImageryLayer.html
         */
        function addArcgisImageryLayer(option) {
            let { index } = option
            let layer = this.imageryLayers.addImageryProvider(
                new Cesium.ArcGisMapServerImageryProvider(option),
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
        function addScene(url, dataUrl) {
            return this.scene.open(url).then(function (layers) {
                dataUrl && layers.map((layer) => {
                    let temp = layer.name.split('@')
                    let url = dataUrl
                    let dataSetName = temp[0]
                    let dataSourceName = temp[1]
                    layer.setQueryParameter({ url, dataSetName, dataSourceName })
                })
                return layers
            })
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/Scene.html
         * @param {object} option 
         * url String iserver中发布的配置文件地址。
         * eg: http://172.18.230.221:8090/iserver/services/3D-dianxin/rest/realspace/datas/fengguan@dianxin/config
         * name String (必须) 图层名
         */
        function addS3MTilesLayerByScp(option) {
            // let { url, index } = option
            // return this.scene.addS3MTilesLayerByScp(url, option, index)
        }
        /**
         * http://support.supermap.com.cn:8090/webgl/Build/Documentation/S3MTilesLayer.html
         * http://support.supermap.com.cn:8090/webgl/Build/Documentation/Style3D.html
         * @param {S3MTilesLayer} layer 
         * @param {object} option 
         */
        function setS3MTilesLayerStyle3D(layer, option) {
            let style3D = new Cesium.Style3D();
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
         * 笛卡尔坐标系转84经纬度
         * @param {object} cartesian 
         * @returns {object} {B,L,H}
         */
        function cartesianToWGS84BLH(cartesian) {
            let B, L, H
            if (cartesian) {
                let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
                // console.log(cartographic)
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
        function createMeasureHandler(mode, callback = _noop, activecallback = _noop, clampMode = 'Ground') {
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
            handler.enableDepthTest = false;
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
            handler.enableDepthTest = false;
            handler.activeEvt.addEventListener(activecallback);
            return handler
        }
        /**
         * See http://support.supermap.com.cn:8090/webgl/Build/Documentation/DrawHandler.html
         * @param {Array} layers this.tile3DLayerArray or custom
         * @param {string} clipMode See http://support.supermap.com.cn:8090/webgl/Build/Documentation/ModifyRegionMode.html
         * @returns handler 
         */
        function createPolygonClipHandler(layers, clipMode = 'CLIP_INSIDE', activecallback = _noop) {
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

                polygonClipHandler.polyline.show = false
            }, activecallback)
            return polygonClipHandler
        }
        /**
         * @param {obj} offset { heightOffset, latitudeOffset, longitudeOffset } UNIT:'M','Radian','Radian'
         */
        function getCameraView(offset = {}) {
            let { height, latitude, longitude } = this.camera.positionCartographic
            height += offset.heightOffset ? offset.heightOffset : 0;
            latitude += offset.latitudeOffset ? offset.latitudeOffset : 0;
            longitude += offset.longitudeOffset ? offset.longitudeOffset : 0;
            let pitch = this.camera.pitch
            let heading = this.camera.heading
            let roll = this.camera.roll
            // console.log(this.camera.position) //camera.position为投影坐标系
            return {
                destination: this.Cesium.Cartesian3.fromRadians(longitude, latitude, height),
                orientation: {
                    pitch,
                    heading,
                    roll
                }
            }
        }
        /**
         * 取地图视图范围返回对角点经纬度  左上 右下
         * 
         * 未完
         */
        function getMapExtent() {
            let pt1 = new Cesium.Cartesian2(0, 0);
            let pt2 = new Cesium.Cartesian2(this.canvas.width, this.canvas.height);
            let pick1 = this.globe.pick(this.camera.getPickRay(pt1), this.scene);
            let pick2 = this.globe.pick(this.camera.getPickRay(pt2), this.scene);
            //将三维坐标转成地理坐标
            let geoPt1 = this.globe.ellipsoid.cartesianToCartographic(pick1);
            let geoPt2 = this.globe.ellipsoid.cartesianToCartographic(pick2);
            //地理坐标转换为经纬度坐标
            let lefttop = [geoPt1.longitude / Math.PI * 180, geoPt1.latitude / Math.PI * 180];
            let rightbottom = [geoPt2.longitude / Math.PI * 180, geoPt2.latitude / Math.PI * 180];
            return { geoPt1, geoPt2 }
        }
        /**
         * @param {object} cartesian3 {x:0,y:0,z:0} ProjectCoordinate
         * @param {object} option see flyTo(options) http://support.supermap.com.cn:8090/webgl/WebGL_API/webgl_chm/Documentation/Camera.html
         */
        function flyToProjectCoordinate(cartesian3, option) {
            let radBLH = this.scene.mapProjection.unproject(cartesian3);
            let L = Cesium.Math.toDegrees(radBLH.longitude);
            let B = Cesium.Math.toDegrees(radBLH.latitude);
            let destination = Cesium.Cartesian3.fromDegrees(L, B, radBLH.height);
            // this.camera.lookAt(center, new Cesium.Cartesian3(0.0, 0, 3000.0))
            let copyOption = {}
            option && (copyOption = option)
            copyOption.destination = destination
            this.camera.flyTo(copyOption);
        }
        function projectCoordinateToCartesian(x, y, z) {
            let point = new Cesium.Cartesian3(x, y, z);
            let radBLH = this.scene.mapProjection.unproject(point);
            let L = Cesium.Math.toDegrees(radBLH.longitude);
            let B = Cesium.Math.toDegrees(radBLH.latitude);
            let cartesian = Cesium.Cartesian3.fromDegrees(L, B, radBLH.height);
            return cartesian
        }
        /**
         * 获取地图视图当前中心位置的坐标
         */
        function getMapCenter() {
            let cartesian = this.camera.pickEllipsoid(new Cesium.Cartesian2(this.canvas.clientWidth / 2, this.canvas.clientHeight / 2));
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
            return cartographic;
        }
        /**
         * 矩形限定视相机位置
         * @param {object} rectangle http://support.supermap.com.cn:8090/webgl/WebGL_API/webgl_chm/Documentation/Rectangle.html
         * @return A function that will remove this event listener when invoked.
         * http://support.supermap.com.cn:8090/webgl/WebGL_API/webgl_chm/Documentation/Event.html
         */
        function restrictedView(restrictedViewRectangle, homeViewRectangle) {
            // let r = new Cesium.Rectangle(0.012980446876886686, 0.0003970090952860756, 0.027238083608254474, 0.008689209673973042)
            return this.camera.changed.addEventListener(function () {
                // let { height, latitude, longitude } = this.camera.positionCartographic
                if (!Cesium.Rectangle.contains(restrictedViewRectangle, this.camera.positionCartographic)) {
                    this.camera.flyTo({ destination: homeViewRectangle, duration: 1 })
                }
            }, this)
        }
        /**
         *  PS:数据处理时 默认分隔符为 @
         * @param {string} datasource  datasource name
         */
        function findLayersBydatasource(datasource) {
            let tile3DLayers = new Array();
            this.tile3DLayerArray.map(function (layer) {
                let curDataSource = layer.name.split('@')[1]
                if (curDataSource === datasource) {
                    tile3DLayers.push(layer)
                }
            })
            return tile3DLayers;
        }

        function hideTile3DLayers(tile3DLayers) {
            tile3DLayers.map(function (layer) {
                layer.visible = false
            })
        }
        function showTile3DLayers(tile3DLayers) {
            tile3DLayers.map(function (layer) {
                layer.visible = true
            })
        }
    }
    function _mergeImageryStyle(layer, option) {
        Object.keys(option).forEach(key => {
            layer[key] && (layer[key] = option[key])
        })
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
            if (!excludeKey.includes(key)) {
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
    function _noop() { }

    return constructor
})