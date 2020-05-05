
//Carga Inicial

let idClienteMostrar;

function listadoClientesClient(){
  let listadoClientes = [];
  db.collection("clientes").where("vigente","==",true)
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        let item = {
          nc : doc.data().nombreCliente,
          rs : doc.data().razonSocial,
        };
        listadoClientes.push(item);
      });
      desplegableClientesClient(listadoClientes);
    });
    //Se cargan los listados de los select departamento, localidades
    //cargarDepartamentos();
}

function desplegableClientesClient(listadoClientes){
  var datalist = document.getElementById("dataListClient");
  listadoClientes.forEach(function(item){
     var option = document.createElement("option");
     option.text = item.rs;
     option.value = item.nc;
     datalist.appendChild(option);
  });
}

function formatoCuit(){
  let cleave = new Cleave('.input-element', {
    delimiter: '-',
    blocks: [2, 8, 1],
    uppercase: true
    });
}

// Fin Carga Inicial

// Funciones Tab Datos Basicos

function mostrarCliente(){

  let cliente = $("#cliente").val();
  idClienteMostrar="";

  db.collection("clientes").where("nombreCliente","==",cliente)
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty){
      console.log("No se econtro el Cliente");
    } else {
      querySnapshot.forEach(function(doc){

        idClienteMostrar = doc.id;
        let calle = doc.data().domicilio.calle;
        let nroPuerta = doc.data().domicilio.nroPuerta;
        let localidad = doc.data().domicilio.localidad;
        let departamento = doc.data().domicilio.departamento;
        let provincia = doc.data().domicilio.provincia;
        let pais = doc.data().domicilio.pais;

        $("#nombreCliente").val(doc.data().nombreCliente);
        $("#cuit").val(doc.data().cuit);
        $("#razonSocial").val(doc.data().razonSocial);
        $("#pais").val(pais);
        $("#provincia").val(provincia);
        $("#departamento").val(departamento);
        $("#localidad").val(localidad);
        $("#calle").val(calle);
        $("#nroPuerta").val(nroPuerta);
        $("#piso").val(doc.data().domicilio.piso);
        $("#depto").val(doc.data().domicilio.depto);
        $("#cp").val(doc.data().domicilio.cp);

        if(doc.data().coordenadas!=undefined && doc.data().coordenadas!=""){
          console.log("entro a coordenadas desde inicio");
          let lat = doc.data().coordenadas.lat;
          let lon = doc.data().coordenadas.lon;
          $("#lat").val(lat);
          $("#lon").val(lon);
          $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
          $("#checkCoordenadas").prop("checked", true);
        } else {

          if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
            provincia="CABA";
          }
          $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+calle+nroPuerta+localidad+departamento+provincia+pais+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
        }

        $("#tab-cliente").show(300);

      });
    }
  }).
  catch(function(error){
    console.log("Error al buscar Cliente",error);
  });


}

function modificarDatosCliente(){

  $("#nombreCliente").prop("readonly",false);
  $("#razonSocial").prop("readonly",false);
  $("#cuit").prop("readonly",false);
  $("#pais").prop("readonly",false);
  $("#provincia").prop("readonly",false);
  $("#departamento").prop("readonly",false);
  $("#localidad").prop("readonly",false);
  $("#calle").prop("readonly",false);
  $("#nroPuerta").prop("readonly",false);
  $("#piso").prop("readonly",false);
  $("#depto").prop("readonly",false);
  $("#cp").prop("readonly",false);
  $("#lat").prop("readonly",false);
  $("#lon").prop("readonly",false);
  $("#checkCoordenadas").prop("disabled", false);
  $("#btnGuardarCliente").prop("disabled", false);

  cargarProvincia();

  cargarDepartamentos();

  cargarLocalidades();

  cargarCalles();

}

function guardarCambiosCliente(){

  $("#nombreCliente").prop("readonly",true);
  $("#razonSocial").prop("readonly",true);
  $("#cuit").prop("readonly",true);
  $("#pais").prop("readonly",true);
  $("#provincia").prop("readonly",true);
  $("#departamento").prop("readonly",true);
  $("#localidad").prop("readonly",true);
  $("#calle").prop("readonly",true);
  $("#nroPuerta").prop("readonly",true);
  $("#piso").prop("readonly",true);
  $("#depto").prop("readonly",true);
  $("#cp").prop("readonly",true);
  $("#lat").prop("readonly",true);
  $("#lon").prop("readonly",true);
  $("#checkCoordenadas").prop("disabled", true);
  $("#btnGuardarCliente").prop("disabled", true);

  let nombreCliente = $("#nombreCliente").val();
  let razonSocial = $("#razonSocial").val();
  let cuit = $("#cuit").val();

  let domicilio = {
    pais : $("#pais").val(),
    provincia : $("#provincia").val(),
    departamento : $("#departamento").val(),
    localidad : $("#localidad").val(),
    calle : $("#calle").val(),
    nroPuerta : $("#nroPuerta").val(),
    piso : $("#piso").val(),
    depto : $("#depto").val(),
    cp : $("#cp").val(),
  }

  let coordenadas="";

  if($("#checkCoordenadas").prop('checked')){
    coordenadas = {
      lat : $("#lat").val(),
      lon : $("#lon").val(),
    }
  }

  if(idClienteMostrar!=""){

    db.collection("clientes").doc(idClienteMostrar)
    .update({ nombreCliente : nombreCliente,
              razonSocial : razonSocial,
              cuit : cuit,
              domicilio : domicilio,
              coordenadas : coordenadas,
    })
    .then(function(){
      console.log("Datos guardados correctamente");
      mensajeOk();
    })
    .catch(function(){
      console.log("Error al actualizar el Cliente");
    });

  }

}

function checkCoordenadas(){
  $("#checkCoordenadas").change(function(){
    if($(this).is(':checked')) {
        // Checkbox is checked..
        let lat = $("#lat").val();
        let lon = $("#lon").val();
        $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    } else {
        // Checkbox is not checked..
        let provincia="";
        if($("#provincia").val()=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
          provincia="CABA";
        } else {
          provincia=$("#provincia").val();
        }

        $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#calle").val()+" "+$("#nroPuerta").val()
        +" "+$("#localidad").val()+" "+$("#departamento").val()+" "+provincia+" "+$("#pais").val()+" "+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    }
  });
}

function cargarCoordDomicilio(){
  let provincia="";
  if($("#provincia").val()=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
    provincia="CABA";
  } else {
    provincia=$("#provincia").val();
  }

  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#calle").val()+$("#nroPuerta").val()
  +$("#localidad").val()+$("#departamento").val()+provincia+$("#pais").val()+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
}

function cargarCoordenadas(){
  if($("#checkCoordenadas").is(':checked')) {
      // Checkbox is checked..
      let lat = $("#lat").val();
      let lon = $("#lon").val();
      $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }
}

function cargarProvincia(){

  fetch("https://apis.datos.gob.ar/georef/api/provincias?&orden=nombre")
    .then(res => res.json())
    .then((out) => {
        desplegableProvincia(out.provincias);
    }).catch(err => console.error(err));

}

function desplegableProvincia(listaProvincias){

  let datalist = document.getElementById("dataListPcia");

  $("#dataListPcia").empty();

  listaProvincias.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarDepartamentos(){

  let provincia = $("#provincia").val();

  if(provincia!=""){
    fetch("https://apis.datos.gob.ar/georef/api/departamentos?provincia="+provincia+"&orden=nombre&max=150&exacto=true")
      .then(res => res.json())
      .then((out) => {
          desplegableDepartamentos(out.departamentos);
      }).catch(err => console.error(err));
  } else {
    console.log("Falta ingresar la provincia o departamento");
    mensajeErrorShow(0);
  }

}

function desplegableDepartamentos(listaDepartamentos){

  let datalist = document.getElementById("dataListDepto");

  $("#dataListDepto").empty();

  listaDepartamentos.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarLocalidades(){

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    fetch("https://apis.datos.gob.ar/georef/api/localidades?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=150&exacto=true")
      .then(res => res.json())
      .then((out) => {
        if(out.localidades.length==0){
          console.log("No existen localidades con esta combinacion de provincia y departamento");
          mensajeErrorShow(1);
        } else {
          mensajeErrorHide();
          desplegableLocalidades(out.localidades);
        }

      }).catch(err => console.error(err));
  } else {
    console.log("Falta ingresar la provincia o departamento");
    mensajeErrorShow(0);
  }

}

function desplegableLocalidades(listaLocalidades){

  let datalist = document.getElementById("dataListLocal");

  $("#dataListLocal").empty();

  listaLocalidades.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarCalles(){

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    fetch("https://apis.datos.gob.ar/georef/api/calles?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=1000&exacto=true")
      .then(res => res.json())
      .then((out) => {
          if(out.calles.length==0){
            console.log("No existen calles con esta combinacion de provincia y departamento");
            mensajeErrorShow(1);
          } else {
            mensajeErrorHide();
            desplegableCalles(out.calles);
          }

      }).catch(err => console.error(err));
  } else {
    console.log("Falta ingresar la provincia o departamento");
    mensajeErrorShow(0);
  }

}

function desplegableCalles(listadoCalles){

  let datalist = document.getElementById("dataListCalles");

  $("#dataListCalles").empty();

  listadoCalles.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });
}

function mensajeErrorShow(error){
  if (error==0){
    $("#mensajeError").text('Falta ingresar la provincia o departamento');
    $("#mensajeError").show(300);
  } else if (error==1){
    $("#mensajeError").text('No existen localidades ni calles con esta combinacion de provincia y departamento');
    $("#mensajeError").show(300);
  }

}

function cargarDeptoLocalCalles(){
  cargarDepartamentos();
  cargarLocalidades();
  cargarCalles();
}

function cargarLocalCalles(){
  cargarLocalidades();
  cargarCalles();
}

function mensajeErrorHide(){
  $("#mensajeError").hide(300);
}

function mayus(str) {
    return str.toUpperCase();
}

// Fin Funciones Tab Datos Basicos
