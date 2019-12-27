import { Component, OnInit, AfterViewInit } from '@angular/core';

import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';

import {FormControl, FormGroup} from '@angular/forms';

// Service
//import { DynamicScriptLoaderService } from '../../core/services/dynamic-script-loader.service';

//import { FirestoreService } from '../../services/firestore/firestore.service';

declare var jQuery: any;
declare var $: any;
//declare var cargaInicial: any;
declare var recargar: any;
//declare var consulta: any;
//declare var cargarCobertura: any;
declare var genera_tabla_asistencia: any;
declare var eliminarContenidoTabla: any;
declare var cargarListadoClientes: any;
declare var mostrarCubrimiento: any;
declare var cargaInicialAsistencia: any;
declare var crearFilaNuevaAsistencia: any;



@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})

export class ControlComponent implements OnInit, AfterViewInit {

  public form;
  bsValue: Date = new Date();
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  locale = 'es';
  public visual;
  public date;
  public cliente;
  public objetivo;

  constructor(
  ) { }

  ngOnInit() {

    this.bsConfig = Object.assign({}, {
      minMode : this.minMode
    });
      //$("table").tableExport();
      $('.box').boxWidget();
      //genera_tabla();
    this.form = new FormGroup({
      visual: new FormControl('dias25'),
      cliente: new FormControl('Seleccione un Cliente'),
      objetivo: new FormControl('Seleccione un Objetivo'),
      date: new FormControl(''),
      range: new FormControl('')
    });

    cargarListadoClientes();
    genera_tabla_asistencia();
    cargaInicialAsistencia();

  }

  onSubmit() {
    let cliente = this.form.get('cliente').value;
    let objetivo = this.form.get('objetivo').value;
    this.visual = this.form.get('visual').value;
    this.date = this.form.get('date').value;
    let range = this.form.get('range').value;

    this.cliente=cliente;
    this.objetivo=objetivo;

    eliminarContenidoTabla();

    if(this.visual == "mensual" || this.visual == "dias25"){
      mostrarCubrimiento(cliente,objetivo,this.visual,this.date,range);
    }
  }

  cargarFila(){
    crearFilaNuevaAsistencia("DIA","Tienda 143","Puesto 1 - TD","08:30","9:15","BRUN, Santiago","CUBIERTO");
  }

  ngAfterViewInit() {
    //this.loadScripts();
    //cargaInicial("DIA","TIENDA 143");
    //consulta();
    //cargarCobertura();
  }

  // private loadScripts() {
    // You can load multiple scripts by just providing the key as argument into load method of the service
    //this.dynamicScriptLoader.load('cobertura','cubrimiento').then(data => {
      // Script Loaded Successfully
      //cargaInicial();
      //$('.box').boxWidget();
  //   }).catch(error => console.log(error));
  // }

  private onClick(){
    recargar();
    console.log("Carga Inicial");
  }

}
