import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

//import * as $ from 'jquery';
declare var jQuery: any;
declare var $: any;
declare var toggleAccordion: any;
declare var listadoClientesEsquema: any;
declare var cargarListadoClientes2: any;
declare var cargarTodosDatePicker: any;

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  constructor(){ }

  ngOnInit(){
    listadoClientesEsquema();
    cargarListadoClientes2();
    $('.box').boxWidget();
    toggleAccordion();
    cargarTodosDatePicker();
  }

}
