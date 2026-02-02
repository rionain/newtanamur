
var autoRead__ = true, // utk debug
    sMobFocus__ = "", // id, mobil yg diklik  
    sMobSelect__ = "", // id, mobil yg disorot listbox
    sOldSelect__ = "", // id, mobil yg disorot SEBELUMNYA
    bMobUsrAgent = navigator.userAgent.indexOf(' Mobile') > 0;

$.ajaxSetup({ cache: false }); // or iPhones don't get fresh data

// IPS = IP.substr(11);
var M = {
    dbg: function (msg) {
        var $d = $("#dbg_msg");
        if (!$d.length) {
            $d = $('<div id="dbg_msg" style="position:fixed;bottom:0;right:0;background:rgba(0,0,0,0.7);color:lime;z-index:999999;font-family:monospace;padding:5px;max-height:200px;overflow:auto;pointer-events:none;font-size:10px;"></div>').appendTo("body");
        }
        $d.append("<div>" + new Date().toLocaleTimeString() + ": " + msg + "</div>");
        console.log("DEBUG: " + msg);
        $d.scrollTop($d[0].scrollHeight);
    },
};
window.onerror = function (msg, url, line) {
    if (typeof M !== 'undefined' && M.dbg) M.dbg("CRITICAL ERROR: " + msg + " (line " + line + ")");
};
M = $.extend(M, {
    bad_connection__: "internet tersendat.",
    bad2connection__: "tersendat.",
    lokasi__: location,
    debug__: DEBUG,
    fused__: "fused",
    loading__: -4,
    username__: "",
    userID__: 0,
    companyid__: "",
    accesscode__: "",
    filtercode__: "",
    runtext__: "",
    pilihTgl__: ((typeof (GO) == "number") ? new Date(GO) : new Date()),
    pilihStrTgl__: "",
    malamStrTgl__: "",
    serverdata__: "",
    tdInfo__: null,
    td2Info__: null,
    lastDateNumber__: "",
    imgProgress__: "<img src='" + IP.concat("/img.tracker/progress_bar3.gif") + "'>",
    img2Progress__: "<img style='width:70' src='" + IP.concat("/img.tracker/progress_bar3.gif") + "'>",
    lok_frame__: (DEBUG < 0 ? "f1r2a3m4e5app.6p7h8p" : "f1r2a3m4e5.6p7h8p").replace(/\d/gi, ""),
    picker__: 0,
    btnmobcolor__: 0,
    ufilter__: 0,
    wfilter__: typeof (CFILTER) == "string" ? CFILTER : "",
    // POI, PENANDA LOKASI 

    cekImgPOI__: 1,
    // LABEL utk armada

    cekImgMobil__: 2,
    // RUTE //

    savememori__: true,
    dleftsize: 1,
    drightsize__: 0,
    dbottomsize__: 0,


    xloadcookie__: 0,
    go: $(function () {

        // https://gpskita.net/go/web.php/get.image/web_get02Image.php
        // http://gpskita.com/frame/web.php/get.image/web_get02Image.php
        // https://geoprimatrack.id/go/web.php/get.image/web_get02Image.php
        // if( location.protocol=='https:') {
        // 	M.getMobilImage__ = "htt".concat("ps://gpsk","ita.net/fr","ame/web.p","hp/get.ima","ge/web_get02I","mage.php");
        // } else {
        // 	M.getMobilImage__ = "htt".concat("p://gpsk","ita.com/fr","ame/web.p","hp/get.ima","ge/web_get02I","mage.php");
        // }
        // M.getMobilImage__ = location.protocol.concat("//geopri","matrack.id/go/web.php/get.image/web_get0","2Image.php");
        M.getMobilImage__ = "./tracker.link/web_get02Image.php";


        // tgl utk report //
        var today = (new Date()).dVal().valueOf(),
            msday = 86400000;
        M.rpt01tgl__ = new Date(today - msday * 2);
        M.rpt02tgl__ = new Date(today + msday - 1000);

        if (M.loading__ > -4) return;
        M.loading__ = -3;
        $.JP.setup({
            timeout: 35000
        });

        // screen // 
        if (M.lokasi__.href.indexOf("http") !== 0) {
            document.write("");
            return;
        }

        //M.loadcookie__();
        M.xloadcookie__ = QMAP__.llRead__();
        setTimeout(function () {
            M.load_body__(0);
        }, 100);


    }),




    urlCallBack__: function (url, dat) {
        return M.serverdata__ + url + "?callback=?" + (dat === undefined ? "" : dat);
    },


    addslash__: function (str) {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    },


    object2string__: function (obj) {
        return JSON.stringify(obj);
    },

    my01Color__: "#FFFFFF",

    sTglBlank__: [],
    // , getMobilImage__: IP.concat("/web_get02Image.php")

    // dummy value //
    // http://localhost/tanamur/tracker.link/PROXY.YES/web.php/get.image/web_get02Image.php //
    getMobilImage__: "",


    strequals__: function (s1, s2) {
        if (s1 === null || s2 === null) return s1 === s2;
        return (s1.toString() == s2.toString());
    },
    rad__: function (x) {
        return x * Math.PI / 180;
    },
    distHaversine__: function (p1, p2) {
        var lat1 = p1.lat(),
            lon1 = p1.lng(),
            lat2 = p2.lat(),
            lon2 = p2.lng();
        return M.jarak__(lat1, lon1, lat2, lon2);
    },
    jarak__: function (lat1, lon1, lat2, lon2) {
        var R = 6371000;
        var dLat = M.rad__(lat2 - lat1);
        var dLong = M.rad__(lon2 - lon1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(M.rad__(lat1)) * Math.cos(M.rad__(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    },
    jarakTerdekat__: function (lat, lon, adat, imax) {
        var oldmeter = 999999,
            idx = -1,
            newmeter, opos;
        $.each(adat, function (i, obj) {
            opos = obj.getPosition();
            newmeter = M.jarak__(lat, lon, opos.lat(), opos.lng());
            if (oldmeter > newmeter) {
                oldmeter = newmeter;
                idx = i;
            }
        });
        if (oldmeter > imax) return 0;
        var marker = adat[idx];
        return '<b>' + marker.judul + '</b> &nbsp;' + marker.alamat;
    },
    load_tips__: function (ctagid) {
        $(ctagid).bind('mouseenter mouseover mouseout', function (o) {
            var obj = o.currentTarget,
                out = o.type.toString() == "mouseout";
            obj.style.backgroundColor = out ? '' : 'yellow';
            if (out) return $('#tips').hide();
            var tip = obj.tooltip;
            if (!tip) tip = obj.attributes["tooltip"].value;
            var left = o.pageX - (o.pageX < 400 ? 0 : 60);
            var top = o.pageY + (o.pageY < 300 ? 30 : -60);
            $('#tips').css({
                display: "",
                top: top,
                left: left
            }).html(tip);
        });
    },
    objLstMob__: false,
    load_body__: function (ibody) {
        /*
                if(ibody==0) {
                    // tunggu 57 detik, jik gagal, ulangi lagi //
                    M.loading__ = -2;
                    var tiket = ++M.mobTaskId__;
                    setTimeout(function () { 
                        if( tiket==M.mobTaskId__ && M.loading__<-1 ) {
                            docId("body").innerHTML = "<H2>"+M.bad_connection__+"</H2>";
                            M.load_body__(0);
                        }
                    }, 49000);
                }

        */

        //alert(ibody);

        var pos = N._EH(M.object2string__({
            x: Math.pow(100, ibody),
            chk_all_session: ibody,
            D: M.debug__
        }));
        $.ajax({

            url: (M.debug__ > -1 ? M.lok_frame__ : (M.debug__ == -1 ? M.lok_app__ : "./")), // lokasi web //

            cache: false, // by adi, sementara //
            headers: { "cache-control": "no-cache" },

            type: "POST",
            timeout: 30000,
            data: {
                fused: N("frame.php"),
                pos: pos
            },
            success: function (dat) {
                M.dbg("load_body(" + ibody + ") success. data length=" + (dat ? dat.length : 0));
                if (ibody == 1) {
                    var nologon = true;
                    try {
                        var odat = eval("(" + N._DH(dat) + ")");
                        M.serverdata__ = odat.root;
                        M.lok_gettbl__ = odat.read_tbl;
                        M.lok_changepwd__ = odat.change_pwd;
                        M.lok_changemob__ = odat.change_mob;
                        M.lok_changeusr__ = odat.change_usr;
                        M.lok_logon__ = odat.login;
                        M.lok_master__ = odat.tbl_master;
                        M.lok_lastpos__ = odat.lastpos;
                        M.lok_addrget__ = odat.addressget;
                        M.lok_addrset__ = odat.addressset;
                        M.lok_webreport__ = odat.webreport;
                        M.ufilter__ = parseInt(odat.filter);

                        M.lok_app__ = odat.fileapp;
                        if (typeof (MULAI) != "boolean" && W != "mycar" &&
                            (odat.u !== undefined && odat.cid !== undefined &&
                                odat.ac !== undefined && odat.rt !== undefined)) {
                            var userid = odat.uid ? parseInt(odat.uid) : 0;
                            M.session_check__(false, [".", odat.u, odat.cid, odat.ac, odat.rt, M.ufilter__, userid]);
                            nologon = false;
                        }
                    } catch (e) { }
                    if (nologon) {
                        M.username__ = "";
                    }
                    var skol = $('body').css('background-color');
                    if (skol) M.my01Color__ = M.bacaswarna__(skol);
                } else {
                    var ctn = ibody === 0 ? $('#body') : $(".mainpanel__");
                    var ss1 = N._DB(dat, 400);
                    if (ss1 === null) {
                        //--ibody;
                        // M.load_body__(ibody);
                        setTimeout(function () {
                            M.load_body__(ibody);
                        }, 3000);
                        return;
                    } else {
                        //var sscek = ss1.substr(-200);
                        //alert(sscek);
                        var isi = ss1.replace(/http\:\/\/my.image.root/g, IP).replace(/\{domain\}/g, W);
                        if (W == "Geoprima Tracker" || W == "localhost") {
                            isi = isi.replace(/id.web.istana.gps/g, "com.geoprimatrack");
                        }
                        //var isi = ss1.replace(/my.image.root/g, IPS).replace(/\{domain\}/g, W);
                        var slogo1 = '', slogo2 = '';
                        if (typeof (LOGO) == 'string' && LOGO) {
                            slogo1 = '<img style="width:125" src="' + LOGO + '" />';
                            slogo2 = '<img src="' + LOGO + '" />';
                        }
                        isi = isi.replace(/\{logo01\}/g, slogo1).replace(/\{logo02\}/g, slogo2);
                        ctn.html(isi);
                    }
                }
                setTimeout(function () {
                    if (ibody < 2) {
                        // M.load_body__(ibody + 1);
                        setTimeout(function () {
                            M.load_body__(ibody + 1);
                        }, 500);
                        return;
                    }

                    if (M.wfilter__) {
                        //alert(N._DH(M.wfilter__));


                        var ofilter = M.cook__.read__("FILTER");
                        M.filtercode__ = (ofilter && ofilter.filter !== undefined) ? ofilter.filter : "";
                        var arfilter = M.filtercode__.split("<[~]>");
                        var alen = arfilter.length;
                        for (var i = 0; i < alen; i++) {
                            var kata = arfilter[i];
                            switch (i) {
                                case 0:
                                    $("#filt_markt").val(kata);
                                    break;
                                case 1:
                                    $("#filt_sales").val(kata);
                                    break;
                                case 2:
                                    $("#filt_custm").val(kata);
                                    break;
                                case 3:
                                    $("#filt_showr").val(kata);
                                    break;
                                case 4:
                                    $("#filt_merek").val(kata);
                                    break;
                                case 5:
                                    $("#filt_tipes").val(kata);
                                    break;
                                case 6:
                                    $("#filt_kodes").val(kata);
                                    break;
                            }
                        }
                    }

                    M.objLstMob__ = $("#selectIdMobil__");

                    //$("#mylogof__").click(function () { M.show_logon__(); });
                    $("#myuser__").click(function () {
                        if (W != "mycar") {
                            M.show_logon__();
                        }
                    });

                    $("#logon_demo__").click(function () {
                        var s = "d1e2m3o".replace(/\d/gi, "");
                        M.do_logon__(s, s, s, 0);
                    });

                    var objmine = M.cook__.read__("MINE");
                    $('#savelogon__').attr("checked", objmine && objmine.o !== undefined);

                    // multi user //
                    oUsr.load__();

                    menubox__.load__();


                    // bacaposisi terakhir //
                    $("#last_pos").click(function () {
                        myTabs__.mobTerakhir();
                    });

                    // history bb & suhu
                    $("#cekhistori__").click(function () {
                        oMobKode__.restore__("history");
                    });

                    $("#tgl1__").val(M.rpt01tgl__.ymdhms()).blur(function () {
                        var tgl = this.value.toDateTime(M.rpt01tgl__),
                            rptval = $("#rptjenis__").val();
                        if (rptval == "rekap" || rptval == "harian_rekap") {
                            var num = tgl.getTime();
                            tgl.setTime(num -= num % 86400000);
                            this.value = tgl.ss();
                        } else {
                            this.value = tgl.ymdhms();
                        }
                        M.rpt01tgl__ = tgl;
                    });

                    $("#tgl2__").val(M.rpt02tgl__.ymdhms()).blur(function () {
                        var tgl = this.value.toDateTime(M.rpt02tgl__),
                            rptval = $("#rptjenis__").val();
                        if (rptval == "rekap" || rptval == "harian_rekap") {
                            var num = tgl.getTime();
                            tgl.setTime(num -= num % 86400000);
                            this.value = tgl.ss();
                        } else {
                            this.value = tgl.ymdhms();
                        }
                        M.rpt02tgl__ = tgl;
                    });

                    // this.value.toDateTime(M.rpt01tgl__)
                    var rptsisa01, rptsisa02, rpttimeold = true;
                    $("#rptjenis__").change(function () {
                        var tgl01, tgl02, num01, num02, rptval = this.value,
                            obj01 = $("#tgl1__"),
                            obj02 = $("#tgl2__");
                        var rpttimenew = (rptval != "rekap" && rptval != "harian_rekap");
                        if (rpttimeold != rpttimenew) {
                            rpttimeold = rpttimenew;
                            tgl01 = obj01.val().toDateTime(M.rpt01tgl__);
                            tgl02 = obj02.val().toDateTime(M.rpt02tgl__);
                            num01 = tgl01.getTime();
                            num02 = tgl02.getTime();
                            if (rpttimenew) {
                                // pulihkan //
                                tgl01.setTime(num01 += rptsisa01);
                                tgl02.setTime(num02 += rptsisa02);
                                obj01.val(tgl01.ymdhms());
                                obj02.val(tgl02.ymdhms());
                            } else {
                                // catat //
                                rptsisa01 = num01 % 86400000;
                                rptsisa02 = num02 % 86400000;
                                tgl01.setTime(num01 -= rptsisa01);
                                tgl02.setTime(num02 -= rptsisa02);
                                obj01.val(tgl01.ss());
                                obj02.val(tgl02.ss());
                            }
                            M.rpt01tgl__ = tgl01;
                            M.rpt02tgl__ = tgl02;
                        }
                        //setTimeout(function () {
                        //    $("#tgl1__").blur();
                        //    $("#tgl2__").blur();
                        //	// $("#trRptFormat__").css({ display: ( rptval=="history" ? "none":"") });
                        //}, 10);
                    });

                    // report, rekap //
                    $("#rkpshow__").click(function () {
                        oMobKode__.showreport__();
                    });

                    // SetArmada__ //
                    $("#SetArmada__").click(function () {
                        oMobKode__.change__();
                    });

                    // ganti password //
                    $("#SetPassword__").click(function () {
                        oChangePwd__.changepass__();
                    });

                    /*
                    $('[tooltip]').bind('mouseenter mouseover mouseout', function (o) {
                        var obj = o.currentTarget, out = o.type.toString() == "mouseout";
                        obj.style.backgroundColor = out ? '' : 'yellow';
                        if (out) return $('#tips').hide();
                        var tip = obj.tooltip;
                        if (!tip) tip = obj.attributes["tooltip"].value;
                        var left = o.pageX - (o.pageX < 400 ? 0 : 60);
                        var top =  o.pageY + (o.pageY < 300 ? 30 : -60); ;
                        $('#tips').css({ display: "", top: top, left: left }).html(tip);
                    });
                    */
                    M.load_tips__('[tooltip]');



                    $('[menutip]').bind('mouseenter mouseover mouseout', function (o) {
                        var sevent = o.type.toString();

                        var obj = o.currentTarget,
                            out = sevent == "mouseout";
                        if (out) return $('#tips').hide();

                        // tidak perlu muncul tooltip
                        var href = obj.href ? obj.href : obj.attributes["href"].value;
                        var sref = myTabs__.sref;
                        if (href.indexOf("#" + sref) >= 0) return;

                        var tip = obj.menutip ? obj.menutip : obj.attributes["menutip"].value;

                        // var left = o.pageX - (o.pageX < 400 ? 0 : 70);

                        var left = o.pageX - (o.pageX < 400 ? 0 : 60);
                        var top = o.pageY + (o.pageY < 300 ? 30 : -60);

                        $('#tips').css({
                            display: "",
                            top: top,
                            left: left
                        }).html(tip);
                    });

                    $.tgl1 = new DateInput("#id1tanggal__");
                    $.tgl2 = new DateInput("#id2tanggal__");
                    //$.tgl = $.tgl1;


                    $('.txttanggal__').bind('change', function () {
                        M.DateWrite__();
                    });

                    // paksa //
                    $('.txttanggal__').bind('click', function () {
                        M.getObjTgl__().show();
                    });


                    M.btnmobcolor__ = document.getElementById('colnew__');
                    M.picker__ = new jscolor(M.btnmobcolor__, {
                        valueElement: null,
                        position: 'right'
                    });
                    M.btnmobcolor__.onclick = function () {
                        M.picker__.show();
                    };
                    M.btnmobcolor__.onblur = function () {
                        var xwarna = M.picker__.toString();
                        $("#mobcolr__").val(parseInt(xwarna.substr(0, 2), 16));
                        $("#mobcolg__").val(parseInt(xwarna.substr(2, 2), 16));
                        $("#mobcolb__").val(parseInt(xwarna.substr(4, 2), 16));
                    };


                    $(".mobcol__").blur(function () {
                        //M.picker__.fromRGB( parseInt($("#mobcolr__").val()), parseInt($("#mobcolg__").val()), parseInt($("#mobcolb__").val()) );
                        var xwarna = "#" + Num2Hexa($("#mobcolr__").val(), 2) +
                            Num2Hexa($("#mobcolg__").val(), 2) +
                            Num2Hexa($("#mobcolb__").val(), 2);
                        M.picker__.fromString(xwarna);
                    });


                    $("#filter_info__").click(function () {
                        // alert("sedang dikonstruksi");
                        var filter = $("#filt_markt").val() +
                            "<[~]>" + $("#filt_sales").val() +
                            "<[~]>" + $("#filt_custm").val() +
                            "<[~]>" + $("#filt_showr").val() +
                            "<[~]>" + $("#filt_merek").val() +
                            "<[~]>" + $("#filt_tipes").val() +
                            "<[~]>" + $("#filt_kodes").val();
                        if (M.filtercode__ != filter) {
                            M.filtercode__ = filter;
                            var objsave = {
                                filter: filter
                            };
                            M.cook__.save__("FILTER", objsave);

                            M.loading__ = 0;
                            myTabs__.FMT = 0;

                            sMobSelect__ = sMobFocus__ = "";
                            M.objLstMob__.children().remove();
                            ListMobil__.clear__();
                            menubox__.close__();
                            if (QMAP__.InfoWindow__) QMAP__.InfoWindow__.tutup__();
                            TrackCache__.clearOverlays__();
                            TrackCache__.reset__();
                            $("#lastpospage__").html(""); // kosongkan
                            menubox__.MyPoiClrs__();


                            M.ReadMyMobil__();
                            if (myTabs__)
                                setTimeout(function () {
                                    myTabs__.mobTerakhir();
                                }, 100);



                        }
                    });


                    if (W.indexOf("Fajar") === 0) $(".tlanjut__").hide();

                    // LOADING //
                    if (bMobUsrAgent) {
                        $('#tdprinter__').css("display", "none");
                        $('.mymenu[menu="2"]').css("display", "none");
                    }

                    if ($.browser.msie) {

                        var ws = Global__.winSize = new WinSizeMSIE__();
                        (onresize = function () {
                            ws.change();
                        })();
                    } else {
                        winSizecommon__();
                    }
                    M.loading__ = -1; // LOADING PAGE SUKSES //
                    if (XMAP) {
                        $("#idMainMap__").show();
                        QMAP__.load_xmaps__();
                        if (location.protocol == 'https:' || location.host == "localhost") {
                            // tampilkan lokasi kita sendiri //
                            $("#trlacak__").show();
                        }
                    } else {
                        M.onload__();
                    }
                    return;


                }, 100);
            },
            error: function () {
                // M.load_body__(ibody);
                setTimeout(function () {
                    M.load_body__(ibody);
                }, 3000);
            }
        });
    },
    setmobstatus__: function (pilih) {
        var me = false;
        if (pilih) {
            $("#selectIdMobil__ option:selected").each(function () {
                me = $(this);
                return false;
            });
        }
        $("#info_markt").html(me ? "&nbsp;" + me.attr("info_markt") : "");
        $("#info_sales").html(me ? me.attr("info_sales") : "");
        $("#info_custm").html(me ? me.attr("info_custm") : "");
        $("#info_showr").html(me ? me.attr("info_showr") : "");
        $("#info_merek").html(me ? me.attr("info_merek") : "");
        $("#info_tipes").html(me ? me.attr("info_tipes") : "");
        $("#info_kode").html(me ? me.html() : "");
    },


    // , mobTaskSS__: "?"

    mobTaskId__: 0,
    mobchange__: function (tiket) {
        if (tiket === undefined) {
            tiket = ++M.mobTaskId__;
            setTimeout(function () {
                M.mobchange__(tiket);
            }, 500); // 100 DIGANTI 500
            return;
        }
        if (tiket != M.mobTaskId__ || M.loading__ < 1) return;
        M.loading__ = 1; // MEMAKSA CENTER

        var bpoli = false,
            lstmobil = M.objLstMob__,
            stgl = M.pilihStrTgl__.toString(),
            tabref = myTabs__.sref,
            oldselect, newselect;
        var oneday = TrackCache__.TcItems__[stgl];

        // baca fokus mobil //
        newselect = lstmobil.val();
        if (newselect === null) newselect = "";

        // oldselect = (sMobSelect__ != newselect) ? sMobSelect__ : sOldSelect__;
        oldselect = sOldSelect__;
        sOldSelect__ = sMobSelect__ = newselect;
        // baca status
        M.setmobstatus__(sMobSelect__);
        // 
        if (sMobFocus__ != sMobSelect__) {
            sMobFocus__ = sMobSelect__;
            bpoli = true;
        }
        QMAP__.openNumWindow__ = true;

        switch (tabref) {
            case 'idMainMap__':
                if (QMAP__.GMAP__ && bpoli) TrackCache__.showPolyline__();
                var ibox = menubox__.iBox__;
                if (ibox == 2) {
                    menubox__.geo_show__();
                } else if (ibox === 0 && !bpoli) {
                    if (oneday) oneday.showInfoBox__();
                }
                M.timerWebData__(3000);
                break;
            case "idMobPosisi__":
                myTabs__.mobPosisi(1);
                // M.timerWebData__(2000);
                break;

            // kamera //
            case 'idMobKamera__':
                oKamera__.tampil__();
                break;

            case 'idMobKode__':
                oMobKode__.restore__();
                break;

            case 'idMobReport__':
                var mobkode = "<B style='color:blue' >" + ListMobil__.getKode__(sMobSelect__) + "</B>",
                    ftrmesin = M.ufilter__ >= 0 ? 'Mesin' : 'Argo';

                $("#rptjenis__ option").each(function () {
                    var me = $(this);
                    me.html(me.attr('xlabel').replace(/_abc_/g, mobkode).replace(/Mesin/g, ftrmesin));
                });
                break;

            case 'idMobTerakhir__':
                if (sMobSelect__) {
                    cls_enter(2, sMobSelect__, lstmobil);
                }
                break;
        }
        // sembunyikan gbr mobil jika perlu //
        if (M.cekImgMobil__ === 0 && oldselect != sMobSelect__ && oneday) {
            var marker = oneday.markers__[oldselect];
            if (marker) marker.tampilkan__(-1);
        }

    },
    getObjTgl__: function () {
        return (M.bTgl1Aktif__ ? $.tgl1 : $.tgl2);
    },
    bTgl1Aktif__: true,
    cekTogle__: function () {
        var iload = M.loading__,
            tabref = myTabs__.sref,
            showpanel = M.dleftsize;
        var tgl1 = M.bTgl1Aktif__ = (iload < 1 || showpanel || (tabref != 'idMainMap__'));

        var tgl = (M.pilihTgl__ !== null) ? M.pilihTgl__ : new Date();
        $.tgl1.selectDate(tgl);
        $.tgl2.selectDate(tgl);
        $(".txttanggal__").val($.tgl1.selectedDateString);
        $('#tombol2__').css("display", tgl1 ? "none" : "");
    },


    // LOAD //

    onload__: function () {

        var stlkiri = docId("panelkiri__").style;
        var stlkanan = docId("panelkanan__").style;
        var stlinfo = docId("dcarinfo__").style;
        $("#toglepanel__").click(function () {
            var showpanel = M.dleftsize = (M.dleftsize !== 0) ? 0 : 1;
            stlkiri.display = showpanel ? "" : "none";
            if ($.browser.msie) {
                winSize.change(1);
            } else {
                stlkanan.left = showpanel ? "135px" : "0px";
                stlinfo.left = showpanel ? "135px" : "0px";
            }
            QMAP__.map_refresh__();
            M.cekTogle__();
        });


        var stlfilter = docId("dfilter__").style;
        $("#tdfilter__").click(function () {
            var showpanel = M.drightsize__ = M.drightsize__ !== 0 ? 0 : 1;
            stlfilter.display = showpanel ? "" : "none";

            if ($.browser.msie) {
                winSize.change(1);
            } else {
                //document.getElementById("panelkanan__").style.right = showpanel?"135px":"0";
                stlkanan.right = showpanel ? "135px" : "0";
            }

            QMAP__.map_refresh__();
        });


        $("#tcarinfo__").click(function () {
            var showpanel = M.dbottomsize__ = M.dbottomsize__ !== 0 ? 0 : 1;
            //$("#dcarinfo__").css("display", showpanel?"":"none");
            stlinfo.display = showpanel ? "" : "none";

            if ($.browser.msie) {
                winSize.change(1);
            } else {
                //var setil = document.getElementById("panelkanan__").style;
                //setil.bottom = showpanel?"30px":"0";
                stlkanan.bottom = showpanel ? "30px" : "0";
            }


            QMAP__.map_refresh__();
        });

        $("#minitabs").minitabs__("#container__", 0);

        // EVENT TANGGAL, mousedown
        $('.clsNavTgl').bind('mousedown', function (o) {
            M.CheckDate__(o);
        });

        // 
        $("#tdcekroute__").click(function () {
            var ini = $(this),
                icek = QMAP__.readRoute__ = !QMAP__.readRoute__;
            var label = "rute" + (icek ? "+" : "-");
            ini.html(label);
            if (M.loading__ < 1) return;
            setTimeout(function () {
                TrackCache__.showRoute__();
            }, 100);
        });

        // point of interest, penanda lokasi, tanda //
        $("#tdcekpoint__").click(function () {
            var ini = $(this),
                icek = M.cekImgPOI__ = (1 + M.cekImgPOI__) % 3;
            var label = "lokasi" + (icek === 0 ? "-" : (icek == 1 ? "+" : "#"));
            ini.html(label);
            if (M.loading__ < 1) return;
            setTimeout(function () {
                var item;
                for (var i = 0; (item = menubox__.MyPoiArr__[i]); i++) {
                    //item.setVisible(icek>0);
                    item.tampilkan__(0);
                }
            }, 100);
        });

        // mobil dan label 
        $("#tdmoblabel__").click(function () {
            var ini = $(this),
                icek = (1 + M.cekImgMobil__) % 3;
            // jijka jumlah mobil hanya satu //
            if (icek == 1 && ini.attr("mobjumlah") == "1") ++icek;
            M.cekImgMobil__ = icek;
            var label = "armada" + (icek === 0 ? "-" : (icek == 1 ? "+" : "#"));
            ini.html(label);
            if (M.loading__ < 1) return;
            if (myTabs__.sref == "idMainMap__") setTimeout(function () {
                TrackCache__.showLabel__();
            }, 100);
        });


        // evant: jika armada disorot //
        var mobsel = M.objLstMob__;
        if ($.browser.msie) {
            if (XMAP == "nokia") {
                mobsel.css({
                    height: ""
                });
                var tinggi = screen.height > 700 ? 20 : 10;
                mobsel.attr({
                    size: tinggi
                });
            }
        }

        // BY ISA ADI MULIA, COMPATIBLE MOBILE ? 
        //mobsel.bind("keydown click change", function() {
        //    M.mobchange__();
        //});

        mobsel.bind("change", function () {
            M.mobchange__();
        });


        $(".kekiri__").mousedown(function () {
            var oneday = TrackCache__.getItem__(M.pilihStrTgl__);
            if (oneday) oneday.getNextPoint__(-1);
        });

        $(".kekanan__").mousedown(function () {
            var oneday = TrackCache__.getItem__(M.pilihStrTgl__);
            if (oneday) oneday.getNextPoint__(1);
        });

        $(".kelain__").mousedown(function () {
            var oneday = TrackCache__.getItem__(M.pilihStrTgl__);
            if (oneday) oneday.getNextMobil__();
        });

        $(".keawal__").mousedown(function () {
            var oneday = TrackCache__.getItem__(M.pilihStrTgl__);
            if (oneday) oneday.getNextPoint__(null);
        });

        if (M.wfilter__) {
            $("#liMUser__").hide();
            $("#tdfilter__").click();
            $("#tcarinfo__").click();
        } else {
            $("#tdfilter__").hide();
            // $("#trftogle__").hide();
            $("#tcarinfo__").hide();
        }

        if (M.strequals__(M.username__, ""))
            M.show_logon__();
        else
            M.logon_sukses__();

        $(".txtsms> #mail_stop__, .txtsms> #sms_stop__, .txtsms> #mail_engine_of__, .txtsms> #sms_engine_of__, .txtsms> #mail_engine_on__, .txtsms> #sms_engine_on__, .txtsms> #mail_engine_onday__, .txtsms> #sms_engine_onday__, .txtsms> #mail_oil__, .txtsms> #sms_oil__, .txtsms> #mail_suhu__, .txtsms> #sms_suhu__").hide().after('<center> - </center>');
        //$(".txtsms> #sms_sos__, .txtsms> #sms_alarm__, .txtsms> #sms_door__, .txtsms> #sms_speedy__, .txtsms> #sms_engine__, .txtsms> #sms_gpsfail__, .txtsms> #sms_gsmfail__").hide().after('<center> - </center>');

        if (W == "mycar") {
            setTimeout(function () {
                //$("#mylogof__").hide();
                //$("#myuser__").hide();
                $("#logon_demo__").click();
            }, 100);
        }

    },


    cook__: {
        getExpired__: function (day) {
            var exdate = new Date();
            exdate.setTime(exdate.getTime() + (86400000 * day));
            return ";expires=" + exdate.toGMTString();
        },
        getString__: function (key) {
            if (document.cookie.length < 1) return false;
            var cookieStart = document.cookie.indexOf(key + "=");
            if (cookieStart < 0) return false;
            cookieStart += key.length + 1;
            var cookieEnd = document.cookie.indexOf(";", cookieStart);
            if (cookieEnd < 0) cookieEnd = document.cookie.length;
            return document.cookie.substring(cookieStart, cookieEnd);
        },
        read__: function (key) {
            var oret = false;
            var cookietext = M.cook__.getString__(key);
            if (!cookietext) return oret;
            try {
                var str = "_jscek=" + N._DH(cookietext).toString();
                oret = eval(str);
                //if (!oret.u) oret = false;
            } catch (e) {
                oret = false;
            }
            return oret;
        },
        save__: function (key, obj) {
            var cook = key + "=" + N._EH(M.object2string__(obj)) + M.cook__.getExpired__(100);
            document.cookie = cook;
        }
    },




    // MENULIS TGL // 

    taskDR__: 0,
    DateWrite__: function (tiket) {

        M.pilihTgl__ = M.getObjTgl__().selectedDate;
        M.pilihStrTgl__ = M.pilihTgl__.ss();
        M.malamStrTgl__ = (new Date(M.pilihTgl__.dVal().valueOf() - 1000)).ymdhms();

        if (tiket === undefined) {
            tiket = ++M.taskDR__;
            setTimeout(function () {
                M.DateWrite__(tiket);
            }, 1000);
            return;
        }
        if (tiket != M.taskDR__) return;
        if (!QMAP__.GMAP__) return;
        if (M.loading__ < 1) return;
        M.loading__ = 1; // MEMAKSA CENTER

        if (M.taskBusy__ === 0) {
            M.taskBusy__ = 2;

            setTimeout(function () {
                QMAP__.InfoWindow__.tutup__();

                var oneday = TrackCache__.TcItems__[M.pilihStrTgl__];
                M.showInfoTitik__(oneday ? oneday.nTitik__ : -1);
                //
                if (myTabs__.sref == "idMainMap__") {
                    TrackCache__.showPolyline__();
                } else if (myTabs__.sref == "idMobPosisi__") {
                    myTabs__.mobPosisi();
                }
                M.taskBusy__ = 0;
                M.timerWebData__(500);
            }, 100);
        } else {
            M.timerWebData__(500);
        }

    },


    CheckDate__: function (o) {

        // CLEAR TASK //
        var otgl = M.getObjTgl__();
        var tid = o.currentTarget.id,
            d = otgl.selectedDate;
        //sd = M.pilihStrTgl__;
        switch (tid) {
            case "idArrowPrevD":
                d.setDate(d.getDate() - 1);
                break;
            case "idArrowNextD":
                d.setDate(d.getDate() + 1);
                break;
            case "idArrowPrevM":
                d.setMonth(d.getMonth() - 1);
                break;
            case "idArrowNextM":
                d.setMonth(d.getMonth() + 1);
                break;
            case "idArrowPrevY":
                d.setFullYear(d.getFullYear() - 1);
                break;
            case "idArrowNextY":
                d.setFullYear(d.getFullYear() + 1);
                break;
            default:
                return;
        }
        otgl.selectDate(d);
        $(".txttanggal__").val(otgl.selectedDateString);
        M.DateWrite__();
    },

    // ENTER FORM //

    submitenter: function (e, ofocus) {
        var keycode;
        if (ofocus === null) keycode = 9;
        else if (window.event) keycode = window.event.keyCode;
        else if (e) keycode = e.which;
        else return false;
        if (keycode == 13 || keycode == 9) {
            if (ofocus === false) return M.logonfalse__();
            setTimeout(function () {
                var logon = 0;
                try {
                    // baca cookies //
                    var obj = M.cook__.read__("MINE");
                    var org = (obj && obj.o !== undefined) ? obj.o : $("#loginusr__").val();
                    if (obj && obj.u == $("#loginusr__").val()) {
                        $("#loginorg__").val(org);
                        //$("#loginusr__").val(obj.u);
                        $("#loginpwd__").val(obj.p);
                        logon = keycode == 13;
                        if (logon) M.do_logon__(obj.o, obj.u, obj.p, 1);
                    } else {
                        if ($("#loginorg__").val() === "") $("#loginorg__").val(org);
                    }

                } catch (e) { }
                if (logon !== true && typeof (ofocus) == "string") document.getElementById(ofocus).focus();
            }, 50);
            return false;
        } else return true;
    },


    logonfalse__: function () {
        setTimeout(function () {
            var o = $("#loginorg__").val();
            var u = $("#loginusr__").val();
            var p = $("#loginpwd__").val();
            M.do_logon__(o, u, p, 1);
        }, 100);
        return false;
    },




    llKonversi__: {
        nround: Math.pow(10, LLDEC),
        nabs: Math.pow(10, 4 - LLDEC),
        ll2int: function (flat, flon) {
            return 10000000 * (1800000 + (flon > 0 ? M.llKonversi__.nabs : -M.llKonversi__.nabs) * Math.round(M.llKonversi__.nround * Math.abs(flon))) + (900000 + (flat > 0 ? M.llKonversi__.nabs : -M.llKonversi__.nabs) * Math.round(M.llKonversi__.nround * Math.abs(flat)));
        }
    },


    dec2hex__: function (d, digit) {
        var hD = '0123456789ABCDEF';
        var h = hD.substr(d & 15, 1);
        while (d > 15) {
            d >>= 4;
            h = hD.substr(d & 15, 1) + h;
        }
        digit = digit === undefined ? 0 : digit;
        while (h.length < digit) h = "0" + h;
        return h;
    },



    bacanwarna__: function (swarna) {
        var awarna = swarna.substr(4).replace(")", "").split(",", 3);
        // CEK COMPATIBILITAS IE //
        if (awarna.length < 3) return parseInt(swarna.replace("#", "0x"));
        else return 65536 * awarna[0] + 256 * awarna[1] + 1 * awarna[2];
    },


    bacaswarna__: function (swarna) {
        var awarna = swarna.substr(4).replace(")", "").split(",", 3);
        // CEK COMPATIBILITAS IE //
        if (awarna.length < 3) return swarna;
        var nwarna = 65536 * awarna[0] + 256 * awarna[1] + 1 * awarna[2];
        var xwarna = "#" + Num2Hexa(nwarna, 6);
        return xwarna;
    },




    // BACA KECEPATAN //

    bacaMesin__: function (nref, ienvire, angka) {
        ienvire = ienvire || 0;
        var sret = "",
            ftrmesin = (ienvire == -3 ? 'Gps' : (M.ufilter__ >= 0 ? 'Mesin' : 'Argo'));

        if (ienvire >= 0 || ienvire == -3) {
            var nyala = 64 & nref;
            sret = ftrmesin + (nyala ? " <b>ON</b>" : " OFF");
            if (nyala && angka !== undefined) {
                sret = "" + Math.round(1.00 * angka / 100) + " km/h";
            }
        } else {
            if (angka !== undefined) {
                sret = "" + Math.round(1.00 * angka / 100) + " km/h";
            }
        }
        return sret;
    },

    // BACA SISA BAHAN BAKAR //

    bacaFuel__: function (angka, nref, fuelold) {
        if (angka < 20 || fuelold < 20) return "";
        var sret = "",
            arumus = ListMobil__.rumusfuel[nref],
            fuelref = ListMobil__.maxfuel[nref],
            fuelnew;

        if (arumus.length == 3 && arumus[2] > 0 && arumus[1] > 1) {
            var ifan = Math.round((angka - arumus[0]) / arumus[1]);
            sret = ", FAN[";
            for (var ii = 0; ii < arumus[2]; ii++) {
                sret += ifan & (1 << ii) ? (ii + 1) : "-";
            }
            sret += "]";
        } else if (angka < 20 || fuelold < 20) {
            //return "";
        } else if (arumus.length > 3) {
            // RUMUS BARU, by adi //
            fuelnew = arumus[0] + (angka - arumus[1]) * arumus[2];
            sret = ", ".concat(arumus[3], ":", fuelnew.to_fixed(), "L");
        } else {
            // RUMUS LAMA //
            if (fuelref < angka)
                ListMobil__.maxfuel[nref] = angka;
            fuelold = 100.00 - 100.00 * fuelold / fuelref;
            fuelnew = 100.00 - 100.00 * angka / fuelref;
            if (Math.abs(Math.abs(fuelnew) - Math.abs(fuelold)) <= 4)
                sret = ", " + arumus[0] + ":" + (5 * Math.round(fuelnew / 5)) + "%"; // + fuelnew + ", old:" + fuelold;
        }
        return sret;
    },

    // BACA SUHU MESIN //

    bacaSuhu__: function (angka, nref, suhuold) {
        if (angka < 20) return "";
        var sret = ", Sh:",
            arumus = ListMobil__.rumusTE[nref];
        if (arumus.length > 3) {
            var len, cc, ss = "" + (arumus[0] + (angka - arumus[1]) * arumus[2]).toFixed(1);
            len = ss.length - 1;
            if (len > 1 && ss.charAt(len) == '0') ss = ss.substring(0, len - 1);
            cc = ss.charAt(0);
            if (cc != '-' && cc != '0') ss = "+" + ss;
            sret += "<b>" + ss + "&#176;</b>" + arumus[3];
        } else {
            if (!isNaN(suhuold)) {
                var npersen = (angka > suhuold) ? (angka - suhuold) / angka : (suhuold - angka) / suhuold;
                if (npersen > 0.3) return "";
            }
            sret += Math.round(100.00 * angka / 1500) + "%";
        }
        return sret;
    },



    baca02Status__: function (alm, showalarm, ienvire) {
        alm = parseInt(alm);
        showalarm = showalarm || false;
        ienvire = ienvire || 0;
        var sret = ", ";

        if (ienvire == -1) { // GT 05
            sret = " alarm:" + alm;

        } else { // NORMAL 
            sret = (4 & alm ? ", pintu Buka" : "") +
                (16 & alm ? ", low-bat" : "") +
                (32 & alm ? ", SLEEP" : "") +
                (4096 & alm ? ", ac-on" : "");
            //baca02Status__.arguments.length>1	
            if (showalarm) {
                if (1 & alm) sret += "&nbsp;<blink><font color='#FF0000'><strong>SOS</strong></font></blink>&nbsp;";
                if (2 & alm) sret += "&nbsp;<blink><font color='#FF00FF'><strong>ALARM</strong></font></blink>&nbsp;";
                if (8 & alm) sret += "&nbsp;<blink><font color='#CC0000'><strong>AKI-LEPAS</strong></font></blink>&nbsp;";
            }
        }
        if (showalarm) {
            //var csignal = (2048 & alm) ? "gps0" : ( (512 & alm) ? "gps1" : "" );
            //if(csignal) sret += "&nbsp;<blink><font color='#0000FF'><strong>"+csignal+"</strong></font></blink>&nbsp;";

            if (2048 & alm) {
                sret += "&nbsp;<span  class='showtip' style='color:#990000;' tooltip='sinyal gps tanpa koordinat'>gps0</span>&nbsp;";
            } else if (512 & alm) {
                sret += "&nbsp;<span  class='showtip' style='color:#990000;' tooltip='sinyal gps lemah'>gps1</span>&nbsp;";
            }

        }
        return sret;
    },


    // TAMPLILKAN LOGON //

    show_logon__: function (msg) {
        M.loading__ = -1;
        myTabs__.FMT = 0;
        sMobSelect__ = sMobFocus__ = ""; // kode mobil yg difokus
        M.setmobstatus__(0);

        // close box //
        menubox__.close__();

        // hide lacak //
        //$("#trlacak__").hide();

        $("#drt").hide();
        if (QMAP__.InfoWindow__) QMAP__.InfoWindow__.tutup__();
        if (msg !== undefined)
            alert(msg);
        else {
            // clear 
            M.session_check__(true);
        }
        $(".trpanel__").hide();
        $("#showprogress__").show();

        oPrinter__.check__();
        $("#lastpospage__").html(""); // kosongkan

        myTabs__.showMobTerakhir__([""]);
        if (M.wfilter__) {
            $("#loginorg__").hide();
            $("#lblloginorg__").hide();
            $("#idMutakhir__").click();
        } else {
            $("#loginorg__").show();
            $("#lblloginorg__").show();
            $("#idMain__").trigger('click');
        }
        set_focus(docId("loginusr__"));

        setTimeout(function () {
            TrackCache__.clearOverlays__();
            TrackCache__.reset__();
            menubox__.MyPoiClrs__();
            $("#showprogress__").hide();
            $("#showlogon__").show();
        }, 200);
    },


    session_check__: function (send, arr) {
        // SESSION DIREKAM //
        var dat = {};
        dat.fused = N("frame.php");
        if (arr && arr.length) {
            M.username__ = arr[1];
            M.companyid__ = arr[2];
            M.accesscode__ = arr[3].substr(0, 3);
            M.runtext__ = arr[4];
            M.ufilter__ = parseInt(arr[5]);
            M.userID__ = arr[6];
            dat.pos = N._EH(M.object2string__({
                u: M.username__,
                cid: M.companyid__,
                ac: M.accesscode__,
                rt: M.runtext__,
                filter: M.ufilter__,
                uid: M.userID__
            }));
        } else arr = false;
        if (send) {
            $.ajax({
                headers: { "cache-control": "no-cache" },
                url: (M.debug__ > -1 ? M.lok_frame__ : (M.debug__ == -1 ? M.lok_app__ : "./")), // lokasi web //

                type: arr ? "POST" : "GET",
                data: dat
            });
        }
    },

    // SUKSES //

    logon_sukses__: function () {
        M.dbg("logon_sukses called");

        // patch //
        if (QMAP__.InfoWindow__) {
            QMAP__.openNumWindow__ = true;
            QMAP__.InfoWindow__.lastFocus__ = {
                stgl: "",
                mobid: "",
                waktu: "",
                jarak: 0
            };
        }

        // mesin | argo // 
        var ftrmesin = M.ufilter__ >= 0 ? 'Mesin' : 'Argo';
        //alert(M.ufilter__);

        $('span.ftruser').html(ftrmesin);

        $(".input_logon__").val("");
        $(".trpanel__").hide();
        $("#showpanel__").show();
        if (M.wfilter__) {
            $("#idMutakhir__").click();
            setTimeout(function () {
                myTabs__.mobTerakhir();
            }, 600);
        } else {
            var display = (M.ufilter__ > 0 || M.accesscode__ != "~") ? "none" : "";
            // var shide = "#liMUser__, #liMobKode__";  // Commented out to keep Armada menu visible
            //if(M.companyid__== 27433) {
            //	shide += ", #liMobReport__";
            //}
            $(shide).css({
                display: display
            });
        }
        var nlen = M.username__.length;
        var usr1 = (nlen < 16) ? M.username__ : M.username__.substr(0, 14).concat("~");

        $("#myuser__").html(usr1.htmlEncode());
        //M.DateWrite__();


        var rtvisible = (M.runtext__ !== "");
        if (rtvisible) {
            var sruntext = M.runtext__.replace(/\{domain\}/g, W);
            $(".crt").html(sruntext);
            $("#drt").show();
        } else {
            $("#drt").hide();
        }

        M.dbg("logon_sukses: reset UI");
        myTabs__.bReadingLastPos__ = (new Date(0)).valueOf();
        M.tdInfo__ = $('#tdInfo__');
        M.td2Info__ = $('#td2Info__');
        M.loading__ = 0; // sudah logon //
        M.sTglBlank__ = [];
        M.objLstMob__.children().remove();
        sMobSelect__ = sMobFocus__ = ""; // kode mobil yg difokus
        M.setmobstatus__(0);

        oPrinter__.check__();

        M.dbg("logon_sukses: starting timers");
        //		TrackCache__.reset__();
        setTimeout(function () {
            M.dbg("logon_sukses: inside timeout");
            var otgl = M.getObjTgl__(),
                tgl = (M.pilihTgl__ !== null) ? M.pilihTgl__ : new Date();
            otgl.selectDate(tgl);

            M.dbg("logon_sukses: calling MyPoiRead");
            menubox__.MyPoiRead__();
        }, 100);

    },


    // logon //

    bUserDemo__: false,
    do_logon__: function (organisasi, cuser, cpwd, filtered) {
        var bdemo = organisasi == cuser && cuser == cpwd && cpwd == 'demo';
        organisasi = filtered && M.wfilter__ ? N._DH(M.wfilter__) : organisasi;
        $(".trpanel__").hide();
        $("#showprogress__").show();
        var req = N._EH(M.object2string__({
            o: organisasi,
            u: cuser,
            p: N(cpwd),
            W: W
        }));
        var aserver = M.serverdata__.split(" ");
        var ii = 0,
            alen = aserver.length;
        var flogon = function () {
            M.serverdata__ = aserver[ii];

            $.JP({
                url: M.urlCallBack__(M.debug__ > -1 ? M.lok_logon__ : (M.debug__ == -1 ? M.lok_app__ : "")),


                data: {
                    fused: N(M.lok_logon__),
                    req: req
                },
                success: function (dat) {
                    var len = dat.length;
                    if (len < 6) return M.show_logon__(dat[0]);
                    var objsave = $('#savelogon__').is(':checked') ? {
                        o: organisasi,
                        u: cuser,
                        p: cpwd
                    } : {};
                    // user demo //
                    $('.mymenu[menu="1"]').css("display", (bdemo ? "none" : ""));
                    M.cook__.save__("MINE", objsave);
                    M.session_check__(bdemo ? false : true, dat);
                    M.logon_sukses__();
                },
                error: function () {
                    if (++ii < alen) {
                        flogon();
                    } else {
                        if (alen > 1) {
                            M.serverdata__ = aserver.join(" ");
                        }
                        M.show_logon__(M.bad_connection__);
                    }
                }
            });
        };
        flogon();
    },





    ReadMyMobil__: function (mobnew) {
        M.dbg("ReadMyMobil called with mobnew=" + mobnew);
        if (typeof (mobnew) != "string") mobnew = '';
        M.tdInfo__.html(" Baca Armada..<br/>" + M.imgProgress__);
        M.td2Info__.html(M.img2Progress__);

        // buat parameter //
        var orek = {
            tname: "mobil",
            ilast: 0,
            cid: M.companyid__,
            u: M.username__,
            uid: M.userID__,
            fc: (M.wfilter__ ? M.filtercode__ : "")
        };

        var req = N._EH(M.object2string__(orek));
        var aret = [M.bad_connection__];
        $.JP({

            url: M.urlCallBack__(M.debug__ > -1 ? M.lok_gettbl__ : (M.debug__ == -1 ? M.lok_app__ : "")),


            data: {
                fused: N(M.lok_gettbl__),
                req: req
            },
            success: function (dat) {
                aret = dat;
            },
            complete: function () {
                M.dbg("ReadMyMobil completion. aret.length=" + aret.length + " | status=" + aret[0]);
                //oChangePwd__.restore__(aret.length < 2 ? aret[0] : "");
                if (M.loading__ < 0) return;
                if (aret.length < 2) {
                    M.tdInfo__.html("");
                    M.td2Info__.html("");
                    alert(aret[0] === "" ? "armada tidak terbaca" : aret[0]);
                    if (aret[0] == "kosong") return (M.loading__ = 1);
                    setTimeout(function () {
                        M.ReadMyMobil__(mobnew);
                    }, 4000);
                    return;
                }
                aret.splice(0, 1);
                var len = aret.length;
                $("#tdmoblabel__").attr("mobjumlah", len);
                $("#carjumlah__").html("jumlah " + len);
                sMobSelect__ = sMobFocus__ = ""; // kode mobil yg difokus
                M.setmobstatus__(0);
                if (len == 1) {
                    mobnew = aret[0][1];
                }
                setTimeout(function () {
                    var smob = M.WriteMyMobil__(aret, mobnew);
                    if (smob) {
                        //sOldSelect__ = sMobSelect__ = sMobFocus__ = smob;
                        //M.setmobstatus__(1);
                        M.objLstMob__.val(smob).change();
                    }
                    M.tdInfo__.html("");
                    M.td2Info__.html("");
                    M.loading__ = 1; // sudah siap //

                    M.cekTogle__();
                    if (QMAP__.GMAP__ && autoRead__) M.timerWebData__(2000);
                }, 100);
            }
        });
    },



    WriteMyMobil__: function (dat, mobsorot) {
        // ADD //
        var smob = "",
            osel = M.objLstMob__,
            olist = ListMobil__,
            childs = osel.children();
        if (childs) childs.remove();
        olist.clear__();
        var len0 = dat.length;
        if (len0 <= 0) return smob;

        var xwarna, mobid, mkode, mket, jenis, maxfuel, maxTE, styleid, selected, pilih = false;
        $.each(dat, function (i, om) {
            mobid = om[0];
            mkode = om[1];
            mket = om[18];
            xwarna = "#" + ("000000" + om[2]).substr(om[2].length, 6);
            jenis = om[3];
            maxfuel = parseInt(om[4]);
            maxTE = parseInt(om[5]);
            styleid = parseInt(om[6]);

            selected = (mkode == mobsorot);
            if (selected) {
                smob = mobid;
            }
            // mkode
            $("<option class=m></option>").attr({
                selected: selected,
                id: mobid,
                value: mobid,
                text: mkode,
                jenis: jenis,
                maxfuel: maxfuel,
                maxTE: maxTE,
                styleid: styleid,
                geoemail: om[10],
                geosmsto: om[11],
                info_sales: om[12],
                info_custm: om[13],
                info_showr: om[14],
                info_merek: om[15],
                info_tipes: om[16],
                info_markt: om[17]
            }).css("color", xwarna).appendTo(osel);
            olist.register__(mobid, mkode, mket, xwarna, pilih, jenis, maxfuel, maxTE, styleid, om[7], om[8], om[9], om[17]);
        });
        return smob;
    },


    timerWebnERR__: 0,
    timerWebDelay__: 10000,
    maxrec__: 1000,
    taskBusy__: 0,
    taskID__: 0,
    timerWebData__: function (delay, tiket) {
        var scek, stgl = M.pilihStrTgl__;
        if (tiket === undefined) {
            tiket = "T" + stgl + "," + (++M.taskID__);
            setTimeout(function () {
                M.timerWebData__(delay, tiket);
            }, delay);
            return;
        }
        scek = "T" + stgl + "," + M.taskID__;
        if (tiket != scek || M.loading__ < 1) return;
        if (M.taskBusy__ > 0) {
            //M.timerWebData__(500, tiket);
            setTimeout(function () {
                M.timerWebData__(1500, tiket);
            }, 1000);
            return;
        }

        var sref = myTabs__.sref, bmap = false;
        switch (sref) {
            case "idMainMap__":
                bmap = true;
                break;
            case "idMobPosisi__":
                break;
            default:
                return;
        }
        M.taskBusy__ = 2;
        var mobfokus = (bmap && sMobFocus__) ? sMobFocus__ : sMobSelect__;


        // cek dahulu //
        var mobtime, fmt = -1,
            lastid = -2,
            lasttime = M.malamStrTgl__;
        var oday = TrackCache__.TcItems__[stgl];
        if (typeof (oday) == "object") {
            lastid = oday.nMaxId__;
            fmt = oday.lastfmtbaca__;
            mobtime = oday.mTime__[mobfokus];
            // sudah pernah terbaca //
            if (mobtime) {
                lasttime = mobtime;
                if (stgl < M.lastDateNumber__) {
                    // TIDAK PERLU DIBACA //
                }
            }
        }

        M.tdInfo__.html(" Baca Posisi..<br/>" + M.imgProgress__);
        M.td2Info__.html(M.img2Progress__);

        // bac arute, by adi //
        var brute = ((!bmap) || QMAP__.readRoute__) && (mobfokus == sMobSelect__);
        var crute = brute ? "yes" : "not";

        var sreg = M.object2string__({
            tname: "position",
            mobid: mobfokus,
            sdate: stgl,
            rute: crute,
            ilast: lastid,
            lasttime: lasttime,
            cid: M.companyid__,
            uid: M.userID__,
            u: M.username__,
            fc: (M.wfilter__ ? M.filtercode__ : ""),
            fmt: fmt
        });
        var req = N._EH(sreg);

        $.JP({

            url: M.urlCallBack__(M.debug__ > -1 ? M.lok_gettbl__ : (M.debug__ == -1 ? M.lok_app__ : "")),


            data: {
                fused: N(M.lok_gettbl__),
                req: req
            },
            success: function (dat) {
                if (M.loading__ < 1) {
                    M.taskBusy__ = 0;
                    return;
                }
                if (!mobfokus && dat[0] && (typeof (dat[0]) == "object") && dat[0][6]) {
                    mobfokus = dat[0][6];
                    M.objLstMob__.val(mobfokus).change();
                }
                setTimeout(function () {
                    M.drawWebData__(stgl, dat, mobfokus, brute);
                }, 1000);

            },
            error: function () {
                M.taskBusy__ = 0;
                M.tdInfo__.html(M.bad_connection__);
                M.td2Info__.html(M.bad2connection__);
                setTimeout(function () {
                    M.timerWebData__(1500, tiket);
                }, 1000);
            }
        });
    },


    // MENGGAMBAR TRACK // 

    showInfoTitik__: function (n) {
        var msg = (n === 0 ? "&lt; tidak ada &gt;" : (n < 0 ? "&lt; ? &gt;" : n));
        var s = "titik yg terbaca<br/>" + msg;
        M.tdInfo__.html(s);
        M.td2Info__.html(msg);
    },


    drawWebData__: function (stgl, aBaca, mobchoice) {
        var oneday, ndata = typeof (aBaca) == "string" ? -1 : aBaca.length - 1;
        var ainfo = ndata < 0 ? false : aBaca.shift();
        var lastid = 0,
            lasttime = "",
            xcount = 0,
            fmt = 0;
        if (typeof (ainfo) == "object") {
            M.lastDateNumber__ = ainfo[0];

            lastid = parseInt(ainfo[2]); // LASTID
            lasttime = ainfo[3]; // lasttime

            // jika tidak baca rute, baca GPSMETER awal 
            // if(!brute) lasttime = parseInt(lasttime); 

            xcount = parseInt(ainfo[4]); // xcount
            fmt = parseInt(ainfo[1]); // changed file id 

            // RESTART, JIKA VERSI BEDA //
            if (SCRIPT_VERSION != parseInt(ainfo[5])) {
                setTimeout(function () {
                    //$("#refresh__").click();
                    var url = window.location.protocol + "//" + window.location.host + window.location.pathname,
                        csearch = window.location.search.trim(),
                        ipos = csearch.indexOf('qtx=');
                    if (ipos > 0) {
                        csearch = csearch.substr(0, ipos);
                    } else {
                        csearch += (csearch.length > 0) ? "&" : "?";
                    }
                    window.location = url + csearch + "qtx=" + (new Date()).valueOf();
                }, 573);
            }
        }

        if (ndata > 0) {
            oneday = TrackCache__.putItem__(stgl, aBaca, mobchoice, lastid, lasttime, xcount);
            oneday.lastfmtbaca__ = fmt;
        } else if (mobchoice) {
            oneday = TrackCache__.getItem__(stgl);
        }

        // jika tgl berubah, return //
        if (stgl != M.pilihStrTgl__) {
            M.taskBusy__ = 0;
            M.timerWebData__(1000);
            return;
        }
        if (typeof (oneday) != "object") {
            setTimeout(function () {
                M.showInfoTitik__(0);
                M.taskBusy__ = 0;
            }, 500);
            return;
        }

        setTimeout(function () {
            var blagi = 0;
            if (myTabs__.sref == "idMainMap__") {
                blagi = 1;
                TrackCache__.showPolyline__();
            } else if (myTabs__.sref == "idMobPosisi__") {
                // blagi=1;
                myTabs__.mobPosisi();
            }
            M.taskBusy__ = 0;
            if (blagi) {
                if (mobchoice == sMobFocus__) {
                    M.timerWebData__(10000);
                } else if (autoRead__) {
                    M.timerWebData__(3000);
                }
            }
        }, 500);

        setTimeout(function () {
            M.showInfoTitik__(oneday.nTitik__);
            M.taskBusy__ = 0;
        }, 500);

    }
});


// TOMBOL utk PRINT dan SAVE //
var oPrinter__ = {
    apages__: new Array('idMainMap__', 'idMobPosisi__', 'idMobTerakhir__'),
    check__: function () {
        var hidden = (M.loading__ < 0) || (oPrinter__.apages__.indexOf(myTabs__.sref) < 0);
        $('#tdprinter__').css("visibility", hidden ? "hidden" : "visible");
    },


    preview__: function () {
        var str = myTabs__.pref.html();
        if (str.length <= 10) return alert("kosong");
        if (myTabs__.sref == "idMobPosisi__") {
            str = $("#mptitle__").html() + "<br/>" + $("#mpisi__").html();
        }
        var swin = "menubar=yes,scrollbars=1,location=0,top=20,left=20,resizable=yes,width=" + screen.width + ",height=" + screen.height;
        var win = window.open('about:blank', "preview", swin);
        win.focus();
        var doc = win.document;
        doc.open();
        doc.write(str);
        doc.close();
        if (myTabs__.sref == "idMobTerakhir__") {
            doc.getElementById("lastpospage__").style.height = "";
        }
    }
};




// ganti password
var oChangePwd__ = {
    // progress // 
    cpProgress__: false,


    restore__: function (msg) {
        if (M.loading__ < 0) {
            $("#tdPgressChangepwd__").hide();
            $("#tdChangepwd__").hide();
        } else if (msg === undefined) {
            if (!oChangePwd__.cpProgress__) {
                // nothing //
                $("#tdPgressChangepwd__").hide();
                $("#tdChangepwd__").show();
            }
        } else if (msg === 0) {
            oChangePwd__.cpProgress__ = true;
            $("#tdChangepwd__").hide();
            $("#tdPgressChangepwd__").show();
        } else {
            oChangePwd__.cpProgress__ = false;
            $("#tdPgressChangepwd__").hide();
            if (msg !== "") {
                alert(msg);
                $("#tdChangepwd__").show();
            } else {
                alert("SUKSES:\npassword anda sudah diganti");
                $("#tdChangepwd__").hide();
            }
        }
    },



    changepass__: function () {
        // RTRIM //
        var re = /((\s*\S+)*)\s*/;
        var objold = $("#pwdold__"),
            objnew = $("#pwdnew__"),
            objnew2 = $("#pwdnew2__");
        var pwdold = objold.val().replace(re, "$1"),
            pwdnew = objnew.val().replace(re, "$1"),
            pwdnew2 = objnew2.val().replace(re, "$1");
        if (pwdold === "") {
            alert("password lama; kosong");
            return objold.focus();
        } else if (pwdnew === "") {
            alert("password baru; kosong");
            return objnew.focus();
        } else if (pwdnew == pwdold || pwdnew != pwdnew2) {
            alert("password baru; perlu diulangi dg benar");
            objnew2.val("");
            return objnew.val("").focus();
        }
        oChangePwd__.restore__(0);

        var pos = N._EH(M.object2string__({
            W: W,
            cid: M.companyid__,
            u: M.username__,
            pwdold: N(pwdold),
            pwdnew: N(pwdnew)
        }));
        objold.val("");
        objnew.val("");
        objnew2.val("");
        var aret = [M.bad_connection__];
        $.JP({
            url: M.urlCallBack__(M.debug__ > -1 ? M.lok_changepwd__ : (M.debug__ == -1 ? M.lok_app__ : "")),


            data: {
                fused: N(M.lok_changepwd__),
                pos: pos
            },
            success: function (dat) {
                aret = dat;
            },
            complete: function () {
                oChangePwd__.restore__(aret.length < 2 ? aret[0] : "");
            }
        });

    }

};

