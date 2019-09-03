var socket = io.connect('http://localhost:8000', {'forceNew':true});

//recibir mensajes
socket.on('datos_usuarios', function(data){
    //console.log(data);
    render(data);
});


//resultado_de_emailS
socket.on('resultado_de_email', function(data){
    //console.log(data);
    render_resultado_email(data);
});

//mostrar datos de gmail
socket.on('datos_email', function(data){
    //console.log(data);
    render_email(data);
});

socket.on('registros_archivados', function(data){
    //console.log(data);
    render_registros_archivados(data);
});


//registros_eliminados
socket.on('registros_eliminados', function(data){
    //console.log('holllllllllllllllllaaa')
    render_registros_eliminados(data);
});

function render_resultado_email (data){
    alert(data);
}


function render_registros_eliminados(data){
    var html = data.map(function(datos_de_gmail){
        $("#tabla_eliminados tr").remove();
        //console.log(datos_de_gmail)
        return(`
        <tr id="${datos_de_gmail.index}" class="bandeja" >
            <td style="width:25%; padding-left:10px; padding: 10px;">${datos_de_gmail.From}</td>
            <td style="width:75%; padding-left:10px; padding: 10px;">${datos_de_gmail.Subject} </td>

        </tr>
            `);
        
    }).join(' ');

    $("#tabla_eliminados").append(html);
}

function render_registros_archivados(data){
    var html = data.map(function(datos_de_gmail){
        $("#tabla_adjuntos tr").remove();
        //console.log(datos_de_gmail)
        return(`
        <tr id="${datos_de_gmail.index}" class="bandeja" >
            <td style="width:25%; padding-left:10px; padding: 10px;">${datos_de_gmail.From}</td>
            <td style="width:75%; padding-left:10px; padding: 10px;">${datos_de_gmail.Subject} </td>

        </tr>
            `);
        
    }).join(' ');

    $("#tabla_adjuntos").append(html);
}

function render_email (data){
    var html = data.map(function(datos_de_gmail){
        //console.log(datos_de_gmail)
        return(`
        <tr id="${datos_de_gmail.index}" class="bandeja" >
            <td style="width:25%; padding-left:10px;">${datos_de_gmail.From}</td>
            <td style="width:65%; padding-left:10px;">${datos_de_gmail.Subject} </td>
            <td style="width:5%;">
                <a class="btn pull-rigth borrar" align="right" title="ARCHIVAR" onclick="obtenerDatos(${datos_de_gmail.index})"><i class="fas fa-folder-minus"></i></a> 
            </td>
            <td style="width:5%;">
                <a class="btn pull-rigth borrar" align="right" title="ELIMINAR" onclick="obtenerDatosEliminados(${datos_de_gmail.index})"><i class="fas fa-trash-alt" ></i></a>
            </td>
        </tr>

            `);
        
    }).join(' ');

    $("#tabla").append(html);
}

var filas = {};
var filas_eliminados = {};

function obtenerDatos(id){
    console.log(id);
    filas['From'] = document.getElementById(id).cells[0].innerHTML;
    filas['Subject'] = document.getElementById(id).cells[1].innerHTML;

    console.log(filas);            
    console.log('---------------');
    socket.emit('adjuntar_en_archivar', filas);
    return false;
    
}

function obtenerDatosEliminados(id){
    console.log(id);
    filas_eliminados['From'] = document.getElementById(id).cells[0].innerHTML;
    filas_eliminados['Subject'] = document.getElementById(id).cells[1].innerHTML;

    console.log(filas_eliminados);            
    console.log('---------------');
    socket.emit('adjuntar_en_eliminados', filas_eliminados);
    return false;
    
}

function render (data){
    var html = data.map(function(usuario){
        //console.log(usuario)
        if( `${usuario.imagen}` == 'undefined'){
            return(`
            <div class="message">
                <p> <img src="user.png" id="imagen_cargada" > </p>
                <br>
                <p id="alias"><strong> ${usuario.alias} </strong></p>
            </div>
            `);
        }else{

            return(`
                <div class="message">
                    <p> <img src="${usuario.imagen}" id="imagen_cargada"> </p>
                    <br>
                    <p id="alias"><strong> ${usuario.alias} </strong></p>
                </div>
                `);          
        }
        
    }).join(' ');

    var div_msgs = document.getElementById('mensajes');
    div_msgs.innerHTML = html;
    div_msgs.scrollTop = div_msgs.scrollHeight;
}

function addMessage(e){
    var nombre_imagen = document.getElementById('imagen').value;
    nombre_imagen = nombre_imagen.split("\\");

    var usuario =  {
        alias: document.getElementById('user').value,
        imagen: '' + nombre_imagen[2]
        //imagen: 'http://172.30.184.226:6677/' + nombre_imagen[2]
    };
    
    //document.getElementById('nickname').style.display='none';
    //document.getElementById('imagenes').style.display='none';
    //document.getElementById('label_imagen').style.display='none';

    socket.emit('add_mensaje', usuario);
    return false;
}

function addEmail(e){
    var to = document.getElementById('email').value;
    var asunto = document.getElementById('asunto').value;
    var texto = document.getElementById('text').value;

    var correo =  {
        from: 'eljaya_est@utmachala.edu.ec',
        to: to,
        subject: asunto,
        text: texto
    };
    //console.log(correo);
    
    //document.getElementById('nickname').style.display='none';
    //document.getElementById('imagenes').style.display='none';
    //document.getElementById('label_imagen').style.display='none';

    socket.emit('add_email', correo);
    return false;
}
