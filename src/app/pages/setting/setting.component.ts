import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

//import * as $ from 'jquery';
declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesSetting: any;

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  constructor(){ }

  ngOnInit(){
    inicializarFuncionesSetting();
  }

}
