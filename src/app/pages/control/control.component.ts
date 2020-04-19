import { Component, OnInit, AfterViewInit } from '@angular/core';

import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';

import {FormControl, FormGroup} from '@angular/forms';

declare var jQuery: any;
declare var $: any;
//declare var recargar: any;
declare var generarTablaAsistencia: any;
//declare var eliminarContenidoTabla: any;
declare var listadoClientesAsistencia: any;
//declare var mostrarCubrimiento: any;
// declare var cargarResizeSensor: any;
// declare var equalHeight: any;
declare var cargarBSDateTimePicker: any;

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})

export class ControlComponent implements OnInit {

  public form;
  bsValue: Date = new Date();
  minMode: BsDatepickerViewMode = 'month';
  bsConfig: Partial<BsDatepickerConfig>;
  locale = 'es';
  public visual;
  public date;
  public cliente;
  public objetivo;


  ngOnInit() {

    this.bsConfig = Object.assign({}, {
      minMode : this.minMode
    });
      $('.box').boxWidget();

    this.form = new FormGroup({
      visual: new FormControl('dias25'),
      cliente: new FormControl('Seleccione un Cliente'),
      objetivo: new FormControl('Seleccione un Objetivo'),
      date: new FormControl(''),
      range: new FormControl('')
    });

    listadoClientesAsistencia();
    generarTablaAsistencia();
    cargarBSDateTimePicker();

  }

}
