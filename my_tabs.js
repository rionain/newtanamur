


var myTabs__ = false;
jQuery.fn.minitabs__ = function(pages, npage) {
    // CATAT THIS //
    myTabs__ = this;
    // CATAT ALAMAT KOSONG //
    myTabs__.alamatnya__ = [];
    // CATAT AUTONUMBER //
    myTabs__.icount = 0;
    // CATAT TGL //
    myTabs__.stgl = "";
    // CATAT MOBIL //
    myTabs__.smob = "";
    // SEDANG BACA POSISI TERAKHIR //
    myTabs__.bReadingLastPos__ = (new Date(0)).valueOf();
    myTabs__.FMT = 0;

    // PAGES WORK //
    myTabs__.checkPages__ = function() {

        // tooltip tidak perlu // 
        $('#tips').hide();

        oPrinter__.check__();
        var oselmob = M.objLstMob__;
        oselmob.attr("multiple", "");
        var tabref = myTabs__.sref;
        var btampilkan = (tabref == 'idMainMap__') ? "" : "none";
        $("#ctrl01Route__").css({
            display: btampilkan
        });
        $("#ctrl02Route__").css({
            display: btampilkan
        });

        // 
        if (window.chrome) {
            if (QMAP__.InfoWindow__) QMAP__.InfoWindow__.tutup__();
        }

        var btogle = 0,
            iload = M.loading__;
        switch (tabref) {
            case 'idMainMap__':
                btogle = 1;
                if (QMAP__.GMAP__) {
                    // sub menu map //
                    var ibox = menubox__.iBox__;
                    if (ibox > 0) {

                        QMAP__.openNumWindow__ = false;
                        switch (ibox) {
                            case 1:
                                $("#boxpoi__").show();
                                //QMAP__.InfoWindow__.open(QMAP__.GMAP__);
                                break;
                            default:
                                $("#boxgeo__").show();
                        }

                    } else if (iload > 0 && M.accesscode__ == "~") {
                        // fajar perdana tidak perlu menu titik //
                        if (W.indexOf("Fajar") !== 0) {
                            //$("#liMap__>ul").slideDown(900); 
                            $("#ulMap__").show();
                            ++liMapWait__;
                        }
                    }

                    TrackCache__.showPolyline__('CENTER');
                    var oneday = TrackCache__.TcItems__[M.pilihStrTgl__];
                    if (oneday) {
                        M.showInfoTitik__(oneday.nTitik__);
                        //if (oneday.masihada__) M.timerWebData__(1000);
                    }
                    QMAP__.map_refresh__(100);
                    M.timerWebData__(3000);

                }
                break;
            case 'idMobPosisi__':
                btogle = 1;
                myTabs__.mobPosisi(1);
                break;

            case 'idMobTerakhir__':
                btogle = 1;
                cls_enter(2, sMobSelect__, 0);
                myTabs__.mobTerakhir(1);
                break;

                // kamera //
            case 'idMobKamera__':
                oKamera__.tampil__();
                break;

            case 'idMobKode__':
                oMobKode__.restore__();
                break;
            case 'idMobReport__':
                if (iload < 1) {
                    $("#tblMobReport__").hide();
                } else {
                    if (!sMobSelect__) {
                        if (ListMobil__.size > 0) {
                            sMobSelect__ = sMobFocus__ = ListMobil__.id[0];
                            M.objLstMob__.val(sMobSelect__);
                        }
                    }
                    M.mobchange__();
                    $("#tblMobReport__").show();
                }
                break;
            case 'idChangePwd__':
                //$("#idChangePwd__").css("height", "100%");
                oChangePwd__.restore__();
                break;
            case 'idMUser__':
                if (iload < 1) {
                    $("#tblMUser__").hide();
                } else {
                    oselmob.attr("multiple", "multiple");
                    $("#tblMUser__").show();
                    oUsr.bacauser__("");
                }
                break;
        }

        // $("#toglepanel__").css("visibility", btogle?"visible":"hidden" );
        M.cekTogle__();

    };

    // SETEL PAGES //
    var spage = "eq(" + npage + ")";
    $(pages + ">*").hide();
    myTabs__.pref = $(pages + ">DIV:" + spage);
    myTabs__.sref = myTabs__.pref.attr('id');
    myTabs__.pref.show();
    // SETEL MENU //
    var id = "#" + this.attr('id');
    $(id + ">LI>A").removeClass("current");
    $(id + ">LI>A:" + spage).addClass("current");
    $(id + ">LI>A").click(
        function() {
            var re = /([_\-\w]+$)/i;
            var sref = re.exec(this.href)[1];
            if (myTabs__.sref === sref) {
                return false;
            }
            myTabs__.sref = sref;
            $(id + ">LI>A").removeClass("current");
            $(this).addClass("current");
            $(this).blur();
            $(pages + ">*").hide();
            myTabs__.pref = $(pages + '>#' + sref);
            myTabs__.pref.show();
            myTabs__.checkPages__();
            return false;
        }
    );
    // ACTIVATE //
    this.mobPosisi = function(bread) {
        if (myTabs__.sref !== "idMobPosisi__") {
            return;
        }

        // by adi //
        //myTabs__.pref.html("");
        $("#idMobPosisi__").html("");

        if (M.loading__ < 1) return;

        var oneday = TrackCache__.getItem__(M.pilihStrTgl__);
        if (!oneday) {
            if (bread) M.timerWebData__(3000);
            return;
        }


        var nrow = oneday.showMobPosition__();

        // CEK ALAMAT //
        myTabs__.alamatget__("idMobPosisi__", ++myTabs__.icount);
        // jika <=0 berarti blm baca rute //
        if (nrow <= 0) {
            if (bread) M.timerWebData__(3000);
        }
    };

    // ACTIVATE //
    this.mobTerakhir = function(force) {
        if (M.loading__ < 0) return myTabs__.showMobTerakhir__([""]);
        var inow = (new Date()).valueOf();
        //if (!force && inow - myTabs__.bReadingLastPos__ < 60000) return;
        myTabs__.bReadingLastPos__ = inow + 120000;
        myTabs__.showMobTerakhir__([]);

        var req = N._EH(M.object2string__({
            cid: M.companyid__,
            u: M.username__,
            uid: M.userID__,
            W: W,
            fmt: myTabs__.FMT,
            fc: (M.wfilter__ ? M.filtercode__ : "")
        }));
        $.JP({

            url: M.urlCallBack__(M.debug__ > -1 ? M.lok_lastpos__ : (M.debug__ == -1 ? M.lok_app__ : "")),

            
            data: {
                fused: N(M.lok_lastpos__),
                req: req
            },
            success: function(dat) {
                myTabs__.bReadingLastPos__ = (new Date()).valueOf();
                myTabs__.showMobTerakhir__(dat);
                if (dat.length > 1) {
                    cls_enter(2, sMobSelect__, force ? 0 : null);
                    if (myTabs__.sref == "idMobTerakhir__") {
                        myTabs__.alamatget__("idMobTerakhir__", ++myTabs__.icount);
                    }
                }
            },
            error: function() {
                return myTabs__.showMobTerakhir__([M.bad_connection__]);
            }
        });

    };

    // BACA ALAMAT //
    this.alamatget__ = function(snama, isign) {
        if (isign !== myTabs__.icount || snama !== myTabs__.sref) {
            return;
        }

        var ilatlon = false;
        var objantri = myTabs__.alamatnya__.shift();
        if (objantri && (ilatlon = objantri[0])) {
            // var ilatlon = objantri[1];
            var lokasi, point = objantri[1],
                dest = $("#NO" + snama + ilatlon);
            //var slatlon = "lat:"+point.lat()+", lon:"+point.lng().toFixed(5)+"<br/>";
            // CEK APAKAH LOKASI SUDAH ADA // 
            if (typeof(lokasi = objGeoLokasi__.allAddress__[ilatlon]) == "number") {
                var alamatnya = objGeoLokasi__.realAddress__[lokasi];
                //dest.html(slatlon+alamatnya);
                dest.html(alamatnya);
                myTabs__.alamatget__(snama, isign);
            } else {
                //dest.html("<blink>"+slatlon+"</blink>"+M.imgProgress__);
                dest.html(M.imgProgress__);
                setTimeout(
                    function() {
                        objGeoLokasi__.baca(point, function(resp) {
                            //dest.html(slatlon+resp);
                            dest.html(resp);
                            myTabs__.alamatget__(snama, isign);
                        }, "", ilatlon);
                    }, 1000);
            }
        }
    };

    this.trgSorotMobil__ = function() {
        $(".cekmob__").click(function() {
            var me = this;
            var aid = this.id.split("_", 2);
            if (aid.length > 1) {
                sMobSelect__ = sMobFocus__ = '!'; // hrs dialihkan sementara //
                M.objLstMob__.val(aid[1]).change();
                setTimeout(function() {
                    set_focus(me);
                }, 100);
            }
            return false;
        });
    };

    // TAMPILKAN POSISI TERAKHIR //
    this.showMobTerakhir__ = function(items) {
        if (M.wfilter__) return this.showCarTerakhir__(items);
        var sret, ilen = items.length;


        if (ilen <= 0) sret = "<tr><td align=center> sedang membaca posisi mutakhir:&nbsp;" + M.imgProgress__ + "</td></tr>";
        else if (ilen == 1) sret = "";
        else {

            // clear pencarian alamat //
            while (myTabs__.alamatnya__[0]) myTabs__.alamatnya__.pop();

            sret = "<tr valign=top style='color:#0000CC; font-weight:bold;' class='bgcolor2' ><td NOWRAP>&nbsp;No.&nbsp;</td>" +
                "<td width=150 NOWRAP> &nbsp; &nbsp;Armada </td>" +
                "<td width=140 NOWRAP> &nbsp; &nbsp;Waktu (WIB) </td>" +
                "<td> &nbsp; &nbsp;Status </td><td> &nbsp; &nbsp;Lokasi</td>" +
                "</tr>";

            var ilatlon = 0,
                mid, mix, mobkode, mobket, scolor, item, d1time, d2time, nalarm, sinfo, ienvire;
            for (var i = 1; i < ilen; i++) {
                item = items[i];
                mobkode = item[0].htmlEncode();
                mobket = item[21].htmlEncode();
                d1time = item[1];
                d2time = item[13];
                ienvire = parseInt(item[14]);

                // buang bit 8 dan bit 10 //
                //nalarm = 255 & item[6];
                nalarm = ~(1 << 8) & ~(1 << 10) & item[6];

                sinfo = M.bacaMesin__(nalarm, ienvire) + M.baca02Status__(nalarm, true, ienvire);
                mid = item[8]; // mobil_id
                if ((mix = ListMobil__.id.indexOf(mid)) >= 0) {
                    // sinfo	+= M.bacaFuel__( parseInt(item[11]),  mix );
                    sinfo += M.bacaSuhu__(parseInt(item[12]), mix);
                }
                sinfo += "<br/> &nbsp; &nbsp;" + Math.round(1.00 * item[4] / 100) + " km/h";


                var flat = parseFloat(item[2]);
                var flon = parseFloat(item[3]);
                var obdii = getOBD__(item[23]);
                var slatlon = "lat:" + flat + ", lon:" + flon + obdii + "<br/> &nbsp; &nbsp;";

                // baca alamat //
                var alamat = M.jarakTerdekat__(flat, flon, menubox__.MyPoiArr__, 120);
                if (!alamat) alamat = item[7];
                if (alamat.length < 3) {
                    if (typeof(alamat = objGeoLokasi__.orgAddress__[item[22]]) == "undefined") {
                        ilatlon = M.llKonversi__.ll2int(flat, flon);
                        // BACA OBJECT //
                        var lokasi = objGeoLokasi__.allAddress__[ilatlon];
                        if (typeof(lokasi) == "number") {
                            alamat = objGeoLokasi__.realAddress__[lokasi];
                        } else {
                            alamat = "<span id=NO" + "idMobTerakhir__" + ilatlon + "></span>";
                            var point = new QMAP__.OMAP__.LatLng(flat, flon);
                            myTabs__.alamatnya__.push([ilatlon, point, alamat]);
                        }
                    }
                }
                //alamat = slatlon+alamat;
                alamat = alamat;
                if (d1time < d2time) {
                    d1time += "<br/> &nbsp; &nbsp;<span  class='showtip' style='color:#990000;' tooltip='sinyal gps tanpa koordinat'>" + d2time + "</span>";
                }
				//
				arrmob = mobket.split("#");
				if( arrmob.length>2 ) {
					mobket = arrmob[0]+"#"+arrmob[1] +"<br/>#"+ arrmob.slice(2).join('#');
				}
				
                var clrowmob = "clsmob_" + item[8];
                var idcekmob = "cekmob_" + item[8];
                scolor = (i % 2 === 0) ? "white" : M.my01Color__;
                sret += "<tr class='" + clrowmob + "' valign=top bgcolor='" + scolor + "'><td NOWRAP > " + i + " </td><td NOWRAP> &nbsp; &nbsp;" +
                    "<a oldkolor='" + scolor + "' class='cekmob__' id='" + idcekmob + "' href='#'>" + mobkode + "</a><br/> &nbsp; &nbsp;" +
                    mobket + "</td><td NOWRAP> &nbsp; &nbsp;" + d1time + "</td><td NOWRAP> &nbsp; &nbsp;" +
                    sinfo + " </td><td align=left > &nbsp; &nbsp;" + slatlon + alamat + "</td></tr>";
            }
        }

        var tblmain1 = "<table border=0 cellspacing=0 cellpadding=2 style='width:100%; border-style: solid; border-width: 1px; padding-left: 4px; padding-right: 4px; padding-top: 1px; padding-bottom: 1px'>" +
            sret + "</table>";

        if (ilen > 0) {
            var ainfo = items[0];
            var isobj = typeof(ainfo) == "object";
            $("#lastposwait__").hide();
            $("#last_pos").html("Posisi mutakhir ( " + (isobj ? ainfo[0] : ainfo) + " WIB ) ");
            $("#divlastpostitle__").show();
            if (ilen > 1) {
                $("#lastpospage__").html(tblmain1);
                myTabs__.trgSorotMobil__();
                if (isobj) myTabs__.FMT = ainfo[1];
                M.load_tips__(".showtip");
            }
        } else {
            $("#divlastpostitle__").hide();
            $("#lastposwait__").html(tblmain1).show();
        }
    };


    // TAMPILKAN POSISI mutakhir //
    this.showCarTerakhir__ = function(items) {
        var sret, ilen = items.length;

        if (ilen <= 0) sret = "<tr><td align=center> sedang membaca posisi mutakhir:&nbsp;" + M.imgProgress__ + "</td></tr>";
        else if (ilen == 1) sret = "";
        else {

            // clear pencarian alamat //
            while (myTabs__.alamatnya__[0]) myTabs__.alamatnya__.pop();

            sret = "<tr valign=top style='color:#0000CC; font-weight:bold' class='bgcolor2' ><td NOWRAP> No. </td>" +
                "<td width=200 NOWRAP> &nbsp;Marketing,Sales,Customer </td>" +
                "<td width=200 NOWRAP> &nbsp;Showroom,Merek,Tipe </td>" +
                "<td width=200 NOWRAP style='font-size:smaller;'> &nbsp;Armada,Waktu(WIB)</td>" +
                "<td> &nbsp;Lokasi </td>" +
                "</tr>";

            var ilatlon = 0,
                mid, mix, mobkode, scolor, item, d1time, d2time, nalarm, sinfo, ienvire;
            for (var i = 1; i < ilen; i++) {
                item = items[i];
                mobkode = item[0].htmlEncode();
                d1time = item[1];
                d2time = item[13];
                ienvire = parseInt(item[14]);

                // buang bit 8 dan bit 10 //
                //nalarm = 255 & item[6];
                nalarm = ~(1 << 8) & ~(1 << 10) & item[6];

                sinfo = M.bacaMesin__(nalarm, ienvire, item[4]) + M.baca02Status__(nalarm, true, ienvire);
                mid = item[8]; // mobil_id
                if ((mix = ListMobil__.id.indexOf(mid)) >= 0) {
                    sinfo += M.bacaSuhu__(parseInt(item[12]), mix);
                }

                var flat = parseFloat(item[2]);
                var flon = parseFloat(item[3]);
                //var obdii = getOBD__(item[23]);
                //var slatlon = "lat:"+flat+", lon:"+flon+obdii + "<br/> &nbsp;";

                // baca alamat //
                var alamat = M.jarakTerdekat__(flat, flon, menubox__.MyPoiArr__, 120);
                if (!alamat) alamat = item[7];
                if (alamat.length < 3) {

                    if (typeof(alamat = objGeoLokasi__.orgAddress__[item[22]]) == "undefined") {
                        ilatlon = M.llKonversi__.ll2int(flat, flon);
                        // BACA OBJECT //
                        var lokasi = objGeoLokasi__.allAddress__[ilatlon];
                        if (lokasi >= 0) {
                            alamat = objGeoLokasi__.realAddress__[lokasi];
                        } else {
                            alamat = "<span id=NO" + "idMobTerakhir__" + ilatlon + " ></span>";
                            var point = new QMAP__.OMAP__.LatLng(flat, flon);
                            myTabs__.alamatnya__.push([ilatlon, point, alamat]);
                        }
                    }
                }
                if (d1time < d2time) {
                    d1time += "<br/> &nbsp;<span  class='showtip' style='color:#990000;' tooltip='sinyal gps tanpa koordinat'>" + d2time + "</span>";
                }
                var clrowmob = "clsmob_" + item[8];
                var idcekmob = "cekmob_" + item[8];
                scolor = (i % 2 === 0) ? "white" : M.my01Color__;
                sret += "<tr class='" + clrowmob + "' valign=top bgcolor='" + scolor + "'><td NOWRAP> " + i + " </td><td NOWRAP> &nbsp;" +
                    item[15] + "<br/> &nbsp;" + item[16] + "<br/> &nbsp;" + item[17] +
                    " </td><td NOWRAP> &nbsp;" +
                    item[18] + "<br/> &nbsp;" + item[19] + "<br/> &nbsp;" + item[20] +
                    " </td><td NOWRAP> &nbsp;" +
                    "<a oldkolor='" + scolor + "' class='cekmob__' id='" + idcekmob + "' href='#'>" + mobkode + "</a><br/> &nbsp;" +
                    sinfo + "<br/> &nbsp;" + d1time +
                    " </td><td align=left>" + alamat + "</td></tr>";
            }
        }

        var tblmain1 = "<table border=0 cellspacing=0 cellpadding=2 style='width:100%; border-style: solid; border-width: 1px; padding-left: 4px; padding-right: 4px; padding-top: 1px; padding-bottom: 1px'>" +
            sret + "</table>";

        if (ilen > 0) {
            var ainfo = items[0];
            var isobj = typeof(ainfo) == "object";
            $("#lastposwait__").hide();
            $("#last_pos").html("Posisi mutakhir ( " + (isobj ? ainfo[0] : ainfo) + " WIB ) ");
            $("#divlastpostitle__").show();
            if (ilen > 1) {
                $("#lastpospage__").html(tblmain1);
                myTabs__.trgSorotMobil__();
                if (isobj) myTabs__.FMT = ainfo[1];
                M.load_tips__(".showtip");
            }
        } else {
            $("#divlastpostitle__").hide();
            $("#lastposwait__").html(tblmain1).show();
        }
    };


};


