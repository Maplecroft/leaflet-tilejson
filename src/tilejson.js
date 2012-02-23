L.TileJSON = (function() {
    var semver = "\\s*[v=]*\\s*([0-9]+)"    // major
        + "\\.([0-9]+)"                  // minor
        + "\\.([0-9]+)"                  // patch
        + "(-[0-9]+-?)?"                 // build
        + "([a-zA-Z-][a-zA-Z0-9-\.:]*)?"; // tag
    var semverRegEx = new RegExp("^\\s*"+semver+"\\s*$");
    
    var parse = function(v) {
        return v.match(semverRegEx); 
    };

    function validateVersion(tileJSON) {
        if (!tileJSON.tilejson) {
            throw new Exception('Missing property "tilejson".');
        }
        
        v = parse(tileJSON.tilejson);
        if (!v || v[1] != 2) {
            throw new Exception('This parser supports version 2 '
                                + 'of TileJSON. (Provided version: "'
                                + tileJSON.tilejson + '"');
        }
    };

    function parseZoom(tileJSON, cfg) {
        if (tileJSON.minzoom) {
            cfg.minZoom = parseInt(tileJSON.minzoom);
        }

        if (tileJSON.maxzoom) {
            cfg.maxZoom = parseInt(tileJSON.maxzoom);
        } else {
            cfg.maxZoom = 22;
        }

        return cfg;
    }

    function createMapConfig(tileJSON) {
        validateVersion(tileJSON);
        cfg = {};
        
        parseZoom(tileJSON, cfg);
        
        if (tileJSON.center) {
            var center = tileJSON.center;
            cfg.center = new L.LatLng(center[1], center[0]);
            cfg.zoom = center[2];
        }

        if (tileJSON.attribution) {
            cfg.attributionControl = true;
        }
        
        return cfg;
    };

    function createTileLayerConfig(tileJSON) {
        validateVersion(tileJSON);
        cfg = {};
        
        parseZoom(tileJSON, cfg);
        
        if (tileJSON.attribution) {
            cfg.attribution = tileJSON.attribution;
        }
        
        if (tileJSON.scheme) {
            cfg.scheme = tileJSON.scheme;
        }
        
        return cfg;
    };

    function createTileLayer(tileJSON) {
        var tileUrl = tileJSON.tiles[0].replace(/\$({[sxyz]})/g, '$1');
        return new L.TileLayer(tileUrl, createTileLayerConfig(tileJSON));
    };

    return {
        createMapConfig: createMapConfig,

        createTileLayerConfig: createTileLayerConfig,

        createTileLayer: createTileLayer,

        createMap: function(id, tileJSON) {
            var mapConfig = createMapConfig(tileJSON);
            mapConfig.layers = [createTileLayer(tileJSON)];
            return new L.Map(id, mapConfig);
        }
    }
}());