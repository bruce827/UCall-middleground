/*
 * @copyright Copyright 2004-2019 JD.COM All Right Reserved.
 */

/**
 * sdk - login2016.js
 *
 */
var LoginConstant = {
    HTTP_SCHEME: "http:",
    HTTPS_SCHEME: "https:",
    REMOTE_COUNTRY_CODE: "//misc.360buyimg.com/user/passport/1.0.0/js/login.countrycode-170524.js",
    LOCAL_COUNTRY_CODE: "user/passport-2015/js/login.countrycode-170524.js"
};
var useSlideAuthCode = $("#useSlideAuthCode").val() == "1";
var Util = {
    Cookie: {
        set: function (name, value, expire) {
            var exp = new Date();
            exp.setTime(exp.getTime() + expire * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + encodeURIComponent(value, "UTF-8") + ";expires=" + exp.toGMTString() + ";domain=passport.jd.com;path=/";
        },
        get: function (key) {
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            for (var i = 0, l = cookies.length; i < l; i++) {
                var parts = cookies[i].split('=');
                var name = parts.shift();
                var cookie = parts.join('=');
                if (key && key === name) {
                    return cookie;
                }
            }
        },
        setALCookie: function () {
            var v = this.get("alpin");
            if (v) {
                this.set("alpin", "", -100);
            }
        }
    },
    Header: {
        getProtocol: function(){
            var parentScheme = '';
            try{
                parentScheme = parent.location.protocol;
            }catch(e){
            }

            if(!parentScheme){
                var referer = document.referrer;
                if(referer.indexOf(LoginConstant.HTTPS_SCHEME) == 0){
                    parentScheme = LoginConstant.HTTPS_SCHEME;
                }else{
                    parentScheme = LoginConstant.HTTP_SCHEME;
                }
            }
            return parentScheme;
        }
    }
};


(function(){
    /**
     * 锟斤拷锟斤拷锟斤拷锟斤拷
     * @param pwd
     */
    function getEntryptPwd(pwd){
        var pubKey = $('#pubKey').val();
        if(!pwd || !pubKey || !SysConfig.encryptInfo){
            return pwd;
        }
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(pubKey);
        return encrypt.encrypt(pwd);
    }

    /**
     * 锟斤拷始锟斤拷锟斤拷锟揭达拷锟诫弹锟斤拷锟斤拷锟斤拷
     *
     * @param obj
     */
    function initCountryCode(obj) {
        if (obj.countryTips) {
            var resURL = LoginConstant.REMOTE_COUNTRY_CODE;
            if (obj.localRes) {
                resURL = LoginConstant.LOCAL_COUNTRY_CODE;
            }
            seajs.use(resURL, function (CountryCodeLayer) {
                CountryCodeLayer.init('#formlogin','#country_code_selector');
            });
        }
    }

    //锟斤拷示锟斤拷证锟斤拷
    function showAuthCode(){
        if(useSlideAuthCode){
            // if($("#s-authcode").css("display")!="none"){
            //     return;
            // }
        }else{
            if($("#o-authcode").css("display")!="none"){
                return;
            }
        }

        var loginUrl = "../uc/showAuthCode";
        var loginName=$("#loginname").val();
        $.ajax({
            type: "POST",
            url: loginUrl + "?r=" + Math.random()+"&version=2015",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: {
                loginName:loginName
            },
            dataType:"text",
            success: function (result) {
                if (result) {
                    var obj = eval(result);
                    if (obj.verifycode) {
                        if(useSlideAuthCode){
                            // $("#s-authcode").show();

                        }else{
                            $("#o-authcode").show();
                            $("#JD_Verification1").click();
                        }

                    } else {
                        if(useSlideAuthCode){
                            // $("#s-authcode").hide();
                        }else{
                            $("#o-authcode").hide();
                        }
                    }
                }
            }
        });
    }

    //锟斤拷陆锟斤拷锟斤拷
    function loginSubmit(callback) {
        $('#loginsubmit').text('\u6b63\u5728\u767b\u5f55\u002e\u002e\u002e');
        if (window.location.href.indexOf("/popupLogin2013") != -1) {
            frameLoginSubmit(callback);
            return;
        }
        var loginUrl = "/uc/loginService";
        var uuid = $("#uuid").val();

        var authcode;
        if (useSlideAuthCode) {
            // authcode = $("#s-authcode").attr('data-code');
            authcode = $("#loginsubmit").attr('data-code');
        } else {
            authcode = $('#authcode').val();
        }
        var data = {
            uuid: $('#uuid').val(),
            eid: $('#eid').val(),
            fp: $('#sessionId').val(),
            _t: $('#token').val(),
            loginType: $('#loginType').val(),
            loginname: $('#loginname').val(),
            nloginpwd: getEntryptPwd($('#nloginpwd').val()),
            authcode: authcode,
            pubKey: $('#pubKey').val(),
            sa_token: $('#sa_token').val(),
            seqSid: window._jdtdmap_sessionId,
            useSlideAuthCode: $("#useSlideAuthCode").val()
        };
        if(window.jab) {
            data.antiBotToken = jab.getToken();
        }

        $.ajax({
            url: loginUrl + "?uuid=" + uuid + "&" + location.search.substring(1) + "&r=" + Math.random()+"&version=2015",
            type: "POST",
            dataType: "text",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: data,
            error: function () {
                showMesInfo("\u7f51\u7edc\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5","error");
            },
            success: function (result) {
                if (result) {
                    
                    var obj = eval(result);
                    if(useSlideAuthCode && !obj.success) {
                        smartInitSlide();
                    }
                    if (obj.closeapp) {
                        window.location = obj.closeapp;
                        return;
                    }
                    if (obj.success) {
                        Util.Cookie.setALCookie();

                        var ssoHost = getSSOHostNew();
                        if(ssoHost && ssoHost != "sso.jd.com"){
                            $.getJSON("//sso.jd.com/setCookie?t=" + ssoHost + "&callback=?", function () {
                            });
                        }

                        var isIE = !-[1,];
                        if (isIE) {
                            var link = document.createElement("a");
                            link.href = obj.success;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                        } else {
                            window.location = obj.success;
                        }
                        return;
                    } else{
                        $("#loginsubmit").attr('data-code', '');
                    }

                    if (obj.transfer) {
                        window.location = obj.transfer + window.location.search;
                        return;
                    }

                    if (obj.newSafeVerify) {
                        window.location = obj.safeVerifyUrl;
                        return;
                    }

                    if (obj.rescue) {
                        window.location = obj.rescue;
                        return;
                    }
                    if(obj._t){
                        $("#token").val(obj._t);
                    }

                    if (obj.verifycode || obj.authcode1 || obj.authcode2 || obj.emptyAuthcode) {
                        if(useSlideAuthCode){
                            // $("#s-authcode").show();
                        }else{
                            $("#o-authcode").show();
                        }
                    }
                    if(!useSlideAuthCode){
                        $("#JD_Verification1").click();
                    }

                    if (obj.authcode2) {
                        callback(obj.authcode2,"error",["#authcode"]);
                    }
                    if (obj.username) {
                        initCountryCode(obj);
                        callback(obj.username,"error",["#loginname"]);
                    }
                    if (obj.pwd) {
                        initCountryCode(obj);
                        callback(obj.pwd,"error",["#nloginpwd"]);
                        clearPwd();
                    }
                    if (obj.emptyAuthcode) {
                        callback(obj.emptyAuthcode,"error",["#authcode"]);
                    }
                }
                var input=$('.item-error').eq(0).find('input');
                var t=input.val();
                input.val("").focus().val(t);
                $("#loginsubmit").html("\u767b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u5f55");
            }
        });
    }

    function getSSOHostNew() {

        var retURL;
        var setCrossCookie;
        var params = GetUrlParms();
        if (params) {
            retURL = params['ReturnUrl'];
            setCrossCookie = params['setCrossCookie'];
        }
        if (!retURL || !setCrossCookie) {
            return false;
        }
        var hostName = gethostName(retURL);
        if(hostName == false){
            return false;
        }
        var firstName =hostName.slice(hostName.indexOf("."),hostName.length);
        var domainArr = SysConfig.ssoArr;
        for (var i = 0; i < domainArr.length; i++) {
            var ssourl = domainArr[i];
            if (ssourl.indexOf(firstName) > 0) {
                return ssourl;
            }
        }
        return false
    }

    function gethostName(url){
        var arr=url.split(/\:\/\/|\/|\?/);
        if(arr.length <2){
            return false;
        }
        return arr[1];
    }

    /**
     * 鑾峰彇鏌ヨ瀛楃涓�
     * @returns {Object}
     * @constructor
     */
    function GetUrlParms()
    {
        var args=new Object();
        var query=location.search.substring(1);//鑾峰彇鏌ヨ涓�
        var pairs=query.split("&");//鍦ㄩ€楀彿澶勬柇寮€
        for(var i=0;i<pairs.length;i++)
        {
            var pos=pairs[i].indexOf('=');//鏌ユ壘name=value
            if(pos==-1)   continue;//濡傛灉娌℃湁鎵惧埌灏辫烦杩�
            var argname=pairs[i].substring(0,pos);//鎻愬彇name
            var value=pairs[i].substring(pos+1);//鎻愬彇value
            args[argname]=unescape(value);//瀛樹负灞炴€�
        }
        return args;
    }

    function frameLoginSubmit(callback){
        var uuid = $("#uuid").val();
        var protocol = Util.Header.getProtocol();

        var authcode;
        if(useSlideAuthCode){
            authcode = $("#loginsubmit").attr('data-code');
        }else{
            authcode = $('#authcode').val();
        }

        var top;
        if (location.ancestorOrigins && location.ancestorOrigins.length >0){
            top = location.ancestorOrigins[0];
        }

        $.ajax({
            type: "POST",
            dataType: "text",
            url: "../uc/loginService?nr=1&uuid=" + uuid + "&" + location.search.substring(1) + "&r=" + Math.random() + "&version=2015",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: {
                uuid:$('#uuid').val(),
                eid:$('#eid').val(),
                fp:$('#sessionId').val(),
                _t:$('#token').val(),
                loginType:$('#loginType').val(),
                loginname:$('#loginname').val(),
                nloginpwd:getEntryptPwd($('#nloginpwd').val()),
                authcode:authcode,
                pubKey:$('#pubKey').val(),
                sa_token:$('#sa_token').val(),
                seqSid:window._jdtdmap_sessionId,
                useSlideAuthCode:$("#useSlideAuthCode").val(),
                top: top
            },
            error: function () {
                showMesInfo("\u7f51\u7edc\u8d85\u65f6\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5","error");
            },
            success: function (result) {
                if (result) {
                    var obj = eval(result);
                    if (obj.closeapp) {
                        window.parent.location = obj.closeapp;
                        return;
                    }
                    if(useSlideAuthCode && !obj.success) {
                        smartInitSlide();
                    }

                    if (obj.success || obj.transfer) {
                        Util.Cookie.setALCookie();
                        var relayUrl = protocol + '//passport.jd.com/relay/loginRelay.htm';
                        try{
                            docRef = document.referrer;
                            var regExp = $("#popupRefererCheckRegex").val();
                            if(regExp==null){
                                regExp = /([\w-]+)\.(jd\.hk|jd360\.hk|yiyaojd\.com|baitiao\.com|jkcsjd\.com)/;
                            }else{
                                regExp = "/"+regExp+"/";
                            }
                            var match = docRef.match(regExp);
                            if(match != null && match.length>=3){
                                var ua = navigator.userAgent;
                                var isIE = (ua.indexOf('MSIE') >= 0 || ua.indexOf("Trident") >= 0);
                                var hkShortDomainEnable = window.popupConfig.hkShortDomainEnable;
                                if(isIE && match[2] == "jd.hk" && hkShortDomainEnable){
                                    relayUrl = protocol + "//" + match[0] + "/relay/loginRelay.htm";
                                }else{
                                    relayUrl = protocol + "//sso." + match[2] + "/popup/redirect";
                                }
                            }
                        }catch(e){
                        }

                        if (obj.notnr) {
                            window.location.href=relayUrl;
                            return;
                        }

                        try {
                            $.ajax({
                                type: "GET",
                                url: obj.success,
                                dataType: "jsonp",
                                timeout: 1000,
                                success: function (result) {
                                    window.location.href=relayUrl;
                                    return;
                                }
                            });
                        } catch (e) {
                            window.location.href=relayUrl;
                            return;
                        }
                    }else{
                        $("#loginsubmit").attr('data-code', '');
                    }

                    if (obj.newSafeVerify) {
                        window.parent.location = obj.safeVerifyUrl;
                        return;
                    }

                    if (obj.rescue) {
                        window.parent.location = obj.rescue;
                        return;
                    }
                    if(obj._t){
                        $("#token").val(obj._t);
                    }

                    // if (obj.verifycode || obj.authcode1 || obj.authcode2 || obj.emptyAuthcode) {
                    //     $("#o-authcode").show();
                    // }
                    // $("#JD_Verification1").click();
                    // if (obj.authcode2) {
                    //     callback(obj.authcode2,"error",["#authcode"]);
                    // }
                    if (obj.verifycode || obj.authcode1 || obj.authcode2 || obj.emptyAuthcode) {
                        if(useSlideAuthCode){
                            // $("#s-authcode").show();
                        }else{
                            $("#o-authcode").show();
                        }
                    }
                    if(!useSlideAuthCode){
                        $("#JD_Verification1").click();
                    }

                    if (obj.username) {
                        initCountryCode(obj);
                        callback(obj.username,"error",["#loginname"]);
                    }
                    if (obj.pwd) {
                        initCountryCode(obj);
                        callback(obj.pwd,"error",["#nloginpwd"]);
                        clearPwd();
                    }
                    if (obj.emptyAuthcode) {
                        callback(obj.emptyAuthcode,"error",["#authcode"]);
                    }
                }
                var input=$('.item-error').eq(0).find('input');
                var t=input.val();
                input.val("").focus().val(t);
                $("#loginsubmit").html("\u767b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u0026\u006e\u0062\u0073\u0070\u003b\u5f55");
            }
        });
    }

    function showMesInfo(msg, type) {
        $('.form>.msg-wrap').empty();
        if (type == 'warn') {
            var info = '<div class="msg-warn"><b></b>' + msg + '</div>';
            $('.form>.msg-wrap').append(info);
        }
        if (type == 'error') {
            var info = '<div class="msg-error"><b></b>' + msg + '</div>';
            $('.form>.msg-wrap').append(info);
        }
    }

    /**
     * 锟斤拷锟斤拷锟斤拷锟�
     */
    function clearPwd(){
        $("#nloginpwd").val("");
        $('#nloginpwd').siblings('.clear-btn').hide();
    }

    function assemblyForm(){

    }
    window.loginSubmit=loginSubmit;
    window.assemblyForm=assemblyForm;
    window.showAuthCode=showAuthCode;
})();