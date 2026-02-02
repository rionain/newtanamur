

var iLastIxMobil__ = 1 << 30;
var iLastIxPOI__ = 0;
var QMAP__ = {

    GMAP__: false,
    OMAP__: false,
    showinfo__: true,
    openNumWindow__: true,
    InfoWindow__: false,
    ms_tile__: ".t1il2es.v3ir4tu5al6ea7rt8h.n8et/t0il0es/".replace(/\d/gi, ""),
    readRoute__: true,

    
    load_xmaps__: function() {
        var tmap = $('input[name=maptype__]');
        tmap.each(function() {
            var me = $(this);
            if (me.val() == XMAP) {
                me.attr("checked", true);
                return false;
            }
        });
        tmap.click(function() {
            var xmap = $(this).val();
            if (XMAP != xmap) {
                $("#mapstyle__").html("<B>tunggu...</B>");
                location = "./?load=".concat(N._EH(W), (M.wfilter__ ? "&pself=" + M.wfilter__ : ""), "&XMAP=", xmap);
            }
        });
		
        // sementara //
        XMAP = "googlev3";
        var emap = document.getElementById("idMainMap__");
		// regPath
		var zkey = "re";
		zkey = eval(zkey.concat("gP").concat("at").concat("h"));
		if(zkey && zkey.length>2) {
				zkey = N._DH(zkey);
		} else {
				// zkey = '';
				// zkey = 'AIzaSyCiBLGSVJWKYPxPYYM2g3yPuQA5xclfQsM';
				zkey = N._DH('_0239e052ef6eda7a3e9e33a7228c0f991a8c18eb4dff70fa50a576b87c2f8c22ac529938b9299830f0');
		}
        switch (XMAP) {
            case "googlev3":

                var berror = 1;
                // TUNGGU 16 DETIK, JIKA GOOGLE GAGAL, ULANGI LAGI //
                setTimeout(function() {
                    if (berror) {
                        //berror = 0;
                        //QMAP__.load_gmaps__(emap);
                        //alert("PETA GOOGLE TERSENDAT; baiknya periksa sambungan internet anda;");
                        // gagal, ulangi lagi //
                        //setTimeout(function () {M.load_body__(0);}, 100);
                        docId("body").innerHTML = "<H2>" + M.bad_connection__ + "</H2>";
                        M.load_body__(0);
                    }
                }, 16000);

                var smygmap = document.createElement("script");
                smygmap.type = "text/javascript";
                // smygmap.src  = "https://maps.googleapis.com/maps/api/js?key="+regPath+"&sensor=false&language=id&callback=googlev3";
                // smygmap.src  = "https://maps.googleapis.com/maps/api/js?v=3.15&sensor=false&language=id&callback=googlev3";


				// smygmap.src = location.protocol + "//maps.googleapis.com/maps/api/js?v=3.16&key="+zkey+"&sensor=false&language=id&callback=googlev3";
				smygmap.src = location.protocol + N._DH("_0280e56bd359c25f8847f57be964e79d069919ca3db73fe32ba14ac701c952f539fa79bb8d1d9c1f8912e732af24b159905ccb4af96df36be33d139048df55eb70b32ba852da53cf4d9d7dfb61ef6e198043");
				zkey = "ke".concat("y=") + zkey;
				if( zkey.length>=15 ) {
					smygmap.src = smygmap.src.replace("777", zkey);
				}

								
                Global__.googlev3 = function() {
                    if (berror) {
                        berror = 0;
                        QMAP__.load_gmaps__(emap);						
                    }
                };
                $("head").append(smygmap);
                break;

            case "nokia":

                var onApiFeaturesLoaded = function() {
                        nokia.Settings.set("appId", "v42-UVkjmfviSnhPuxfS");
                        nokia.Settings.set("authenticationToken", "RQ7xFzTh68ioSsbMSF2hbQ");
                        QMAP__.load_nokiamaps__(emap);
                    },
                    // if an error occurs during the feature loading
                    onApiFeaturesError = function(error) {
                        alert("Whoops! " + error);
                    };
                scriptTag(location.protocol+"//api.maps.nokia.com/2.2.4/jsl.js?blank=true",
                    function() {
                        nokia.Features.load(
                            nokia.Features.getFeaturesFromMatrix(["all"]),
                            onApiFeaturesLoaded, // an callback when everything was successfully loaded                     
                            onApiFeaturesError, // an error callback                  
                            null, // Indicates that the current document applies                      
                            false //Indicates that loading should be asynchronous
                        );
                    }
                );
                break;

            case "microsoft7":
                Global__.microsoft_key = zkey;
            default:
                setTimeout(function() {
                    //M.load_xmap__();
                }, 900);
        }
    },

    
    load_nokiamaps__: function(emap) {
        var amap = M.xloadcookie__;
        // "nokia.maps.map" = "#0214e66d179f11c409bf28a162ab21ca"
        var smap = N._DH("_0214e66d179f11c409bf28a162ab21ca");
        var cmap = QMAP__.OMAP__ = eval(smap);

        // CUSTOM //
        cmap.LatLng = nokia.maps.geo.Coordinate;
        cmap.LatLng.prototype.lat = function() {
            return this.latitude;
        };
        cmap.LatLng.prototype.lng = function() {
            return this.longitude;
        };
        cmap.Display.prototype.getZoom = function() {
            return this.zoomLevel;
        };
        cmap.Display.prototype.getCenter = function() {
            return this.center;
        };
        cmap.Point = nokia.maps.util.Point;
        // SUDAH // cmap.Display.prototype.setCenter


        // event //
        cmap.Display.prototype.xlatLng = function(e) {
            return QMAP__.GMAP__.pixelToGeo(e.displayX, e.displayY);
        };
        cmap.Display.prototype.xListen = function(cevent, fungsi) {
            QMAP__.GMAP__.addListener(cevent, fungsi);
            return fungsi;
        };
        cmap.Display.prototype.NoListen = function(cevent, fungsi) {
            QMAP__.GMAP__.removeListener(cevent, fungsi);
        };

        var xcom = cmap.component;
        var komponen = [
            new xcom.Behavior(), new xcom.ZoomBar(), new xcom.ScaleBar(), new xcom.Traffic(), new nokia.maps.positioning.component.Positioning()
        ];
        if (!$.browser.msie) {
            komponen.push(new xcom.TypeSelector());
        }
        var xmap = QMAP__.GMAP__ = new cmap.Display(
            emap, {
                zoomLevel: amap[2], // Zoom level for the map
                    
                center: [amap[0], amap[1]], // Center coordinates
                    
                components: komponen
            });

        var ix = amap[3];
        ix = isNaN(ix) ? 0 : parseInt(ix);
        var arrtipe = xmap.availableBaseMapTypes.asArray();
        if (ix >= arrtipe.length) ix = 0;
        xmap.set("baseMapType", arrtipe[ix]);

        load_nokia_proto__();
        QMAP__.load_nokia_event();
        M.onload__();
    },

    
    load_nokia_event: function() {

        // do something //
        var cmap = QMAP__.OMAP__;
        var xmap = QMAP__.GMAP__;
        //var cbubble = cmap.component.InfoBubbles;

        // test //
        var oinfow = QMAP__.InfoWindow__ = new cmap.component.InfoBubbles();
        oinfow.shtml = "";

        //map is an instance of nokia.maps.map.Display
        xmap.components.add(oinfow);

        // causes all subsequently created bubbles to open left of their anchor
        // (unless there's not enough space on that side)
        oinfow.options.set({
            defaultXAlignment: oinfow.ALIGNMENT_RIGHT,
            defaultYAlignment: oinfow.ALIGNMENT_ABOVE
        });

        var buble;
        oinfow.buka__ = function(point, msg) {
            if (msg) this.shtml = msg;
            QMAP__.openNumWindow__ = true;
            buble = oinfow.openBubble(this.shtml, point, function() {
                if (menubox__.picker__) menubox__.picker__.hide();
                QMAP__.openNumWindow__ = false;
            });
            setTimeout(function() {
                if (!xmap.getViewBounds().contains(point)) {
                    xmap.setCenter(point);
                }
            }, 100);
        };
        oinfow.tutup__ = function() {
                if (menubox__.picker__) menubox__.picker__.hide();
                if (buble) buble.close();
            };
            //omap.event.addListener(oinfow, 'content_changed', function () {
            //    if (menubox__.picker__) menubox__.picker__.hide();
            //});
        oinfow.lastFocus__ = {
            stgl: "",
            mobid: "",
            waktu: "",
            jarak: 0
        };

        xmap.addListener('mousemove', function(event) {
            var e = xmap.pixelToGeo(event.targetX, event.targetY);
            var lat = e.latitude.toFixed(4);
            var lon = e.longitude.toFixed(4);
            var spoint = "&nbsp;lat: " + lat + "<br/>&nbsp;lon: " + lon;
            $("#latlonInfo__").html(spoint);
        });

        // KLIK KE MAP //
        xmap.klik = function(e) {
            var stgl = M.pilihStrTgl__;
            var oneday = TrackCache__.getItem__(stgl);
            if (oneday) {
                oneday.getNearPoint__(e.latitude, e.longitude);
            }
        };
        xmap.addListener("click", function(event) {
            if (event && event.targetX) {
                var e = xmap.pixelToGeo(event.targetX, event.targetY);
                xmap.klik(e);
            }
        });

        //setTimeout(function () { 
        //	oinfow.buka__(xmap.center, "myInfoBubble");
        //}, 2000);

        // save posisi //
        setInterval(function() {
            QMAP__.nokiaSave__();
        }, 5000);

        var refres = QMAP__.map_refresh__ = function(jeda) {
            jeda = jeda === undefined ? 1000 : jeda;
            //setTimeout(function () {
            //var z = xmap.zoomLevel;
            //omap.event.trigger(xmap, 'resize');
            //xmap.setZoomLevel(z);
            //},jeda);
            xmap.update(jeda);
        };
        refres(2000);

    },

    
    nokiaSave__: function() {
        var ocenter, cook;
        var xmap = QMAP__.GMAP__;
        var tipemap = xmap.baseMapType ? xmap.baseMapType.id : 0;
        ocenter = xmap.center;
        cook = "LATLON=" + ocenter.latitude + "|" + ocenter.longitude + "|" + xmap.zoomLevel + "|" + tipemap + "|" + "1002" + M.cook__.getExpired__(100);
        document.cookie = cook;
    },

    
    load_gmaps__: function(emap) {
        var objmap = this;
        var latlng = false,
            amap = M.xloadcookie__;
        if ((typeof google == 'undefined') || !google) {
            setTimeout(function() {
                alert(M.bad_connection__);
            }, 1000);
            return;
        }
        // "google.maps" = "#0211e290169401824fb634bf3a"
        var smap = N._DH("_0211e290169401824fb634bf3a");
        var cmap = QMAP__.OMAP__ = eval(smap);
        latlng = new cmap.LatLng(amap[0], amap[1]);


        //Define OSM as base layer in addition to the default Google layers
        var osmMapType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return location.protocol + "//tile.openstreetmap.org/" +
                    zoom + "/" + coord.x + "/" + coord.y + ".png";
            },
            tileSize: new cmap.Size(256, 256),
            isPng: true,
            alt: "OpenStreet, Peta",
            name: "OpenStreet",
            maxZoom: 19
        });

        //Define OSM as base layer in addition to the default Google layers
        var WikiMapType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                return location.protocol + "//" + "i" + (coord.x % 4 + (coord.y % 4) * 4) + ".wik" + "ima" + "pia.org/?x=" + coord.x + "&y=" + coord.y + "&zoom=" + zoom;
            },
            tileSize: new cmap.Size(256, 256),
            isPng: true,
            alt: "wik" + "imapia" + ", Peta",
            name: "wik" + "imapia",
            maxZoom: 20
        });

        /*
        	    var navigasiMapType = new cmap.ImageMapType({
        	        getTileUrl: function (coord, zoom) {
        	            return location.protocol+"//tiles.nav"+"igasi.net/navnet-hybrid/" +
        		            zoom + "/" + coord.x + "/" + coord.y + ".png";
        	        },
        	        tileSize: new cmap.Size(256, 256),
        	        isPng: true,
        	        alt: "nav"+"igasi.net, Peta",
        	        name: "nav"+"igasi",
        	        maxZoom: 18
        	    });
        */

        // NOKIA //
/*		
        this.nnokia__ = 0;
        var nokiaMapType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                if (++objmap.nnokia__ > 4) objmap.nnokia__ = 1;
                return location.protocol+"//" + objmap.nnokia__ + ".maps.n" + "lp.nok" + "ia.com/mapt" + "ile/2.1/mapt" + "ile/ne" + "west/norm" + "al.day/" +
                    zoom +
                    "/" +
                    coord.x +
                    "/" +
                    coord.y +
                    "/256/jpg?lg=ENG&token&requestid=yahoo.prod&app_id";

            },
            tileSize: new cmap.Size(256, 256),
            isPng: true,
            alt: "no" + "kia, Peta",
            name: "no" + "kia P",
            maxZoom: 20
        });
        var nokiaSatType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                if (++objmap.nnokia__ > 4) objmap.nnokia__ = 1;
                return location.protocol+"//" + objmap.nnokia__ + ".maps.n" + "lp.nok" + "ia.com/mapt" + "ile/2.1/mapt" + "ile/ne" + "west/hyb" + "rid.day/" +
                    zoom +
                    "/" +
                    coord.x +
                    "/" +
                    coord.y +
                    "/256/jpg?lg=ENG&token&requestid=yahoo.prod&app_id";

            },
            tileSize: new cmap.Size(256, 256),
            isPng: true,
            alt: "no" + "kia, Satelit",
            name: "no" + "kia S",
            maxZoom: 20
        });
*/		

        var getMsTile = function(y, x, zoom) {

            var pad = function(n, p) {
                while (n.length < p) {
                    n = '0' + n;
                }
                return n;
            };

            var x2 = pad(String(x.toString(2)), zoom + 1).split(""),
                y2 = pad(String(y.toString(2)), zoom + 1).split(""),
                quadkey = '';


            for (var i = 0; i < y2.length; i++) {
                quadkey += (1 * y2[i] + x2[i]);
            }
            // ensure that the number is positive (not two's complement)
            quadkey = (parseInt('0' + quadkey, 2)).toString(4);
            return quadkey.substring(quadkey.length - zoom);
        };

        var bingMapType = new cmap.ImageMapType({

            getTileUrl: function(coord, zoom) {
                var sTile = getMsTile(coord.y, coord.x, zoom);
                var s = location.protocol+'//ecn.t' + sTile.substring(sTile.length - 1, sTile.length) +
                    QMAP__.ms_tile__ + 'r' +
                    sTile + '.png?g=426&mkt=id';
                return s;
                //&mkt=en&shading=hill
            },

            tileSize: new cmap.Size(256, 256),
            isPng: true,
            alt: "microsoft, peta",
            name: "Microsoft P",
            maxZoom: 19
        });

        var bingSatType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                var sTile = getMsTile(coord.y, coord.x, zoom);
                var s = location.protocol+'//ecn.t' + sTile.substring(sTile.length - 1, sTile.length) +
                    QMAP__.ms_tile__ + 'a' +
                    sTile + '.jpeg?g=426&mkt=id';
                return s;
            },
            tileSize: new cmap.Size(256, 256),
            isPng: false,
            alt: "microsoft, satelit",
            name: "Microsoft S",
            maxZoom: 19
        });

        var bingHibType = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                var sTile = getMsTile(coord.y, coord.x, zoom);
                var s = location.protocol+'//ecn.t' + sTile.substring(sTile.length - 1, sTile.length) +
                    QMAP__.ms_tile__ + 'h' +
                    sTile + '.jpeg?g=426&mkt=id';
                return s;
            },
            tileSize: new cmap.Size(256, 256),
            isPng: false,
            alt: "microsoft, Hibrida",
            name: "Microsoft H",
            maxZoom: 19
        });


        //Define custom WMS tiled layer
        var SLPLayer = new cmap.ImageMapType({
            getTileUrl: function(coord, zoom) {
                var proj = QMAP__.GMAP__.getProjection();
                var zfactor = Math.pow(2, zoom);
                // get Long Lat coordinates
                var top = proj.fromPointToLatLng(new cmap.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
                var bot = proj.fromPointToLatLng(new cmap.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));

                //corrections for the slight shift of the SLP (mapserver)
                var deltaX = 0.0013;
                var deltaY = 0.00058;

                //create the Bounding box string
                var bbox = (top.lng() + deltaX) + "," +
                    (bot.lat() + deltaY) + "," +
                    (bot.lng() + deltaX) + "," +
                    (top.lat() + deltaY);

                //base WMS URL
                var url = location.protocol+"//mapserver-slp.mendelu.cz/cgi-bin/mapserv?map=/var/local/slp/krtinyWMS.map&";
                url += "&REQUEST=GetMap"; //WMS operation
                url += "&SERVICE=WMS"; //WMS service
                url += "&VERSION=1.1.1"; //WMS version  
                url += "&LAYERS=" + "typologie,hm2003"; //WMS layers
                url += "&FORMAT=image/png"; //WMS format
                url += "&BGCOLOR=0xFFFFFF";
                url += "&TRANSPARENT=TRUE";
                url += "&SRS=EPSG:4326"; //set WGS84 
                url += "&BBOX=" + bbox; // set bounding box
                url += "&WIDTH=256"; //tile size in google
                url += "&HEIGHT=256";
                return url; // return URL for the tile

            },
            tileSize: new cmap.Size(256, 256),
            isPng: true
        });


        var ojenis = cmap.MapTypeId;
        var arrtipemap = [ojenis.ROADMAP, ojenis.SATELLITE, ojenis.HYBRID, ojenis.TERRAIN, 'Ms Peta', 'Ms Satelit', 'Ms Hibrida', 'wikimapia', 'openstreet'];
        var tipepeta = amap[3];
		// jika belum dipilih, pilih paling bawah
		if( arrtipemap.indexOf(tipepeta)<0 ) {
			// tipepeta = ojenis.ROADMAP;
			tipepeta = arrtipemap[arrtipemap.length-1];
		}
        var mapOptions = {
            zoom: amap[2],
            center: latlng,
            mapTypeId: tipepeta,
            mapTypeControlOptions: {
                mapTypeIds: arrtipemap,
                style: cmap.MapTypeControlStyle.DROPDOWN_MENU
            },
            streetViewControl: true,
            streetViewControlOptions: {
                position: cmap.ControlPosition.LEFT_CENTER
            },
            zoomControl: true,
            zoomControlOptions: {
                position: cmap.ControlPosition.LEFT_CENTER
            }

        };


        cmap.MVCArray.prototype.strPath = function() {
            var sret = "";
            this.forEach(function(o) {
                sret += "~" + o.lat().toFixed(5) + "^" + o.lng().toFixed(5);
            });
            return sret;
        };

        // event //
        cmap.Map.prototype.xlatLng = function(e) {
            return e.latLng;
        };
        cmap.Map.prototype.xListen = function(cevent, fungsi) {
            return cmap.event.addListener(xmap, cevent, fungsi);
        };
        cmap.Map.prototype.NoListen = function(cevent, fungsi) {
            cmap.event.removeListener(fungsi);
        };


        var xmap = QMAP__.GMAP__ = new cmap.Map(emap, mapOptions);

        if (xmap) {
            load_google_proto__();
            var maptipe = xmap.mapTypes;


            maptipe.set('wikimapia', WikiMapType);
			
            //maptipe.set('nokiamap', nokiaMapType);
            //maptipe.set('nokiasat', nokiaSatType);
            //maptipe.set('navigasi', navigasiMapType);

            maptipe.set('openstreet', osmMapType);
            maptipe.set('Ms Peta', bingMapType);
            maptipe.set('Ms Satelit', bingSatType);
            maptipe.set('Ms Hibrida', bingHibType);
            // belum tahu maksudnya //
            //xmap.overlayMapTypes.push(SLPLayer);

            QMAP__.loadTraffic__(xmap);
            QMAP__.load_gmap_event__();
            M.onload__();
			
			
 			// GEO LOKASI
			var sGeoMarker = document.createElement("script");
			sGeoMarker.type = "text/javascript";
			sGeoMarker.src = "ref/geolocation-marker.js";
			$("head").append(sGeoMarker);
			var GeoMarker = new GeolocationMarker();
			GeoMarker.setCircleOptions({fillColor: '#808080'});
			//GeoMarker.setMinimumAccuracy(500);
 			//google.maps.event.addListenerOnce(GeoMarker, 'accuracy_changed', function() {
				//var nakurasi = GeoMarker.getAccuracy();
				//var omap = (nakurasi) ? null : QMAP__.GMAP__;
				//GeoMarker.setMap(omap);
			//});
			//google.maps.event.addListener(GeoMarker, 'geolocation_error', function(e) {
				//alert('There was an error obtaining your position. Message: ' + e.message);
			//});
			//var omap = null;
			//var nakurasi = GeoMarker.getAccuracy();
			//if(nakurasi) {
				//omap = QMAP__.GMAP__;
			//}
			//GeoMarker.setMap(omap);
			//var omap = (nakurasi) ? null : QMAP__.GMAP__;
			//GeoMarker.setMap(QMAP__.GMAP__);
			$("#trlacak__").click(function() {
				var scek = $("#tdlacak__").html();
				scek = (scek=='Saya: Tampil'?'Saya: Sembunyi':'Saya: Tampil')
				if( scek=='Saya: Tampil' ) {
					GeoMarker.setMap(QMAP__.GMAP__);
				} else {
					GeoMarker.setMap(null);
				}
				$("#tdlacak__").html(scek);				
			});
			

            // setel judul google maps //
            setTimeout(function() {
				var btn, sdismis="button.dismissButton";
                $('div[title="Tunjukkan peta jalan"]').attr("title", "Peta google").html("Peta google");
				//.css("font-size", "10px")
                $('div[title="Tunjukkan citra satelit"]').attr("title", "Satelit google").html("Satelit google");
				btn =  $(sdismis);
				if(btn) {
					btn.click();
				} else {
					setTimeout(function() {
						btn =  $(sdismis);
						if(btn) {
							btn.click();
						}
					}, 5321);		
				}
            }, 3000);		
			
        }
    },

    
    btnTraffic__: 0,
    maptypeidChanged__: function(xmap) {
        var arrtypemaps = ["hybrid", "roadmap", "terrain"];
        var myMapType = xmap.getMapTypeId();
        var visible = arrtypemaps.indexOf(myMapType) >= 0;
        $(QMAP__.btnTraffic__).css("display", visible ? "" : "none");
    },


    loadTraffic__: function(xmap) {
        var btrafik = false,
            btnTraffic = QMAP__.btnTraffic__ = document.createElement('DIV');
        $(btnTraffic).addClass('gmap-control-container').addClass('gmnoprint');

        var controlUI = document.createElement('DIV');
        $(controlUI).addClass('gmap-control');
        $(controlUI).text('trafik');
        $(btnTraffic).append(controlUI);

        var legend = '<ul style="font-size:larger">' +
            '<li><span style="background-color: #30ac3e">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: #30ac3e"> sangat lancar</span></li>' +
            '<li><span style="background-color: #FFD000">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: #FFD000"> lancar</span></li>' +
            '<li><span style="background-color: #BB0000">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="color: #BB0000"> lambat</span></li>' +
            '<li><span style="background-color: black">&nbsp;</span><span style="background-color: #BB0000">&nbsp;&nbsp;</span><span style="background-color: black">&nbsp;</span><span style="color: black"> sangat lambat</span></li>' +
            '</ul>';

        var controlLegend = document.createElement('DIV');
        $(controlLegend).addClass('gmap-control-legend');
        $(controlLegend).html(legend);
        $(controlLegend).hide();
        $(btnTraffic).append(controlLegend);

        // Set hover toggle event
        $(controlUI).mouseenter(function() {
            if (btrafik) {
                $(controlLegend).show();
            }
        }).mouseleave(function() {
            $(controlLegend).hide();
        });

        var trafficLayer = new google.maps.TrafficLayer();
        var sibuk = false;
        google.maps.event.addDomListener(controlUI, 'click', function() {
            if (sibuk) return;
            sibuk = true;
            setTimeout(function() {
                btrafik = !btrafik;
                // if (typeof trafficLayer.getMap() == 'undefined' || trafficLayer.getMap() === null) {
                if (btrafik) {
                    $(controlUI).addClass('gmap-control-active');
                    trafficLayer.setMap(xmap);
                    $(controlLegend).show();
                } else {
                    trafficLayer.setMap(null);
                    $(controlUI).removeClass('gmap-control-active');
                    $(controlLegend).hide();
                }
                sibuk = false;
            }, 100);

        });

        xmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(btnTraffic);
    },

    
    load_gmap_event__: function() {


        // info window //
        var cmap = QMAP__.OMAP__;
        var xmap = QMAP__.GMAP__;
        //cmap.InfoWindow.prototype.shtml = "";

        var oinfow = QMAP__.InfoWindow__ = new cmap.InfoWindow();
        oinfow.shtml = "";

        oinfow.buka__ = function(point, msg) {
            if (msg) this.shtml = msg;
            oinfow.setOptions({
                position: point,
                content: this.shtml
            });
            oinfow.open(xmap);
            QMAP__.openNumWindow__ = true;
        };
        cmap.event.addListener(oinfow, 'closeclick', function() {
            if (menubox__.picker__) menubox__.picker__.hide();
            QMAP__.openNumWindow__ = false;
        });
        cmap.event.addListener(oinfow, 'content_changed', function() {
            if (menubox__.picker__) menubox__.picker__.hide();
        });
        oinfow.tutup__ = function() {
            if (menubox__.picker__) menubox__.picker__.hide();
            oinfow.close();
        };
        oinfow.lastFocus__ = {
            stgl: "",
            mobid: "",
            waktu: "",
            jarak: 0
        };

        //setTimeout(function () { 
        //	var p1 = xmap.getCenter();
        //	oinfow.buka__(p1,"<div>hello</div>");
        //}, 1000);

        cmap.event.addListener(xmap, 'mousemove', function(e) {
            var lat = e.latLng.lat().toFixed(4);
            var lon = e.latLng.lng().toFixed(4);
            var spoint = "&nbsp;lat: " + lat + "<br/>&nbsp;lon: " + lon;
            $("#latlonInfo__").html(spoint);
        });

        // KLIK KE MAP //
        xmap.klik = function(platlon) {
            var stgl = M.pilihStrTgl__;
            var oneday = TrackCache__.getItem__(stgl);
            if (oneday) {
                oneday.getNearPoint__(platlon.lat(), platlon.lng());
            }
        };
        cmap.event.addListener(xmap, "click", function(p) {
            if (p) {
                var platlon = (p.latLng === undefined) ? p : p.latLng;
                xmap.klik(platlon);
            }
        });

        cmap.event.addListener(xmap, "maptypeid_changed", function() {
            QMAP__.maptypeidChanged__(xmap);
        });



        //google.maps.event.trigger(xmap, 'resize');
        setInterval(function() {
            QMAP__.google_Save__();
        }, 5000);


        var refres = QMAP__.map_refresh__ = function(jeda) {
            jeda = jeda === undefined ? 1000 : jeda;
            setTimeout(function() {
                var z = xmap.getZoom();
                cmap.event.trigger(xmap, 'resize');
                xmap.setZoom(z);
            }, jeda);
        };
        QMAP__.maptypeidChanged__(xmap);
        refres(2000);
    },

    
    llRead__: function() {
        var defmap = XMAP == "googlev3" ? "openstreet" : "0";
        var adefmap = [-6.222, 106.870, 10, defmap, 1003];

        var cookietext = M.cook__.getString__("LATLON");
        if (!cookietext) return adefmap;

        // == split the cookie text and create the variables ==
        var bits = cookietext.split("|");
        var max = bits.length;
        // version 1002 //
        if (max > 4) {
			adefmap[0] = parseFloat(bits[0]);
			adefmap[1] = parseFloat(bits[1]);
			adefmap[2] = parseInt(bits[2]);
            adefmap[3] = "" + bits[3];
        }
        return adefmap;
    },
    google_Save__: function() {
        var ocenter, cook, xmap = QMAP__.GMAP__;
        ocenter = xmap.getCenter();
        cook = "LATLON=" + ocenter.lat() + "|" + ocenter.lng() + "|" + xmap.getZoom() + "|" + xmap.getMapTypeId() + "|" + "1002" + M.cook__.getExpired__(100);
        document.cookie = cook;
    }

};

function load_nokia_proto__() {

    var xmap = QMAP__.GMAP__;
    var cmap = QMAP__.OMAP__;
    var cshape = nokia.maps.geo.Shape;

    //var cmarker = cmap.StandardMarker;
    var cmarker = cmap.Marker;
    cmarker.prototype.getPosition = function() {
        return this.get("coordinate");
    };
    cmarker.prototype.setPosition = function(latlon) {
        this.set("coordinate", latlon);
    };
    cmarker.prototype.getVisible = function() {
        return this.get("visibility");
    };
    cmarker.prototype.setVisible = function(visible) {
        this.set("visibility", visible);
    };
    cmarker.prototype.setIcon = function(icon) {
        this.set("icon", icon);
    };
    cmarker.prototype.setMap = function(map) {
        this.set("visibility", (map ? true : false));
    };


    var cmarkerStd = cmap.StandardMarker;
    cmarkerStd.prototype.getPosition = function() {
        return this.get("coordinate");
    };
    cmarkerStd.prototype.setPosition = function(latlon) {
        this.set("coordinate", latlon);
    };
    cmarkerStd.prototype.getVisible = function() {
        return this.get("visibility");
    };
    cmarkerStd.prototype.setVisible = function(visible) {
        this.set("visibility", visible);
    };
    cmarkerStd.prototype.setIcon = function(icon) {
        this.set("icon", icon);
    };
    cmarkerStd.prototype.setMap = function(map) {
        this.set("visibility", (map ? true : false));
    };
    //var emap = cmap.event;

    function setPlacemark__(address) {
        var sret = "";
        if (address.street) {
            sret += ", " + address.street;
        }
        if (address.houseNumber) {
            sret += ", " + address.houseNumber;
        }
        if (address.city) {
            sret += ", " + address.city;
        }
        if (address.district) {
            sret += ", " + address.district;
        }
        //if (address.postalCode) {
        //	sret += ", " + address.postalCode;
        //}						
        if (address.state) {
            sret += ", " + address.state;
        }
        if (address.county) {
            sret += ", " + address.county;
        }
        if (address.country && address.country.toUpperCase() != "INDONESIA") {
            sret += ", " + address.country;
        }
        return sret.substr(2);
    }
    var sreversegeo = nokia.places.search.manager.reverseGeoCode;
    Global__.reverseGeoCode__ = function(point, fungsi) {
        function baca(respon, sts) {
            var address, hasil = "";
            var nvalid = -1;
            if (sts == "OK" && respon && (address = respon.location.address)) {
                hasil = setPlacemark__(address);
                nvalid = hasil.split(",").length;
            }
            fungsi(hasil, nvalid);
        }
        sreversegeo.apply(this, [{
            latitude: point.lat(),
            longitude: point.lng(),
            onComplete: baca
        }]);
    };
    reverseGeoCode__.prototype = turunkan__(sreversegeo);

    // KELAS Polyline //
    Global__.Polyline__ = function(map, path, strokeColor, strokeWeight) {
        cmap.Polyline.apply(this, [path, {
            pen: {
                strokeColor: strokeColor,
                lineWidth: strokeWeight,
                visibility: (map ? true : false)
            }
        }]);
        xmap.objects.add(this);
    };
    Polyline__.prototype = turunkan__(cmap.Polyline);
    Polyline__.prototype.getPath = function() {
        return this.get("path");
    };
    Polyline__.prototype.setMap = function(map) {
        this.set("visibility", (map ? true : false));
    };

    // KELAS POLIGON //
    Global__.Polygon__ = function(geodesic, strokeColor, strokeWeight) {
        cmap.Polygon.apply(this, [
            [], {
                pen: {
                    strokeColor: strokeColor,
                    lineWidth: strokeWeight
                }
            }
        ]);
        xmap.objects.add(this);
    };
    Polygon__.prototype = turunkan__(cmap.Polygon);

    Polygon__.prototype.getPath = function() {
        return this.get("path");
    };
    Polygon__.prototype.setMap = function(map) {
        this.set("visibility", (map ? true : false));
    };

    cshape.prototype.pop = function() {
        var nlen = this.getLength();
        if (nlen > 0) this.remove(nlen - 1);
    };
    cshape.prototype.push = function(p) {
        this.add(p);
    };
    cshape.prototype.setAt = function(i, p) {
        this.set(i, p);
    };
    cshape.prototype.strPath = function() {
        var i, titik, sret = "",
            len = this.getLength();
        for (i = 0; i < len; i++) {
            titik = this.get(i);
            sret += "~" + titik.latitude.toFixed(5) + "^" + titik.longitude.toFixed(5);
        }
        return sret;
    };



    String.prototype.width = function(font) {
        var f = font || '12px arial',
            o = $('<Div>' + this + '</Div>')
            .css({
                'position': 'absolute',
                'float': 'left',
                'white-space': 'nowrap',
                'visibility': 'hidden',
                'font': f
            })
            .appendTo($('body')),
            w = o.width();
        o.remove();
        return w;
    };


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    Global__.MarkerStd__ = function(point, visibility, id, fklik, fdragend) {
        cmarkerStd.apply(this, [point, {
            visibility: visibility,
            draggable: (fdragend ? true : false)
        }]);
        this.id = id;
        if (fklik) this.addListener("click", fklik);
        if (fdragend) this.addListener("dragend", fdragend);
        xmap.objects.add(this);
    };
    MarkerStd__.prototype = turunkan__(cmarkerStd);

    Global__.Marker2__ = function(point, icon, anchor, zIndex, visibility, judul, alamat, fklik, fdragend) {

        //cmarker.apply(this, [point]);
        if (anchor === null) {
            anchor = new QMAP__.OMAP__.Point(11, 34);
        }
        cmarker.apply(this, [point, {
            icon: icon,
            anchor: anchor,
            zIndex: zIndex,
            visibility: visibility,
            draggable: (fdragend ? true : false)
        }]);
        var ini = this;
        ini.judul = judul;
        ini.alamat = alamat;


        if (fklik) this.addListener("click", fklik);
        /*		
        		this.addListener("click", function(){
        			var oinfow = QMAP__.InfoWindow__;
        			var html='<b>'+ini.judul+'</b><br/>'+ini.alamat;
        			oinfow.buka__(ini.getPosition(),html);
        			oinfow.lastFocus__.mobid = 0;
        			sMobFocus__ = "";
        			QMAP__.openNumWindow__ = false;
        		});
        */
        if (fdragend) this.addListener("dragend", fdragend);

        xmap.objects.add(this);
    };
    Marker2__.prototype = turunkan__(cmarker);


    Global__.MarkerLab__ = function(point, mkode, yspasi, alarm, ico_url, zindex, visible) {
        var text = mkode.htmlEncode().replace(/\s+/g, " ");
        var lebar = 9 + text.width('bold 12px arial');

        //var bgground = ";background-color:";
        var bgground = "";
        if ((alarm & 1) || (alarm & 2)) bgground += "#FFAAAA"; // SOS atau ALARM
        else if ((alarm & 8) || (alarm & 16)) bgground += "#FFFF80"; // LEPAS atau LOW-BAT
        else if (alarm & 256) bgground += "#DDDDDD"; // OFFLINE
        else if (alarm & 64) bgground += "#BBFFBB"; // ON
        else bgground += "white";

        var slabel = '<svg width="' + (lebar + 1) + '" height="22" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="0.5" y="0.5" rx="3" ry="3" width="' + lebar + '" height="21" style="fill:' + bgground + ';stroke:blue;stroke-width:1;"/>' +
            '<text x="4" y="15" fill="black" style="font-weight:bold; font-family:arial; font-size:12;white-space:nowrap;" >' + text + '</text>' +
            '</svg>';
        var svgParser = new nokia.maps.gfx.SvgParser();
        // ? //
        ico_url = new nokia.maps.gfx.GraphicsImage(svgParser.parseSvg(slabel));

        var thislab = this;
        var anchor = this.anchor = new QMAP__.OMAP__.Point(lebar / 2, -yspasi - 2);
        cmarker.apply(this, [point, {
            icon: ico_url,
            zIndex: zindex,
            visibility: visible,
            anchor: anchor
        }]);

        this.addListener("click", function() {
            var pos = thislab.getPosition();
            xmap.klik(pos);
        });

    };
    MarkerLab__.prototype = turunkan__(cmarker);
    Global__.MarkerMob__ = function(point, mkode, yspasi, alarm, ico_url, ico_dot, zindex, visible) {
        cmarker.apply(this, [point, {
            icon: ico_url,
            anchor: ico_dot,
            zIndex: zindex,
            visibility: visible
        }]);
        var thismarker = this;
        this.addListener("click", function() {
            var pos = thismarker.getPosition();
            xmap.klik(pos);
        });
    };
    MarkerMob__.prototype = turunkan__(cmarker);

    Global__.MarkerMbl__ = function(point, ico_url, ico_dot, judul, ket, yspasi, alarm, mobid) {

        //, [point, {icon:ico_url,anchor:ico_dot,zIndex:1,visibility:false}]
        nokia.maps.map.Container.apply(this);
        var thiscontainer = this;
        var zindex = mobid ? (iLastIxMobil__++) : (iLastIxPOI__++);
        var visible = mobid ? false : true;

        thiscontainer.set("zIndex", zindex);
        thiscontainer.set("visibility", visible);

        thiscontainer.yspasi = yspasi;
        thiscontainer.alarm = alarm;
        thiscontainer.id = 0;
        thiscontainer.mobid = mobid;

        var thismarker = thiscontainer.thismarker = new MarkerMob__(point, judul, yspasi, alarm, ico_url, ico_dot, zindex, visible);
        var thislabel = this.objlabel = new MarkerLab__(point, judul, yspasi, alarm, ico_url, zindex, visible);

        thiscontainer.objects.addAll([thismarker, thislabel]);
        xmap.objects.add(thiscontainer);
    };
    MarkerMbl__.prototype = turunkan__(nokia.maps.map.Container);
    MarkerMbl__.prototype.getPosition = function() {
        return this.thismarker.get("coordinate");
    };
    MarkerMbl__.prototype.setPosition = function(latlon) {
        var thismarker = this.thismarker;
        //thismarker.set("coordinate",latlon);
        //this.objlabel.set("coordinate",latlon);
        var oldpos = thismarker.get("coordinate");
        if (!oldpos.equals(latlon)) {
            thismarker.set("coordinate", latlon);
            var thislabel = this.objlabel;
            thislabel.set("coordinate", latlon);
        }
    };
    MarkerMbl__.prototype.getVisible = function() {
        return this.get("visibility");
    };
    MarkerMbl__.prototype.setVisible = function(visible) {
        this.set("visibility", visible);
    };
    MarkerMbl__.prototype.setIcon = function(icon) {
        this.thismarker.set("icon", icon);
    };
    MarkerMbl__.prototype.setMap = function(map) {
        this.set("visibility", (map ? true : false));
    };
    MarkerMbl__.prototype.berubah__ = true;


    MarkerMbl__.prototype.hapus = function() {
        this.objlabel.setMap(null);
        this.setMap(null);
        delete this.objlabel;
    };
    MarkerMbl__.prototype.setOpsi = function(obj) {
        var thiscontainer = this,
            thislabel = this.objlabel,
            thismarker = this.thismarker;
        $.each(obj, function(k, nilai) {

            if (k == "yspasi") {
                if (thiscontainer.yspasi != nilai) {
                    thiscontainer.yspasi = nilai;
                    var anchor = thislabel.anchor;
                    anchor.y = -nilai - 2;
                        //= new QMAP__.OMAP__.Point(lebar/2,-yspasi-2);
                    thislabel.set("anchor", anchor);
                }
            }
            if (k == "alarm") thiscontainer.alarm = nilai;
            if (k == "id") thiscontainer.id = nilai;

            if (k == "zIndex") thiscontainer.set("zIndex", nilai);
            //if(k=="text") thiscontainer.set("text",nilai);
            if (k == "visible") thiscontainer.set("visibility", nilai);

            if (k == "ico_url") thismarker.set("icon", nilai);
            if (k == "ico_dot") thismarker.set("anchor", nilai);
            if (k == "position") {
                var oldpos = thismarker.get("coordinate");
                if (!oldpos.equals(nilai)) {
                    thismarker.set("coordinate", nilai);
                    thislabel.set("coordinate", nilai);
                }
            }

        });
        thiscontainer.berubah__ = true;
    };

    //MarkerMbl__.prototype.showlabel = function(visible) {
    //	var thislabel = this.objlabel;
    //	thislabel.set("visibility",visible);
    //};

    MarkerMbl__.prototype.tampilkan__ = function(bmaju) {
        var ishow = M.cekImgPOI__,
            thislabel = this.objlabel;
        if (bmaju) {
            if (bmaju == 1) {
                this.set("zIndex", iLastIxMobil__++);
                thislabel.set("zIndex", iLastIxMobil__);
            } else {
                this.set("zIndex", iLastIxPOI__++);
                thislabel.set("zIndex", iLastIxPOI__);
            }
        }
        this.set("visibility", ishow > 0);
        thislabel.set("visibility", ishow > 1);
    };


}


function load_google_proto__() {

    var xmap = QMAP__.GMAP__;
    var cmap = QMAP__.OMAP__;
    var cmarker = cmap.Marker;
    var emap = cmap.event;

    function setPlacemark__(arr) {
        var sret = "";
        $.each(arr, function() {
            if (this.types[0] == "postal_code" || "Indonesia" == this.long_name) return;
            if (sret.indexOf(this.long_name) == -1) sret += ", " + this.long_name;
        });
        return sret.substr(2);
    }
    var sreversegeo = google.maps.Geocoder;
    Global__.reverseGeoCode__ = function(point, fungsi) {
        sreversegeo.apply(this);

        function baca(respon, sts) {
            var hasil = "";
            var nvalid = -1;
            if (sts == google.maps.GeocoderStatus.OK && respon[0]) {
                hasil = setPlacemark__(respon[0].address_components);
                nvalid = hasil.split(",").length;
            }
            fungsi(hasil, nvalid);
        }
        this.geocode({
            latLng: point
        }, baca);
    };
    reverseGeoCode__.prototype = turunkan__(sreversegeo);


    // KELAS Polyline //
    Global__.Polyline__ = function(map, path, strokeColor, strokeWeight, geodesic) {
        cmap.Polyline.apply(this, [{
            map: map,
            path: path,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight,
            geodesic: geodesic
        }]);
    };
    Polyline__.prototype = turunkan__(cmap.Polyline);

    // KELAS POLIGON //
    var spoligon = cmap.Polygon;
    Global__.Polygon__ = function(geodesic, strokeColor, strokeWeight) {
        spoligon.apply(this, [{
            map: xmap,
            geodesic: geodesic,
            strokeColor: strokeColor,
            strokeWeight: strokeWeight
        }]);
    };
    Polygon__.prototype = turunkan__(spoligon);

    //var iicek = 0;
    // Define the overlay, derived from google.maps.OverlayView
    Global__.Label__ = function(marker) {
        // Initialization
        //this.setValues(opt_options);
        this.set("visible", false);
        //this.setOptions({ visible:false, clickable: true });

        // Label specific
        var span = this.span_ = document.createElement('span');
        span.style.cssText = 'position: relative; left: -50%; top: 6px; white-space: nowrap; ';

        var div = this.div_ = document.createElement('div');
        div.appendChild(span);
        div.style.cssText = 'position: absolute; display: block; cursor: pointer; font-size:12; font-family:arial;'; //  font-size: smaller;

        emap.addDomListener(this.span_, 'click', function() {
            emap.trigger(marker, 'click');
        });
        this.pane_ = null;
    };
    Label__.prototype = new cmap.OverlayView();



    // Implement onAdd
    Label__.prototype.onAdd = function() {
        var pane = this.getPanes().overlayImage;
        if (pane) pane.appendChild(this.div_);
    };

    // Implement onRemove
    Label__.prototype.onRemove = function() {
        var pane = this.div_.parentNode;
        if (pane) pane.removeChild(this.div_);
    };


    // html
    Label__.prototype.setOpsi = function(obj, alarm, spasi, judul) {
        this.setOptions(obj);
        //this.titik	= posisi;
        //this.zindx	= zindx;
        this.spasi = spasi;
        if (judul) this.judul = judul;
        var style1 = "border: 1px solid blue; padding: 2px; font-weight: bold; ",
            bgground = ";background-color:";
        if ((alarm == 1234)) {
            // utk poi //
            bgground += "transparent;";
            style1 = "font-size:larger; color: black; font-weight:bold; padding: 2px;" +
                "text-shadow: -2px 0 #BBFFAA, 0 2px #BBFFAA, 2px 0 #BBFFAA, 0 -2px #BBFFAA; ";
        } else if ((alarm & 1) || (alarm & 2)) bgground += "#FFAAAA"; // SOS atau ALARM
        else if ((alarm & 8) || (alarm & 16)) bgground += "#FFFF80"; // LEPAS atau LOW-BAT
        else if (alarm & 256) bgground += "#DDDDDD"; // OFFLINE
        else if (alarm & 64) bgground += "#BBFFBB"; // ON
        else bgground += "white";
        this.span_.innerHTML = "<span style='" + style1 + bgground + ";'>" + this.judul + "</span>";
    };

    // Implement draw
    Label__.prototype.draw = function() {
        var projection = this.getProjection();
        var position = projection.fromLatLngToDivPixel(this.get('position'));
        var sdiv = this.div_.style;
        sdiv.left = position.x + 'px';
        sdiv.top = this.spasi + position.y + 'px';
        sdiv.zIndex = this.get('zIndex');
        sdiv.display = this.get('visible') ? 'block' : 'none';
    };

    Label__.prototype.tampil = function(tampil) {
        var div = this.div_;
        div.style.display = tampil ? 'block' : 'none';
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    Global__.MarkerStd__ = function(point, visible, id, fklik, fdragend) {
        cmarker.apply(this, [{
            map: xmap,
            position: point,
            visible: visible,
            draggable: (fdragend ? true : false)
        }]);
        this.id = id;

        if (fklik) emap.addListener(this, "click", fklik);
        if (fdragend) emap.addListener(this, "dragend", fdragend);

    };
    MarkerStd__.prototype = turunkan__(cmarker);


    Global__.Marker2__ = function(point, url, anchor, zIndex, visible, judul, alamat, fklik, fdragend) {
        cmarker.apply(this, [{
            map: xmap,
            position: point,
            icon: new cmap.MarkerImage(url, null, null, anchor),
            zIndex: zIndex,
            visible: visible,
            draggable: (fdragend ? true : false)
        }]);
        var ini = this;
        ini.judul = judul;
        ini.alamat = alamat;


        if (fklik) emap.addListener(this, "click", fklik);
        if (fdragend) emap.addListener(this, "dragend", fdragend);
    };
    Marker2__.prototype = turunkan__(cmarker);

    Global__.MarkerMbl__ = function(zindx, point, yspasi, alarm, ico_url, dotx, doty, judul, ket, mobid) {

        // Initialization
        cmarker.apply(this, [{
            map: xmap,
            position: point,
            icon: new cmap.MarkerImage(ico_url, null, null, new QMAP__.OMAP__.Point(dotx, doty)),
            title: judul,
            optimized: false,
            id: 0,
            visible: false,
            clickable: true,
            flat: true,
            zIndex: zindx
        }]);
        var thismarker = this;
        //klik = false;
        thismarker.mobid = mobid;
        thismarker.judul = judul;
        thismarker.alamat = ket;
        thismarker.ico_url = ico_url;
        thismarker.dotx = dotx;
        thismarker.doty = doty;

        var label = thismarker.objlabel = new Label__(thismarker);
        label.setOpsi({
            position: point,
            zIndex: zindx
        }, alarm, yspasi, judul);

        if (mobid) {
            emap.addListener(thismarker, 'click', function() {
                var pos = thismarker.getPosition();
                emap.trigger(xmap, 'click', pos);
            });
        } else {
            emap.addListener(thismarker, "click", function() {
                var oinfow = QMAP__.InfoWindow__;
                var html = '<b>' + judul + '</b><br/>' + ket.replace(/(?:\r\n|\r|\n)/g, '<br />');
                oinfow.buka__(thismarker.getPosition(), html);
                // lupakan fokus //
                oinfow.lastFocus__.mobid = 0;
                sMobFocus__ = "";
                QMAP__.openNumWindow__ = false;
                thismarker.tampilkan__(1);
            });
        }


    };
    //MarkerMbl__.prototype = new cmap.Marker;
    MarkerMbl__.prototype = turunkan__(cmarker);
    MarkerMbl__.prototype.berubah__ = true;

    MarkerMbl__.prototype.hapus = function() {

        this.setMap(null);
        this.objlabel.setMap(null);
        this.objlabel.tampil(false);
        delete this.objlabel;

        // Call parent class method
        //this.constructor.prototype.destroy();
        // If the context of the method is important, you can use Function.call:
        //this.constructor.prototype.destroy.call(this);
    };

    MarkerMbl__.prototype.setOpsi = function(obj, yspasi, alarm, ico_url, dotx, doty) {

        // label OK //
        this.objlabel.setOpsi(obj, alarm, yspasi);
        this.berubah__ = true;

        if (this.ico_url != ico_url || this.dotx != dotx || this.doty != doty) {
            this.ico_url = ico_url;
            this.dotx = dotx;
            this.doty = doty;
            obj.icon = new cmap.MarkerImage(ico_url, null, null, new QMAP__.OMAP__.Point(dotx, doty));
        }
        this.setOptions(obj);
    };


    // kedepan=-1 hide, kedepan=0 normal, kedepan=1 foreground//
    MarkerMbl__.prototype.tampilkan__ = function(kedepan) {
        var ishow, thismarker = this,
            objlabel = this.objlabel,
            mobid = this.mobid;
        var topmarker = false;

        if (kedepan < 0) {
            ishow = -1;
            thismarker.set("visible", false);
            objlabel.set("visible", false);

            // utk mobil
        } else if (mobid) {

            ishow = M.cekImgMobil__;
            if (kedepan === 0) {
                thismarker.set("visible", ishow > 0 || mobid == sMobSelect__);
                objlabel.set("visible", ishow > 1);
            } else {
                topmarker = ishow > 0 || mobid == sMobSelect__;
                thismarker.setOptions({
                    zIndex: iLastIxMobil__++,
                    visible: topmarker
                });
                objlabel.setOptions({
                    zIndex: iLastIxMobil__,
                    visible: ishow > 1
                });
            }

            // utk POI
        } else {

            ishow = M.cekImgPOI__;
            if (kedepan === 0) {
                thismarker.set("visible", ishow > 0);
                objlabel.set("visible", ishow > 1);
            } else {
                topmarker = ishow > 0;
                thismarker.setOptions({
                    zIndex: iLastIxPOI__++,
                    visible: topmarker
                });
                objlabel.setOptions({
                    zIndex: iLastIxPOI__,
                    visible: ishow > 1
                });
            }

        }
        if (topmarker) {
            thismarker.setMap(xmap);
        }

        // utk label //
        if (ishow > 1) {
            if (thismarker.berubah__ || kedepan > 0) {
                objlabel.setMap(xmap);
                thismarker.berubah__ = false;
            } else {
                objlabel.tampil(true);
            }
        } else {
            objlabel.tampil(false);
        }
    };



}

