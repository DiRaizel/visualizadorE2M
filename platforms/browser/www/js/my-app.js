//-----------------------------Reloj en vivo------------------------------------
//
var reloj = '';
var reloj2 = '';
//
function show5() {
    if (!document.layers && !document.all && !document.getElementById)
        return;

    var Digital = new Date();
    var hours = Digital.getHours();
    var minutes = Digital.getMinutes();
    var seconds = Digital.getSeconds();

    var dn = "PM";
    if (hours < 12)
        dn = "AM";
    if (hours > 12)
        hours = hours - 12;
    if (hours == 0)
        hours = 12;

    if (hours <= 9)
        hours = "0" + hours;
    if (minutes <= 9)
        minutes = "0" + minutes;
    if (seconds <= 9)
        seconds = "0" + seconds;
    //change font size here to your desire
//    myclock = hours + ":" + minutes + ":" + seconds + " " + dn;
    myclock = hours + ":" + minutes + " " + dn;
    myclock2 = hours + ":" + minutes + ':' + seconds;
    if (document.layers) {
        document.layers.liveclock.document.write(myclock);
        document.layers.liveclock.document.close();
    } else if (document.all) {
        reloj = myclock;
        reloj2 = myclock2;
    } else if (document.getElementById) {
        reloj = myclock;
        reloj2 = myclock2;
        setTimeout("show5()", 1000);
    }
}

//-----------------------------------App----------------------------------------

//
var app = new Framework7({
    // App root element
    root: '#visualizadorE2M',
    // App Name
    name: 'visualizadorE2M',
    // App id
    id: 'com.visualizadorE2M',
    // Enable swipe panel
    panel: {
        swipe: 'left'
    },
    // Add default routes
    routes: [{
            path: '/home/',
            url: 'home.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                    cargarLlamados(1);
                }
            }
        },
        {
            path: '/login/',
            url: 'index.html',
            on: {
                pageAfterIn: function () {
                    // do something after page gets into the view
                },
                pageInit: function () {
                    // do something when page initialized
                }
            }
        }
    ],
    lazy: {
        threshold: 50,
        sequential: false
    }
    // ... other parameters
});

//
var $$ = Dom7;

//
var mainView = app.views.create('.view-main');

//
//var urlServidor = 'http://167.71.248.182/visualizadorE2Php/';
var urlServidor = '';
//var urlServidor = 'http://192.168.1.103/visualizadorE2Php/';

//
document.addEventListener('deviceready', function () {
    //
    setTimeout("show5()", 1000);
    //
    if (localStorage.ipServidor === undefined) {
        //
        app.dialog.prompt('', 'Ip Servidor?', function (ip) {
            //
            localStorage.ipServidor = ip;
            urlServidor = 'http://' + ip + '/visualizadorE2Php/';
        });
    } else {
        //
        urlServidor = 'http://' + localStorage.ipServidor + '/visualizadorE2Php/';
    }
    //
//    setInterval(function () {
//        //
//        cargarCicloLlamados();
//    }, 1000);
//    //
//    setInterval(function () {
//        //
//        cargarLlamados(2);
//    }, 10000);
    //
    if (localStorage.idUsu !== undefined) {
        //
        $$('#btnHomeMenu').css('display', '');
        $$('#btnCerrarSesionMenu').css('display', '');
        app.views.main.router.navigate('/home/');
        //
    } else {
        //
        $$('#btnHomeMenu').css('display', 'none');
        $$('#btnCerrarSesionMenu').css('display', 'none');
    }
}, false);

//
function editarIpServidor() {
    //
    app.dialog.prompt('', 'Ip servidor', function (ip) {
        //
        localStorage.ipServidor = ip;
        urlServidor = 'http://' + ip + '/visualizadorE2Php/';
    });
}

//
function conectarMqtt(valor, valor2) {
    //
    cordova.plugins.CordovaMqTTPlugin.connect({
        url: 'tcp://165.227.89.32', //a public broker used for testing purposes only. Try using a self hosted broker for production.
        port: '1883',
        clientId: 'com.visualizadorE2M' + valor,
        willTopicConfig: {
            qos: 0, //default is 0
            retain: false, //default is true
            topic: "visualizadorE2M/notificaciones" + valor2,
            payload: ""
        },
        username: "fabian",
        password: '1234',
        success: function (s) {
            //
            if (localStorage.subscrito === 'subscrito') {
                //
                subscribirse(valor2);
            }
        },
        error: function (e) {
//            console.log('error: ' + e);
        },
        onConnectionLost: function (e) {
//            console.log('conexion perdida: ' + e);
        }
    });
}

//
function subscribirse(valor) {
    //
    cordova.plugins.CordovaMqTTPlugin.subscribe({
        topic: 'visualizadorE2M/notificaciones' + valor,
        qos: 0,
        success: function (s) {
            //
            cordova.plugins.CordovaMqTTPlugin.listen("visualizadorE2M/notificaciones" + valor, function (payload, params) {
                //
                if (payload !== '' && payload !== null && payload !== undefined) {
                    //

                }
            });
        },
        error: function (e) {
            //alert("err!! something is wrong. check the console")
        }
    });
}

//
function desubscribirse(valor) {
    //
    cordova.plugins.CordovaMqTTPlugin.unsubscribe({
        topic: 'visualizadorE2M/notificaciones' + valor,
        success: function (s) {
            //
        },
        error: function (e) {
            //
        }
    });
}

//----------------------------------Login---------------------------------------

//
function login() {
    //
    var formElement = document.getElementById("formLogin");
    formData = new FormData(formElement);
    //
    app.request({
        url: urlServidor + 'Read/login',
        data: formData,
        method: "POST",
        beforeSend: function () {
            //
            app.preloader.show();
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            if (data.estado == 'Entra') {
                //
                localStorage.idUsu = data.idUsu;
                localStorage.identificacion = data.identificacion;
                localStorage.nombres = data.nombres;
                localStorage.apellidos = data.apellidos;
                localStorage.rol = data.rol;
                localStorage.estado = data.estadoUsu;
                localStorage.usuario = data.usuario;
                //
                $$('#btnHomeMenu').css('display', '');
                $$('#btnCerrarSesionMenu').css('display', '');
                //
                app.preloader.hide();
                //
                app.views.main.router.navigate('/home/');
//                }
            } else {
                //
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'El correo ingresado no se encuentra registrado o la contraseña es incorrecta.',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        },
        error: function (xhr, e) {
            app.preloader.hide();
            console.log(xhr);
//            alert(JSON.stringify(xhr) + ' _ ' + JSON.stringify(e) + ' ' + $$('#correo').val() + ' - ' + $$('#password').val());
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
        }
    });
}

//
function cerrarSesion() {
    //
    delete localStorage.idUsu;
    delete localStorage.identificacion;
    delete localStorage.nombres;
    delete localStorage.apellidos;
    delete localStorage.rol;
    delete localStorage.estado;
    delete localStorage.usuario;
    //
    $$('#btnHomeMenu').css('display', 'none');
    $$('#btnCerrarSesionMenu').css('display', 'none');
    //
    app.views.main.router.navigate('/login/');
}

//
function recuperarPass() {
    //
    app.dialog.prompt('Ingresa el correo', 'Atención!', function (correo) {
        //
        app.request({
            url: urlServidor + 'Read/recuperarPass',
            data: {correo: correo},
            method: "POST",
            beforeSend: function () {
                //
                app.preloader.show();
            },
            success: function (rsp) {
                //
                app.preloader.hide();
                //
                if (rsp == 'Enviado') {
                    //
                    app.preloader.hide();
                    //
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'La contraseña ha sido enviada al correo ingresado!',
                        buttons: [{text: 'OK'}]
                    }).open();
                } else {
                    //
                    modal = app.dialog.create({
                        title: 'Atención!',
                        text: 'El correo ingresado no se encuentra registrado!',
                        buttons: [{text: 'OK'}]
                    }).open();
                }
            },
            error: function (xhr, e) {
                app.preloader.hide();
                modal = app.dialog.create({
                    title: 'Atención!',
                    text: 'Error de conexión!',
                    buttons: [{text: 'OK'}]
                }).open();
            }
        });
    });
}

//---------------------------------Home-----------------------------------------

//
var arrayL = [];

//
function cargarLlamados(valor) {
    //
    app.request({
        url: urlServidor + 'Read/cargarLlamados',
        data: {},
        method: "post",
        beforeSend: function () {
            //
            if (valor === 1) {
                //
                app.preloader.show();
            }
        },
        success: function (rsp) {
            //
            var data = JSON.parse(rsp);
            //
            arrayL = data;
        },
        error: function (xhr) {
            console.log(xhr);
            app.preloader.hide();
            modal = app.dialog.create({
                title: 'Atención!',
                text: 'Error de conexión!',
                buttons: [{text: 'OK'}]
            }).open();
            setTimeout("cargarLlamados(2)", 10000);
        },
        complete: function () {
            //
            setTimeout(function () {
                //
                app.preloader.hide();
                cargarCicloLlamados();
            }, 500);
            setTimeout("cargarLlamados(2)", 10000);
        }
    });
}

//
function cargarCicloLlamados() {
    //
    var campos = '';
    //
    if (arrayL.length > 0) {
        //
        campos = '<li style="text-align: center; padding-top: 10px;"><h4 style="margin: 0px;">Llamados</h4></li>';
        //
        for (var i = 0; i < arrayL.length; i++) {
            //
            var colorRow = '';
            //
            if (arrayL[i]['modulo'] === 'Cod. Azul') {
                //
                colorRow = 'rowList2';
            } else {
                //
                colorRow = 'rowList';
            }
            //
            var tiempoLlamado = '';
            //
            if (arrayL[i]['hora'] === reloj2) {
                //
                tiempoLlamado = '0s';
            } else {
                //
                var hora1 = (reloj2).split(":");
                var hora2 = (arrayL[i]['hora']).split(":");
                var t1 = new Date();
                var t2 = new Date();
                //
                t1.setHours(hora1[0], hora1[1], hora1[2]);
                t2.setHours(hora2[0], hora2[1], hora2[2]);
                //Aquí hago la resta
                t1.setHours(t1.getHours() - t2.getHours(), t1.getMinutes() - t2.getMinutes(), t1.getSeconds() - t2.getSeconds());
                //
                tiempoLlamado = (t1.getHours() ? t1.getHours() + (t1.getHours() > 1 ? "h" : "h") : "") + (t1.getMinutes() ? " " + t1.getMinutes() + (t1.getMinutes() > 1 ? "m" : "m") : "") + (t1.getSeconds() ? (t1.getHours() || t1.getMinutes() ? " " : "") + t1.getSeconds() + (t1.getSeconds() > 1 ? "s" : "s") : "");

            }
            //
            campos += '<li  class="' + colorRow + '">';
            campos += '<div class="item-content">';
//                    campos += '<div class="item-media"><img src="img/imgList.png" width="45"/></div>';
            campos += '<div class="item-inner">';
            campos += '<div class="item-title-row">';
            campos += '<div class="item-title">' + arrayL[i]['modulo'] + ' - ' + tiempoLlamado + '</div>';
            campos += '</div>';
            campos += '<div class="item-subtitle">' + arrayL[i]['tipo'] + '</div>';
            campos += '</div></div></li>';
        }
        //
    } else {
        //
        campos = '<li style="text-align: center;"><h3>No hay llamados</h3></li>';
    }
    //
    $$('#encuestados').html(campos);
    //
    setTimeout("cargarCicloLlamados()", 1000);
}