import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

//import * as $ from 'jquery';
declare var jQuery: any;
declare var $: any;
declare var toggleAccordion: any;
declare var cargarListadoClientes: any;
declare var cargarDatePicker: any;

//declare var datepicker: any; // Declaro la funcion datepicker


@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  constructor(){ }

  ngOnInit(){
    cargarListadoClientes();
    $('.box').boxWidget();
    cargarDatePicker(); // Bootstrap Datepicker
    toggleAccordion();
  }

}
